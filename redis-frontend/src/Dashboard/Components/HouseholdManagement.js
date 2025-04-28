import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Table, Button, Modal, Form, InputGroup } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import "../css/Household.css";

const API_URL = "http://localhost:5000/residents"; // Adjust API URL

const HouseholdManagement = () => {
  const navigate = useNavigate();
  const [householdData, setHouseholdData] = useState([]); // All household data
  const [filteredHouseholdData, setFilteredHouseholdData] = useState([]); // Filtered household data
  const [selectedHousehold, setSelectedHousehold] = useState(null); // Store selected household data
  const [showModal, setShowModal] = useState(false); // Control modal visibility
  const [residents, setResidents] = useState([]); // Store all residents data
  const [searchTerm, setSearchTerm] = useState(""); // Search query for household number

  useEffect(() => {
    fetchHouseholdData();
    fetchResidents();
  }, []);

  // Fetch all residents data from the backend
  const fetchResidents = async () => {
    try {
      const response = await axios.get(`${API_URL}`);
      setResidents(response.data);
    } catch (error) {
      console.error("Error fetching residents:", error);
      toast.error("Failed to fetch residents");
    }
  };

  // Fetch household data from the backend
  const fetchHouseholdData = async () => {
    try {
      const response = await axios.get(`${API_URL}`);
      const residents = response.data;
  
      // Group residents by householdNumber
      const householdMap = residents.reduce((acc, resident) => {
        const householdNumber = resident.householdNumber || "Unknown";
        if (!acc[householdNumber]) {
          acc[householdNumber] = {
            householdHead: null,
            members: [],
          };
        }
        if (resident.role === "Head") {
          acc[householdNumber].householdHead = resident.name;
        }
        acc[householdNumber].members.push(resident);
        return acc;
      }, {});
  
      // Convert to array format for display and sort by household number
      const householdArray = Object.entries(householdMap)
        .map(([householdNumber, data]) => ({
          householdNumber,
          householdHead: data.householdHead || "Unknown",
          // Sort members by ID here
          members: data.members.sort((a, b) => a.id - b.id),
        }))
        .sort((a, b) => a.householdNumber - b.householdNumber); // Sort by household number
  
      setHouseholdData(householdArray);
      setFilteredHouseholdData(householdArray);
    } catch (error) {
      console.error("Error fetching household data:", error);
      toast.error("Failed to fetch household data");
    }
  };

  // Handle viewing household details
  const handleViewHousehold = (householdNumber) => {
    const household = householdData.find((h) => h.householdNumber === householdNumber);
    setSelectedHousehold(household);
    setShowModal(true);
  };

  // Close the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedHousehold(null);
  };

  // Handle printing the modal content
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Household Details</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
              font-size: 12px;
            }
            th {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          <h4>Household Number: ${selectedHousehold.householdNumber}</h4>
          <h5>Household Head: ${selectedHousehold.householdHead}</h5>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Birthdate</th>
                <th>Age</th>
                <th>Sex</th>
                <th>Civil Status</th>
                <th>Purok Number</th>
                <th>Household Number</th>
                <th>Employment Status</th>
                <th>Educational Attainment</th>
                <th>Voter's Status</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Residence Status</th>
                <th>Years of Stay</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              ${selectedHousehold.members
                .map(
                  (member) => `
                <tr>
                  <td>${member.id}</td>
                  <td>${member.name}</td>
                  <td>${member.birthdate || "N/A"}</td>
                  <td>${member.age}</td>
                  <td>${member.sex}</td>
                  <td>${member.civilStatus}</td>
                  <td>${member.purokNumber}</td>
                  <td>${member.householdNumber}</td>
                  <td>${member.employmentStatus}</td>
                  <td>${member.educationalAttainment}</td>
                  <td>${member.votersStatus}</td>
                  <td>${member.address}</td>
                  <td>${member.phone}</td>
                  <td>${member.residenceStatus}</td>
                  <td>${member.yearsOfStay}</td>
                  <td>${member.role}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Handle search input change
  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);

    const filteredData = householdData.filter((household) =>
      household.householdNumber.toString().includes(term.trim())
    );
    setFilteredHouseholdData(filteredData);
  };

  return (
    <div className="container mt-5">
      <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: "600", color: "#2c3e50" }}>
        🏠 Household Management
      </h2>

      {/* Search Bar */}
      <InputGroup className="mb-3" style={{ maxWidth: "400px", margin: "0 auto" }}>
        <InputGroup.Text style={{ backgroundColor: "#007bff", border: "none", borderRadius: "25px 0 0 25px", color: "#fff" }}>
          <i className="bx bx-search"></i>
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder="Search by Household Number"
          value={searchTerm}
          onChange={handleSearch}
          style={{ border: "none", boxShadow: "none", backgroundColor: "#e9f5ff", borderRadius: "0 25px 25px 0", height: "38px" }}
        />
      </InputGroup>

      {/* Household Table */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Household Number</th>
            <th>Household Head</th>
            <th>Members</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredHouseholdData.map((household) => (
            <tr key={household.householdNumber}>
              <td>{household.householdNumber}</td>
              <td>{household.householdHead}</td>
              <td>
                <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                  {household.members.map((member, index) => (
                    <li key={index}>{member.name}</li>
                  ))}
                </ul>
              </td>
              <td>
                <Button variant="info" onClick={() => handleViewHousehold(household.householdNumber)}>
                  View Household
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for displaying household details */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Household Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {selectedHousehold && (
            <div id="printable-modal-content">
              <h4>Household Number: {selectedHousehold.householdNumber}</h4>
              <h5>Household Head: {selectedHousehold.householdHead}</h5>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Birthdate</th>
                    <th>Age</th>
                    <th>Sex</th>
                    <th>Civil Status</th>
                    <th>Purok Number</th>
                    <th>Household Number</th>
                    <th>Employment Status</th>
                    <th>Educational Attainment</th>
                    <th>Voter's Status</th>
                    <th>Address</th>
                    <th>Phone</th>
                    <th>Residence Status</th>
                    <th>Years of Stay</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedHousehold.members.map((member, index) => (
                    <tr key={index}>
                      <td>{member.id}</td>
                      <td>{member.name}</td>
                      <td>{member.birthdate || "N/A"}</td>
                      <td>{member.age}</td>
                      <td>{member.sex}</td>
                      <td>{member.civilStatus}</td>
                      <td>{member.purokNumber}</td>
                      <td>{member.householdNumber}</td>
                      <td>{member.employmentStatus}</td>
                      <td>{member.educationalAttainment}</td>
                      <td>{member.votersStatus}</td>
                      <td>{member.address}</td>
                      <td>{member.phone}</td>
                      <td>{member.residenceStatus}</td>
                      <td>{member.yearsOfStay}</td>
                      <td>{member.role}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            Print
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default HouseholdManagement;