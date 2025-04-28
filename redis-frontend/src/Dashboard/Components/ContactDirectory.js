import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Table, Form, InputGroup, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/Dashboard.css";

const API_URL = "http://localhost:5000/residents"; // Adjust API URL

const ContactDirectory = () => {
  const [residents, setResidents] = useState([]);
  const [filteredResidents, setFilteredResidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchResidents();
  }, []);

  // Fetch residents from the backend
  const fetchResidents = async () => {
    try {
      const response = await axios.get(API_URL);
      const residentsWithPhone = response.data.filter(
        (resident) => resident.phone // Only include residents with phone numbers
      );
      setResidents(residentsWithPhone);
      setFilteredResidents(residentsWithPhone);
    } catch (error) {
      console.error("Error fetching residents:", error);
      toast.error("Failed to fetch residents");
    }
  };

  // Handle search input change
  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);

    const filteredData = residents.filter(
      (resident) =>
        resident.name.toLowerCase().includes(term.toLowerCase()) ||
        resident.purokNumber.toString().includes(term) ||
        resident.householdNumber.toString().includes(term)
    );

    setFilteredResidents(filteredData);
  };

  return (
    <div className="container mt-5">
      <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: "600", color: "#2c3e50" }}>
        📞 Contact Directory
      </h2>

      {/* Search Bar */}
      <InputGroup className="mb-3" style={{ maxWidth: "400px", margin: "0 auto" }}>
        <InputGroup.Text style={{ backgroundColor: "#007bff", border: "none", borderRadius: "25px 0 0 25px", color: "#fff" }}>
          <i className="bx bx-search"></i>
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder="Search by Name, Purok, or Household"
          value={searchTerm}
          onChange={handleSearch}
          style={{ border: "none", boxShadow: "none", backgroundColor: "#e9f5ff", borderRadius: "0 25px 25px 0", height: "38px" }}
        />
      </InputGroup>

      {/* Residents Table */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Purok</th>
            <th>Phone Number</th>
            <th>Household Number</th>
          </tr>
        </thead>
        <tbody>
          {filteredResidents
            .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically by name
            .map((resident) => (
              <tr key={resident.id}>
                <td>{resident.name}</td>
                <td>{resident.purokNumber}</td>
                <td>{resident.phone}</td>
                <td>{resident.householdNumber}</td>
              </tr>
            ))}
        </tbody>
      </Table>
      <ToastContainer />
    </div>
  );
};

export default ContactDirectory;