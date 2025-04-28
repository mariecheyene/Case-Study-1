import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Table, Form, Button, Modal, InputGroup } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaPrint, FaFileExport } from "react-icons/fa"; // Import icons
import Papa from "papaparse"; // For CSV export
import "../css/Dashboard.css";

const API_URL = "http://localhost:5000/residents"; // Adjust API URL

// Utility function to format dates as yyyy-MM-dd
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // Format as yyyy-MM-dd
};

const ViewResidentList = () => {
  const navigate = useNavigate();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("fullDetails"); // Default sort by full details
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" or "desc"
  const [searchQuery, setSearchQuery] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedResident, setSelectedResident] = useState({
    id: "",
    name: "",
    birthdate: "",
    age: "",
    sex: "",
    civilStatus: "",
    purokNumber: "",
    householdNumber: "",
    employmentStatus: "",
    educationalAttainment: "",
    votersStatus: "",
    address: "",
    phone: "",
    residenceStatus: "",
    yearsOfStay: "",
    role: "",
  }); // Initialize with default values

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setResidents(response.data);
    } catch (error) {
      toast.error("Error fetching residents");
    }
    setLoading(false);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleViewResident = (resident) => {
    setSelectedResident(resident);
    setShowViewModal(true);
  };

  // Export to CSV (full data ordered by ID)
  const handleExportCSV = () => {
    const fileName = prompt("Enter a name for the CSV file:", "residents");
    if (!fileName) return;

    const dataToExport = residents
      .sort((a, b) => (sortOrder === "asc" ? a.id - b.id : b.id - a.id)) // Sort by ID
      .map((resident) => ({
        ID: resident.id,
        Name: resident.name,
        Birthdate: formatDate(resident.birthdate) || "N/A", // Format the birthdate
        Age: resident.age,
        Sex: resident.sex,
        "Civil Status": resident.civilStatus,
        "Purok Number": resident.purokNumber,
        "Household Number": resident.householdNumber,
        "Employment Status": resident.employmentStatus,
        "Educational Attainment": resident.educationalAttainment,
        "Voter's Status": resident.votersStatus,
        Address: resident.address,
        Phone: resident.phone,
        "Residence Status": resident.residenceStatus,
        "Years of Stay": resident.yearsOfStay,
        Role: resident.role,
      }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Resident Details
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Resident Details</title>
          <style>
            body {
              font-family: Arial, sans-serif;
            }
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
          <h2>Resident Details</h2>
          <p><strong>ID:</strong> ${selectedResident.id}</p>
          <p><strong>Name:</strong> ${selectedResident.name}</p>
          <p><strong>Birthdate:</strong> ${formatDate(selectedResident.birthdate) || "N/A"}</p>
          <p><strong>Age:</strong> ${selectedResident.age}</p>
          <p><strong>Sex:</strong> ${selectedResident.sex}</p>
          <p><strong>Civil Status:</strong> ${selectedResident.civilStatus}</p>
          <p><strong>Purok Number:</strong> ${selectedResident.purokNumber}</p>
          <p><strong>Household Number:</strong> ${selectedResident.householdNumber}</p>
          <p><strong>Employment Status:</strong> ${selectedResident.employmentStatus}</p>
          <p><strong>Educational Attainment:</strong> ${selectedResident.educationalAttainment}</p>
          <p><strong>Voter's Status:</strong> ${selectedResident.votersStatus}</p>
          <p><strong>Address:</strong> ${selectedResident.address}</p>
          <p><strong>Phone:</strong> ${selectedResident.phone}</p>
          <p><strong>Residence Status:</strong> ${selectedResident.residenceStatus}</p>
          <p><strong>Years of Stay:</strong> ${selectedResident.yearsOfStay}</p>
          <p><strong>Role:</strong> ${selectedResident.role}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Filter residents based on search query
  const filteredResidents = residents.filter((resident) =>
    Object.values(resident).some((value) =>
      value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Sort residents
  const sortedResidents = filteredResidents.sort((a, b) => {
    if (sortBy === "fullDetails") {
      // Always sort by ID for full details
      return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
    }

    const aValue = a[sortBy]?.toString().toLowerCase() || "";
    const bValue = b[sortBy]?.toString().toLowerCase() || "";

    if (sortBy === "id" || sortBy === "purokNumber" || sortBy === "yearsOfStay" || sortBy === "age") {
      // Sort by numeric value for numeric fields
      return sortOrder === "asc" ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
    } else if (sortBy === "householdNumber") {
      // Sort householdNumber as strings but pad with leading zeros for numeric order
      const pad = (num) => num.toString().padStart(10, "0"); // Pad with leading zeros
      const aPadded = pad(aValue);
      const bPadded = pad(bValue);
      return sortOrder === "asc" ? aPadded.localeCompare(bPadded) : bPadded.localeCompare(aPadded);
    } else if (sortBy === "birthdate") {
      // Sort by birthdate (convert to Date objects)
      const aDate = new Date(a.birthdate);
      const bDate = new Date(b.birthdate);
      return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
    } else {
      // Default sorting for other fields (alphabetical)
      return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
  });

  // Group residents by household number if sorting by householdNumber
  const groupedResidents = sortBy === "householdNumber"
    ? sortedResidents.reduce((acc, resident) => {
        const householdNumber = resident.householdNumber;
        if (!acc[householdNumber]) {
          acc[householdNumber] = [];
        }
        acc[householdNumber].push(resident);
        return acc;
      }, {})
    : null;

  return (
    <div className="container mt-5" style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "10px" }}>
      <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: "600", color: "#2c3e50" }}>
        📋 Resident List 
      </h2>

      {/* Search and Sorting Controls */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <InputGroup className="w-50 mx-auto" style={{ maxWidth: "400px" }}>
          <InputGroup.Text style={{ backgroundColor: "#007bff", border: "none", borderRadius: "25px 0 0 25px", color: "#fff" }}>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search residents..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{ border: "none", boxShadow: "none", backgroundColor: "#e9f5ff", borderRadius: "0 25px 25px 0", height: "38px" }}
          />
        </InputGroup>
        <div className="d-flex align-items-center">
          <Form.Select value={sortBy} onChange={handleSortChange} className="me-2" style={{ maxWidth: "200px", height: "38px" }}>
            <option value="fullDetails">Full Details</option>
            <option value="id">ID</option>
            <option value="name">Name</option>
            <option value="birthdate">Birthdate</option>
            <option value="age">Age</option>
            <option value="sex">Sex</option>
            <option value="civilStatus">Civil Status</option>
            <option value="purokNumber">Purok Number</option>
            <option value="householdNumber">Household Number</option>
            <option value="employmentStatus">Employment Status</option>
            <option value="educationalAttainment">Educational Attainment</option>
            <option value="votersStatus">Voter's Status</option>
            <option value="address">Address</option>
            <option value="phone">Phone</option>
            <option value="residenceStatus">Residence Status</option>
            <option value="yearsOfStay">Years of Stay</option>
            <option value="role">Role</option>
          </Form.Select>
          <Button
            variant="outline-secondary"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            style={{ width: "50px", padding: "0.375rem 0.75rem", backgroundColor: "#e9ecef", borderColor: "#ced4da", height: "38px" }}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>
          <Button variant="success" onClick={handleExportCSV} className="ms-2" style={{ height: "38px" }}>
            <FaFileExport /> Export CSV
          </Button>
        </div>
      </div>

      {/* Residents Table */}
      <div className="table-responsive">
        <Table striped bordered hover className="shadow-sm" style={{ fontSize: "12px", width: sortBy === "name" ? "50%" : "100%" }}>
          <thead>
            <tr>
              {sortBy === "fullDetails" ? (
                <>
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
                  <th style={{ width: "150px" }}>Actions</th>
                </>
              ) : sortBy === "householdNumber" ? (
                <>
                  <th>Household Number</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th style={{ width: "150px" }}>Actions</th>
                </>
              ) : sortBy === "birthdate" ? (
                <>
                  <th>Birthdate</th>
                  <th>Age</th>
                  <th>Name</th>
                  <th style={{ width: "150px" }}>Actions</th>
                </>
              ) : sortBy === "sex" ? (
                <>
                  <th>Sex</th>
                  <th>Name</th>
                  <th style={{ width: "150px" }}>Actions</th>
                </>
              ) : sortBy === "civilStatus" ? (
                <>
                  <th>Civil Status</th>
                  <th>Name</th>
                  <th style={{ width: "150px" }}>Actions</th>
                </>
              ) : (
                <>
                  <th>{sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</th>
                  {sortBy !== "name" && <th>Name</th>}
                  <th style={{ width: "150px" }}>Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {sortBy === "householdNumber" ? (
              Object.entries(groupedResidents || {}).map(([householdNumber, residents]) => (
                <React.Fragment key={householdNumber}>
                  <tr>
                    <td colSpan={4} style={{ fontWeight: "bold", backgroundColor: "#f0f0f0" }}>
                      Household Number: {householdNumber}
                    </td>
                  </tr>
                  {residents.map((resident) => (
                    <tr key={resident.id}>
                      <td>{resident.householdNumber}</td>
                      <td>{resident.name}</td>
                      <td>{resident.role}</td>
                      <td>
                        <Button variant="info" onClick={() => handleViewResident(resident)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            ) : sortBy === "sex" ? (
              <>
                {/* Group by Male */}
                <tr>
                  <td colSpan={3} style={{ fontWeight: "bold", backgroundColor: "#f0f0f0" }}>
                    Male
                  </td>
                </tr>
                {sortedResidents
                  .filter((resident) => resident.sex === "Male")
                  .map((resident) => (
                    <tr key={resident.id}>
                      <td>{resident.sex}</td>
                      <td>{resident.name}</td>
                      <td>
                        <Button variant="info" onClick={() => handleViewResident(resident)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}

                {/* Group by Female */}
                <tr>
                  <td colSpan={3} style={{ fontWeight: "bold", backgroundColor: "#f0f0f0" }}>
                    Female
                  </td>
                </tr>
                {sortedResidents
                  .filter((resident) => resident.sex === "Female")
                  .map((resident) => (
                    <tr key={resident.id}>
                      <td>{resident.sex}</td>
                      <td>{resident.name}</td>
                      <td>
                        <Button variant="info" onClick={() => handleViewResident(resident)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
              </>
            ) : sortedResidents.length > 0 ? (
              sortedResidents.map((resident) => (
                <tr key={resident.id}>
                  {sortBy === "fullDetails" ? (
                    <>
                      <td>{resident.id}</td>
                      <td>{resident.name}</td>
                      <td>{formatDate(resident.birthdate)}</td>
                      <td>{resident.age}</td>
                      <td>{resident.sex}</td>
                      <td>{resident.civilStatus}</td>
                      <td>{resident.purokNumber}</td>
                      <td>{resident.householdNumber}</td>
                      <td>{resident.employmentStatus}</td>
                      <td>{resident.educationalAttainment}</td>
                      <td>{resident.votersStatus}</td>
                      <td>{resident.address}</td>
                      <td>{resident.phone}</td>
                      <td>{resident.residenceStatus}</td>
                      <td>{resident.yearsOfStay}</td>
                      <td>{resident.role}</td>
                      <td>
                        <Button variant="info" onClick={() => handleViewResident(resident)}>
                          View
                        </Button>
                      </td>
                    </>
                  ) : sortBy === "birthdate" ? (
                    <>
                      <td>{formatDate(resident.birthdate)}</td>
                      <td>{resident.age}</td>
                      <td>{resident.name}</td>
                      <td>
                        <Button variant="info" onClick={() => handleViewResident(resident)}>
                          View
                        </Button>
                      </td>
                    </>
                  ) : sortBy === "civilStatus" ? (
                    <>
                      <td>{resident.civilStatus}</td>
                      <td>{resident.name}</td>
                      <td>
                        <Button variant="info" onClick={() => handleViewResident(resident)}>
                          View
                        </Button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{resident[sortBy]}</td>
                      {sortBy !== "name" && <td>{resident.name}</td>}
                      <td>
                        <Button variant="info" onClick={() => handleViewResident(resident)}>
                          View
                        </Button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={sortBy === "fullDetails" ? 17 : 3} className="text-center">
                  No residents found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* View Resident Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Resident Details</Modal.Title>
        </Modal.Header>
        <Modal.Body id="modal-content">
          {selectedResident && (
            <div>
              <p><strong>ID:</strong> {selectedResident.id}</p>
              <p><strong>Name:</strong> {selectedResident.name}</p>
              <p><strong>Birthdate:</strong> {formatDate(selectedResident.birthdate)}</p>
              <p><strong>Age:</strong> {selectedResident.age}</p>
              <p><strong>Sex:</strong> {selectedResident.sex}</p>
              <p><strong>Civil Status:</strong> {selectedResident.civilStatus}</p>
              <p><strong>Purok Number:</strong> {selectedResident.purokNumber}</p>
              <p><strong>Household Number:</strong> {selectedResident.householdNumber}</p>
              <p><strong>Employment Status:</strong> {selectedResident.employmentStatus}</p>
              <p><strong>Educational Attainment:</strong> {selectedResident.educationalAttainment}</p>
              <p><strong>Voter's Status:</strong> {selectedResident.votersStatus}</p>
              <p><strong>Address:</strong> {selectedResident.address}</p>
              <p><strong>Phone:</strong> {selectedResident.phone}</p>
              <p><strong>Residence Status:</strong> {selectedResident.residenceStatus}</p>
              <p><strong>Years of Stay:</strong> {selectedResident.yearsOfStay}</p>
              <p><strong>Role:</strong> {selectedResident.role}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            <FaPrint /> Print
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default ViewResidentList;