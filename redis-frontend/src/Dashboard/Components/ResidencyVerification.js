import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Table, Form, Button, Modal, InputGroup } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf"; // For PDF generation
import "../css/Dashboard.css";

const API_URL = "http://localhost:5000/residents"; // Adjust API URL

const ResidencyVerification = () => {
  const [residents, setResidents] = useState([]); // All residents data
  const [filteredResidents, setFilteredResidents] = useState([]); // Filtered residents data
  const [selectedResident, setSelectedResident] = useState(null); // Selected resident for document generation
  const [showModal, setShowModal] = useState(false); // Control modal visibility
  const [documentType, setDocumentType] = useState(""); // Type of document to generate
  const [searchTerm, setSearchTerm] = useState(""); // Search query for residents

  useEffect(() => {
    fetchResidents();
  }, []);

  // Fetch residents from the backend
  const fetchResidents = async () => {
    try {
      const response = await axios.get(API_URL);
      setResidents(response.data);
      setFilteredResidents(response.data); // Initialize filtered data with all residents
    } catch (error) {
      console.error("Error fetching residents:", error);
      toast.error("Failed to fetch residents");
    }
  };

  // Handle document generation
  const handleGenerateDocument = (resident, type) => {
    setSelectedResident(resident);
    setDocumentType(type);
    setShowModal(true);
  };

  // Generate PDF document
  const generatePDF = () => {
    const pdf = new jsPDF();

    // Load the Barangay Logo (JPG format)
    const logoUrl = "/img/logo/logo.jpg"; // Path to the logo in the public directory

    // Common Barangay Header
    const addBarangayHeader = () => {
      pdf.setFontSize(12);
      pdf.text("Republic of the Philippines", 10, 20);
      pdf.text("Province of Lanao del Norte", 10, 25);
      pdf.text("City of Iligan", 10, 30);
      pdf.text("Barangay Acmac", 10, 35);

      // Add the Barangay Logo (JPG format)
      pdf.addImage(logoUrl, "JPEG", 150, 10, 40, 40); // Adjust position and size as needed
    };

    // Add Title
    const addTitle = (title) => {
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text(title, 105, 60, { align: "center" });
      pdf.setFont("helvetica", "normal");
    };

    // Add Resident Information
    const addResidentInfo = () => {
      pdf.setFontSize(12);
      pdf.text(`Name: ${selectedResident.name}`, 10, 70);
      pdf.text(`Address: ${selectedResident.address}`, 10, 80);
      pdf.text(`Purok Number: ${selectedResident.purokNumber}`, 10, 90);
      pdf.text(`Birthdate & Age: ${selectedResident.birthdate} (${selectedResident.age} years old)`, 10, 100);
      pdf.text(`Civil Status: ${selectedResident.civilStatus}`, 10, 110);
    };

    // Add Certification Statement
    const addCertificationStatement = (statement) => {
      pdf.setFontSize(12);
      pdf.text(statement, 10, 120, { maxWidth: 180 });
    };

    // Add Barangay Captain's Signature and Seal
    const addSignatureAndSeal = () => {
      pdf.text("Barangay Captain's Signature: ___________________", 10, 150);
      pdf.text("Name of Barangay Captain: [Barangay Captain Name]", 10, 160);
      pdf.text("Official Barangay Seal: [SEAL]", 10, 170);
    };

    // Add Date and Place of Issuance
    const addIssuanceDetails = () => {
      const date = new Date().toLocaleDateString();
      pdf.text(`Date of Issuance: ${date}`, 10, 180);
      pdf.text("Place of Issuance: Barangay Acmac, Iligan City", 10, 190);
    };

    // Add Reference Number (Optional)
    const addReferenceNumber = () => {
      const refNumber = `REF-${Math.floor(Math.random() * 1000000)}`;
      pdf.text(`Reference Number: ${refNumber}`, 10, 200);
    };

    // Add Barangay Header
    addBarangayHeader();

    // Add Title based on Document Type
    if (documentType === "Barangay Clearance") {
      addTitle("Barangay Clearance");

      // Add Resident Information
      addResidentInfo();

      // Add Certification Statement for Barangay Clearance
      addCertificationStatement(
        "This certifies that the resident has no pending case, complaint, or derogatory record in Barangay Acmac. This document is issued upon the resident’s request for legal purposes (e.g., employment, business, or personal use)."
      );
    } else if (documentType === "Residency Certificate") {
      addTitle("Certificate of Residency");

      // Add Resident Information
      addResidentInfo();

      // Add Certification Statement for Residency Certificate
      addCertificationStatement(
        `This certifies that ${selectedResident.name} is a bona fide resident of Barangay Acmac and has been living in the barangay for ${selectedResident.yearsOfStay} years. This document is issued for the purpose of: ________________________.`
      );
    }

    // Add Barangay Captain's Signature and Seal
    addSignatureAndSeal();

    // Add Date and Place of Issuance
    addIssuanceDetails();

    // Add Reference Number (Optional)
    addReferenceNumber();

    // Save the PDF
    pdf.save(`${documentType}_${selectedResident.name}.pdf`);
    setShowModal(false);
  };

  // Handle search input change
  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);

    const filteredData = residents.filter(
      (resident) =>
        resident.name.toLowerCase().includes(term.toLowerCase()) ||
        resident.purokNumber.toString().includes(term) ||
        resident.address.toLowerCase().includes(term.toLowerCase())
    );

    setFilteredResidents(filteredData);
  };

  return (
    <div className="container mt-5">
      <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: "600", color: "#2c3e50" }}>
        📄 Residency Verification & Documentation
      </h2>

      {/* Search Bar */}
      <InputGroup className="mb-3" style={{ maxWidth: "400px", margin: "0 auto" }}>
        <InputGroup.Text style={{ backgroundColor: "#007bff", border: "none", borderRadius: "25px 0 0 25px", color: "#fff" }}>
          <i className="bx bx-search"></i>
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder="Search by Name, Purok, or Address"
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
            <th>Address</th>
            <th>Years of Stay</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredResidents
            .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically by name
            .map((resident) => (
              <tr key={resident.id}>
                <td>{resident.name}</td>
                <td>{resident.purokNumber}</td>
                <td>{resident.address}</td>
                <td>{resident.yearsOfStay}</td>
                <td>
                  <Button
                    variant="primary"
                    className="me-2"
                    onClick={() => handleGenerateDocument(resident, "Barangay Clearance")}
                  >
                    Generate Clearance
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => handleGenerateDocument(resident, "Residency Certificate")}
                  >
                    Generate Certificate
                  </Button>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>

      {/* Document Generation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Generate {documentType}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to generate a {documentType} for{" "}
            <strong>{selectedResident?.name}</strong>?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={generatePDF}>
            Generate PDF
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default ResidencyVerification;