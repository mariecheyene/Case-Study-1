import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Table, Form, Button, Row, Col, InputGroup, Collapse } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import html2canvas from "html2canvas";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement
);

const API_URL = "http://localhost:5000/residents";

const PurokManagement = () => {
  const [purokData, setPurokData] = useState([]);
  const [filteredPurokData, setFilteredPurokData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    fetchPurokData();
  }, []);

  const fetchPurokData = async () => {
    try {
      const response = await axios.get(`${API_URL}`);
      const residents = response.data;

      const purokMap = residents.reduce((acc, resident) => {
        const purokNumber = resident.purokNumber;

        if (!acc[purokNumber]) {
          acc[purokNumber] = {
            totalResidents: 0,
            households: new Set(),
            employed: 0,
            registeredVoters: 0,
          };
        }

        acc[purokNumber].totalResidents += 1;
        acc[purokNumber].households.add(resident.householdNumber);

        if (resident.employmentStatus === "Employed") {
          acc[purokNumber].employed += 1;
        }

        if (resident.votersStatus === "Registered") {
          acc[purokNumber].registeredVoters += 1;
        }

        return acc;
      }, {});

      const purokArray = Object.entries(purokMap)
        .map(([purokNumber, data]) => ({
          purokNumber,
          totalResidents: data.totalResidents,
          households: Array.from(data.households),
          employed: data.employed,
          employmentRate: ((data.employed / data.totalResidents) * 100).toFixed(2),
          registeredVoters: data.registeredVoters,
        }))
        .sort((a, b) => a.purokNumber - b.purokNumber);

      setPurokData(purokArray);
      setFilteredPurokData(purokArray);
    } catch (error) {
      console.error("Error fetching purok data:", error);
      toast.error("Failed to fetch purok data");
    }
  };

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    const filteredData = purokData.filter((purok) =>
      purok.purokNumber.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredPurokData(filteredData);
  };

  const handleSort = () => {
    const sortedData = [...filteredPurokData].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.totalResidents - b.totalResidents;
      } else {
        return b.totalResidents - a.totalResidents;
      }
    });
    setFilteredPurokData(sortedData);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleGenerateReport = async () => {
    const reportData = generateReportData(purokData);
    await exportReportToPDF(reportData);
  };

  const generateReportData = (purokData) => {
    const maxResidents = Math.max(...purokData.map((purok) => purok.totalResidents));
    const mostPopulatedPuroks = purokData.filter(
      (purok) => purok.totalResidents === maxResidents
    );

    const maxHouseholds = Math.max(...purokData.map((purok) => purok.households.length));
    const puroksWithMostHouseholds = purokData.filter(
      (purok) => purok.households.length === maxHouseholds
    );

    const employmentRatePerPurok = purokData.map((purok) => ({
      purokNumber: purok.purokNumber,
      employmentRate: purok.employmentRate,
    }));

    const voterRegistrationPerPurok = purokData.map((purok) => ({
      purokNumber: purok.purokNumber,
      registeredVoters: purok.registeredVoters,
    }));

    return {
      mostPopulatedPuroks,
      puroksWithMostHouseholds,
      employmentRatePerPurok,
      voterRegistrationPerPurok,
    };
  };

  const exportReportToPDF = async (reportData) => {
    const pdf = new jsPDF("landscape");
  
    // Add title
    pdf.setFontSize(18);
    pdf.text("Barangay Acmac - Purok Management Report", 10, 10);
  
    // Add most populated purok(s)
    pdf.setFontSize(12);
    pdf.text(
      `Most Populated Purok(s): ${reportData.mostPopulatedPuroks
        .map((purok) => `Purok ${purok.purokNumber}`)
        .join(", ")}`,
      10,
      20
    );
  
    // Add purok(s) with most households
    pdf.text(
      `Purok(s) with Most Households: ${reportData.puroksWithMostHouseholds
        .map((purok) => `Purok ${purok.purokNumber}`)
        .join(", ")}`,
      10,
      30
    );
  
    // Add employment rate per purok
    pdf.text("Employment Rate per Purok:", 10, 40);
    reportData.employmentRatePerPurok.forEach((purok, index) => {
      pdf.text(
        `Purok ${purok.purokNumber}: ${purok.employmentRate}%`,
        10,
        50 + index * 10
      );
    });
  
    // Add voter registration per purok
    pdf.text("Voter Registration per Purok:", 10, 100);
    reportData.voterRegistrationPerPurok.forEach((purok, index) => {
      pdf.text(
        `Purok ${purok.purokNumber}: ${purok.registeredVoters} voters`,
        10,
        110 + index * 10
      );
    });
  
    // Convert charts to images and add to PDF
    const householdsChartImage = await html2canvas(document.querySelector("#householdsChart"));
    const employmentRateChartImage = await html2canvas(document.querySelector("#employmentRateChart"));
    const voterRegistrationChartImage = await html2canvas(document.querySelector("#voterRegistrationChart"));
  
    // Add charts to a new page in the PDF
    pdf.addPage();
    pdf.setFontSize(18);
    pdf.text("Purok Statistics Charts", 10, 10);
  
    // Add charts to the new page with proper spacing
    pdf.addImage(householdsChartImage.toDataURL("image/png"), "PNG", 10, 30, 80, 60);
    pdf.addImage(employmentRateChartImage.toDataURL("image/png"), "PNG", 100, 30, 80, 60);
    pdf.addImage(voterRegistrationChartImage.toDataURL("image/png"), "PNG", 190, 30, 80, 60);
  
    pdf.save("purok_management_report.pdf");
  };

  const householdsChartData = {
    labels: purokData.map((purok) => `Purok ${purok.purokNumber}`),
    datasets: [
      {
        label: "Households",
        data: purokData.map((purok) => purok.households.length),
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"],
      },
    ],
  };

  const employmentRateChartData = {
    labels: purokData.map((purok) => `Purok ${purok.purokNumber}`),
    datasets: [
      {
        label: "Employment Rate",
        data: purokData.map((purok) => purok.employmentRate),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"],
      },
    ],
  };

  const voterRegistrationChartData = {
    labels: purokData.map((purok) => `Purok ${purok.purokNumber}`),
    datasets: [
      {
        label: "Registered Voters",
        data: purokData.map((purok) => purok.registeredVoters),
        backgroundColor: ["#FFCE56", "#36A2EB", "#FF6384", "#4BC0C0", "#9966FF", "#FF9F40"],
      },
    ],
  };

  // Simplified tooltips
  const pieChartTooltip = {
    callbacks: {
      label: (context) => {
        const label = context.label || '';
        const value = context.raw || 0;
        return `${label}: ${value}%`;
      }
    }
  };

  const barChartTooltip = {
    callbacks: {
      label: (context) => {
        const label = context.dataset.label || "";
        const value = context.raw || 0;
        return `${label}: ${value}`;
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: "600", color: "#2c3e50" }}>
        🏘️ Purok Management
      </h2>
      <Row className="mb-3">
        <Col className="d-flex justify-content-center">
          <InputGroup style={{ maxWidth: "400px" }}>
            <InputGroup.Text style={{ backgroundColor: "#007bff", border: "none", borderRadius: "25px 0 0 25px", color: "#fff" }}>
              <i className="bx bx-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by Purok Number"
              value={searchTerm}
              onChange={handleSearch}
              style={{ border: "none", boxShadow: "none", backgroundColor: "#e9f5ff", borderRadius: "0 25px 25px 0", height: "38px" }}
            />
          </InputGroup>
        </Col>
        <Col className="d-flex justify-content-end align-items-center">
          <Button variant="secondary" onClick={handleSort} className="me-2" style={{ height: "38px", whiteSpace: "nowrap" }}>
            Sort Residents ({sortOrder === "asc" ? "↑" : "↓"})
          </Button>
          <Button variant="info" onClick={() => setShowCharts(!showCharts)} className="me-2" style={{ height: "38px", whiteSpace: "nowrap" }}>
            {showCharts ? 'Hide Charts' : 'Show Charts'}
          </Button>
          <Button variant="primary" onClick={handleGenerateReport} style={{ height: "38px", whiteSpace: "nowrap" }}>
            Generate PDF
          </Button>
        </Col>
      </Row>
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th style={{ width: "20%" }}>Purok</th>
              <th style={{ width: "20%" }}>Residents</th>
              <th style={{ width: "25%" }}>Households</th>
              <th style={{ width: "15%" }}>Employment %</th>
              <th style={{ width: "20%" }}>Voters</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurokData.map((purok) => (
              <tr key={purok.purokNumber}>
                <td>Purok {purok.purokNumber}</td>
                <td>{purok.totalResidents}</td>
                <td>
                  {purok.households.map((household, index) => (
                    <div key={index}>{household}</div>
                  ))}
                </td>
                <td>{purok.employmentRate}</td>
                <td>{purok.registeredVoters}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Charts Section */}
      <Collapse in={showCharts}>
        <div className="mt-5">
          <Row className="g-4">
            <Col md={4}>
              <div style={{ height: '300px' }}>
                <Bar
                  id="householdsChart"
                  data={householdsChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: 'Households per Purok',
                        font: { size: 16 }
                      },
                      legend: { display: false },
                      tooltip: barChartTooltip,
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                      },
                    },
                  }}
                />
              </div>
            </Col>
            
            <Col md={4}>
              <div style={{ height: '300px' }}>
                <Pie
                  id="employmentRateChart"
                  data={employmentRateChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: 'Employment Rate (%)',
                        font: { size: 16 }
                      },
                      tooltip: pieChartTooltip,
                    },
                  }}
                />
              </div>
            </Col>
            
            <Col md={4}>
              <div style={{ height: '300px' }}>
                <Bar
                  id="voterRegistrationChart"
                  data={voterRegistrationChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: 'Registered Voters',
                        font: { size: 16 }
                      },
                      legend: { display: false },
                      tooltip: barChartTooltip,
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                      },
                    },
                  }}
                />
              </div>
            </Col>
          </Row>
        </div>
      </Collapse>

      <ToastContainer />
    </div>
  );
};

export default PurokManagement;