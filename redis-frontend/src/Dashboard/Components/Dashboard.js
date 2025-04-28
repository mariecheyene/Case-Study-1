import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { Card, Row, Col, Container, Button, Collapse } from "react-bootstrap";
import { 
  FaUsers, 
  FaMapMarkerAlt, 
  FaHome, 
  FaChartBar, 
  FaVenus, 
  FaMars, 
  FaIdCard,
  FaUserShield,
  FaUserTie,
  FaUser
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = "http://localhost:5000/residents";
const USERS_API_URL = "http://localhost:5000/users";

const Dashboard = () => {
  const [residents, setResidents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    fetchResidents();
    fetchUsers();
  }, []);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setResidents(response.data);
    } catch (error) {
      console.error("Error fetching residents:", error);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(USERS_API_URL);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Helper functions for statistics
  const getTotalResidents = () => residents.length;
  const getTotalPuroks = () => new Set(residents.map(r => r.purokNumber)).size;
  const getTotalHouseholds = () => new Set(residents.map(r => r.householdNumber)).size;
  const getTotalMales = () => residents.filter(r => r.sex === "Male").length;
  const getTotalFemales = () => residents.filter(r => r.sex === "Female").length;
  const getTotalRegisteredVoters = () => residents.filter(r => r.votersStatus === "Registered").length;
  const getTotalUsers = () => users.length;
  const getTotalAdmins = () => users.filter(u => u.role === "admin").length;
  const getTotalOfficials = () => users.filter(u => u.role === "barangayOfficial").length;

  // Chart data functions
  const getResidentsPerPurok = () => {
    const purokCounts = residents.reduce((acc, resident) => {
      const purok = resident.purokNumber || "Unknown";
      acc[purok] = (acc[purok] || 0) + 1;
      return acc;
    }, {});
    
    const sortedKeys = Object.keys(purokCounts).sort((a, b) => a - b);
    
    return {
      labels: sortedKeys.map(key => `Purok ${key}`),
      datasets: [{
        label: "Residents",
        data: sortedKeys.map(key => purokCounts[key]),
        backgroundColor: [
          "#FF6B6B", "#4ECDC4", "#45B7D1", "#A37EBA", "#F7B801", 
          "#FF9F1C", "#2EC4B6", "#E71D36", "#FF9F1C", "#011627"
        ],
      }],
    };
  };

  const getAgeDistribution = () => {
    const ageGroups = { "0-5": 0, "6-12": 0, "13-18": 0, "19-35": 0, "36-59": 0, "60+": 0 };
    residents.forEach((resident) => {
      const age = resident.age || 0;
      if (age <= 5) ageGroups["0-5"]++;
      else if (age <= 12) ageGroups["6-12"]++;
      else if (age <= 18) ageGroups["13-18"]++;
      else if (age <= 35) ageGroups["19-35"]++;
      else if (age <= 59) ageGroups["36-59"]++;
      else ageGroups["60+"]++;
    });
    return {
      labels: Object.keys(ageGroups),
      datasets: [{
        label: "Age Distribution",
        data: Object.values(ageGroups),
        backgroundColor: [
          "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40",
        ],
      }],
    };
  };

  const getSexRatio = () => {
    const maleCount = residents.filter(r => r.sex === "Male").length;
    const femaleCount = residents.filter(r => r.sex === "Female").length;
    const total = maleCount + femaleCount;
    
    return {
      labels: [`Male (${maleCount})`, `Female (${femaleCount})`],
      datasets: [{
        label: "Sex Ratio",
        data: [maleCount, femaleCount],
        backgroundColor: ["#36A2EB", "#FF6384"],
      }],
    };
  };

  const getEmploymentStatusDistribution = () => {
    const employmentCounts = residents.reduce((acc, resident) => {
      const status = resident.employmentStatus || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const total = Object.values(employmentCounts).reduce((a, b) => a + b, 0);
    const labels = Object.keys(employmentCounts).map(key => 
      `${key} (${employmentCounts[key]} - ${((employmentCounts[key] / total) * 100).toFixed(1)}%)`
    );
    
    return {
      labels: labels,
      datasets: [{
        label: "Employment Status",
        data: Object.values(employmentCounts),
        backgroundColor: [
          "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
        ],
      }],
    };
  };

  const getEducationalAttainmentDistribution = () => {
    const educationCounts = residents.reduce((acc, resident) => {
      const education = resident.educationalAttainment || "Unknown";
      acc[education] = (acc[education] || 0) + 1;
      return acc;
    }, {});
    
    const total = Object.values(educationCounts).reduce((a, b) => a + b, 0);
    const labels = Object.keys(educationCounts).map(key => 
      `${key} (${educationCounts[key]} - ${((educationCounts[key] / total) * 100).toFixed(1)}%)`
    );
    
    return {
      labels: labels,
      datasets: [{
        label: "Educational Attainment",
        data: Object.values(educationCounts),
        backgroundColor: [
          "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40",
        ],
      }],
    };
  };

  const getVoterRegistration = () => {
    const registered = residents.filter(r => r.votersStatus === "Registered").length;
    const notRegistered = residents.length - registered;
    const total = residents.length;
    
    return {
      labels: [
        `Registered (${registered} - ${((registered / total) * 100).toFixed(1)}%)`,
        `Not Registered (${notRegistered} - ${((notRegistered / total) * 100).toFixed(1)}%)`
      ],
      datasets: [{
        label: "Voter Registration",
        data: [registered, notRegistered],
        backgroundColor: ["#36A2EB", "#FF6384"],
      }],
    };
  };

  // Custom tooltip callback
  const pieTooltip = {
    callbacks: {
      label: function(context) {
        const label = context.label || '';
        const value = context.raw || 0;
        const total = context.dataset.data.reduce((a, b) => a + b, 0);
        const percentage = ((value / total) * 100).toFixed(1);
        return `${label}: ${value} (${percentage}%)`;
      }
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4" style={{ 
        color: "#2c3e50", 
        fontWeight: "600",
        borderBottom: "2px solid #4ECDC4",
        paddingBottom: "10px"
      }}>
        Overview
      </h2>

      {/* Quick Stats Section */}
      <Row className="mb-4 g-4">
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm border-0" style={{ 
            background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
          }}>
            <Card.Body>
              <FaUsers size={40} className="mb-3" style={{ color: "#2c3e50" }} />
              <Card.Title style={{ color: "#2c3e50" }}>Total Residents</Card.Title>
              <Card.Text style={{ fontSize: "2rem", fontWeight: "bold", color: "#2c3e50" }}>
                {getTotalResidents()}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center h-100 shadow-sm border-0" style={{ 
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
          }}>
            <Card.Body>
              <FaMapMarkerAlt size={40} className="mb-3" style={{ color: "#2c3e50" }} />
              <Card.Title style={{ color: "#2c3e50" }}>Total Puroks</Card.Title>
              <Card.Text style={{ fontSize: "2rem", fontWeight: "bold", color: "#2c3e50" }}>
                {getTotalPuroks()}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center h-100 shadow-sm border-0" style={{ 
            background: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)"
          }}>
            <Card.Body>
              <FaHome size={40} className="mb-3" style={{ color: "#2c3e50" }} />
              <Card.Title style={{ color: "#2c3e50" }}>Total Households</Card.Title>
              <Card.Text style={{ fontSize: "2rem", fontWeight: "bold", color: "#2c3e50" }}>
                {getTotalHouseholds()}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center h-100 shadow-sm border-0" style={{ 
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          }}>
            <Card.Body>
              <FaIdCard size={40} className="mb-3" style={{ color: "#fff" }} />
              <Card.Title style={{ color: "#fff" }}>Registered Voters</Card.Title>
              <Card.Text style={{ fontSize: "2rem", fontWeight: "bold", color: "#fff" }}>
                {getTotalRegisteredVoters()}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Stats Section */}
      <Row className="mb-4 g-4">
        <Col md={4}>
          <Card className="text-center h-100 shadow-sm border-0" style={{ 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          }}>
            <Card.Body>
              <FaUserShield size={40} className="mb-3" style={{ color: "#fff" }} />
              <Card.Title style={{ color: "#fff" }}>Total Admins</Card.Title>
              <Card.Text style={{ fontSize: "2rem", fontWeight: "bold", color: "#fff" }}>
                {getTotalAdmins()}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="text-center h-100 shadow-sm border-0" style={{ 
            background: "linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)"
          }}>
            <Card.Body>
              <FaUserTie size={40} className="mb-3" style={{ color: "#fff" }} />
              <Card.Title style={{ color: "#fff" }}>Barangay Officials</Card.Title>
              <Card.Text style={{ fontSize: "2rem", fontWeight: "bold", color: "#fff" }}>
                {getTotalOfficials()}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="text-center h-100 shadow-sm border-0" style={{ 
            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          }}>
            <Card.Body>
              <FaUser size={40} className="mb-3" style={{ color: "#2c3e50" }} />
              <Card.Title style={{ color: "#2c3e50" }}>Total Users</Card.Title>
              <Card.Text style={{ fontSize: "2rem", fontWeight: "bold", color: "#2c3e50" }}>
                {getTotalUsers()}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gender Stats Section */}
      <Row className="mb-4 g-4">
        <Col md={6}>
          <Card className="text-center h-100 shadow-sm border-0" style={{ 
            background: "linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%)"
          }}>
            <Card.Body>
              <FaMars size={40} className="mb-3" style={{ color: "#fff" }} />
              <Card.Title style={{ color: "#fff" }}>Total Males</Card.Title>
              <Card.Text style={{ fontSize: "2rem", fontWeight: "bold", color: "#fff" }}>
                {getTotalMales()}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="text-center h-100 shadow-sm border-0" style={{ 
            background: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)"
          }}>
            <Card.Body>
              <FaVenus size={40} className="mb-3" style={{ color: "#2c3e50" }} />
              <Card.Title style={{ color: "#2c3e50" }}>Total Females</Card.Title>
              <Card.Text style={{ fontSize: "2rem", fontWeight: "bold", color: "#2c3e50" }}>
                {getTotalFemales()}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Toggle Button */}
      <Row className="mb-4">
        <Col>
          <Button
            variant="primary"
            onClick={() => setShowCharts(!showCharts)}
            aria-controls="charts-collapse"
            aria-expanded={showCharts}
            className="shadow"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              padding: "10px 20px",
              fontSize: "1.1rem"
            }}
          >
            <FaChartBar className="me-2" />
            {showCharts ? "Hide Analytics" : "Show Analytics"}
          </Button>
        </Col>
      </Row>

      {/* Charts Section */}
      <Collapse in={showCharts}>
        <div id="charts-collapse">
          <Row className="mb-4">
            <Col>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title style={{ color: "#2c3e50", fontWeight: "600" }}>
                    Residents per Purok
                  </Card.Title>
                  <div style={{ height: "300px" }}>
                    <Pie 
                      data={getResidentsPerPurok()} 
                      options={{ 
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                            labels: {
                              font: {
                                size: 12,
                                family: "'Poppins', sans-serif"
                              }
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value} residents`;
                              }
                            }
                          }
                        }
                      }} 
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4 g-4">
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title style={{ color: "#2c3e50", fontWeight: "600" }}>
                    Age Distribution
                  </Card.Title>
                  <div style={{ height: "300px" }}>
                    <Bar
                      data={getAgeDistribution()}
                      options={{
                        maintainAspectRatio: false,
                        plugins: { 
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value} residents`;
                              }
                            }
                          }
                        },
                        scales: {
                          x: { 
                            title: { 
                              display: true, 
                              text: "Age Groups",
                              font: { family: "'Poppins', sans-serif" }
                            },
                            grid: { display: false }
                          },
                          y: { 
                            title: { 
                              display: true, 
                              text: "Number of Residents",
                              font: { family: "'Poppins', sans-serif" }
                            },
                            grid: { color: "rgba(0,0,0,0.05)" }
                          },
                        },
                      }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title style={{ color: "#2c3e50", fontWeight: "600" }}>
                    Sex Ratio
                  </Card.Title>
                  <div style={{ height: "300px" }}>
                    <Pie 
                      data={getSexRatio()} 
                      options={{ 
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                            labels: {
                              font: {
                                size: 12,
                                family: "'Poppins', sans-serif"
                              }
                            }
                          },
                          tooltip: pieTooltip
                        }
                      }} 
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4 g-4">
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title style={{ color: "#2c3e50", fontWeight: "600" }}>
                    Employment Status
                  </Card.Title>
                  <div style={{ height: "300px" }}>
                    <Pie
                      data={getEmploymentStatusDistribution()}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                            labels: {
                              font: {
                                size: 12,
                                family: "'Poppins', sans-serif"
                              }
                            }
                          },
                          tooltip: pieTooltip
                        }
                      }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title style={{ color: "#2c3e50", fontWeight: "600" }}>
                    Educational Attainment
                  </Card.Title>
                  <div style={{ height: "300px" }}>
                    <Pie
                      data={getEducationalAttainmentDistribution()}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                            labels: {
                              font: {
                                size: 12,
                                family: "'Poppins', sans-serif"
                              }
                            }
                          },
                          tooltip: pieTooltip
                        }
                      }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title style={{ color: "#2c3e50", fontWeight: "600" }}>
                    Voter Registration Summary
                  </Card.Title>
                  <div style={{ height: "300px" }}>
                    <Pie 
                      data={getVoterRegistration()} 
                      options={{ 
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                            labels: {
                              font: {
                                size: 12,
                                family: "'Poppins', sans-serif"
                              }
                            }
                          },
                          tooltip: pieTooltip
                        }
                      }} 
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </Collapse>
    </Container>
  );
};

export default Dashboard;