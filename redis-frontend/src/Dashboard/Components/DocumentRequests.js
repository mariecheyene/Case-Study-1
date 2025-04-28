import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Spinner, Modal, Form, ButtonGroup, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { format } from "date-fns";
import { FaSearch } from "react-icons/fa";

const API_URL = "http://localhost:5000/document-requests";

const DocumentRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("All");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(API_URL);
      setRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load document requests");
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id, status) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/${id}`, { status });
      
      // Update local state to avoid full refresh
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status } : req
      ));
      
      toast.success(`Request ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error(`Error updating status:`, error);
      toast.error(error.response?.data?.message || `Failed to ${status.toLowerCase()} request`);
    } finally {
      setLoading(false);
    }
  };


  const deleteRequest = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success("Request deleted successfully");
      fetchRequests();
    } catch (error) {
      console.error("Error deleting request:", error);
      toast.error("Failed to delete request");
    }
  };

  const filteredRequests = requests.filter(request => {
    // Apply status filter
    const statusMatch = statusFilter === "All" || request.status === statusFilter;
    
    // Apply document type filter
    const typeMatch = documentTypeFilter === "All" || 
                     request.documentType === documentTypeFilter;
    
    // Apply search filter
    const searchMatch = Object.values(request).some(value =>
      value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return statusMatch && typeMatch && searchMatch;
  });

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  return (
    <div className="container mt-4">
      
      <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: "600", color: "#2c3e50" }}>
      📄  Document Requests </h2>
      
      {/* Search and Filter Controls */}
      <div className="d-flex justify-content-between mb-4">
  <InputGroup className="mb-3" style={{ maxWidth: "400px", margin: "0" }}>
    <InputGroup.Text style={{ backgroundColor: "#007bff", border: "none", borderRadius: "25px 0 0 25px", color: "#fff" }}>
      <FaSearch />
    </InputGroup.Text>
    <Form.Control
      type="text"
      placeholder="Search requests..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      style={{ border: "none", boxShadow: "none", backgroundColor: "#e9f5ff", borderRadius: "0 25px 25px 0", height: "38px" }}
    />
  </InputGroup>
        
        <div className="d-flex">
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "150px", marginRight: "10px", height: "38px" }}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </Form.Select>
          
          <Form.Select
            value={documentTypeFilter}
            onChange={(e) => setDocumentTypeFilter(e.target.value)}
            style={{ width: "180px", height: "38px" }}
          >
            <option value="All">All Document Types</option>
            <option value="Barangay Clearance">Barangay Clearance</option>
            <option value="Barangay Certificate">Barangay Certificate</option>
          </Form.Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p>Loading requests...</p>
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Document Type</th>
              <th>Address</th>
              <th>Contact</th>
              <th>Purpose</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>{format(new Date(request.requestDate), "MMM dd, yyyy")}</td>
                  <td>{request.fullName}</td>
                  <td>{request.documentType}</td>
                  <td>{request.address}</td>
                  <td>{request.contactNumber}</td>
                  <td>{request.purpose}</td>
                  <td>
                    <span className={`badge ${
                      request.status === "Approved" ? "bg-success" :
                      request.status === "Rejected" ? "bg-danger" : "bg-warning"
                    }`}>
                      {request.status || "Pending"}
                    </span>
                  </td>
                  <td>
                    <ButtonGroup>
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => handleViewRequest(request)}
                        className="me-1"
                      >
                        View
                      </Button>
                      {(!request.status || request.status === "Pending") && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => updateRequestStatus(request.id, "Approved")}
                            className="me-1"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => updateRequestStatus(request.id, "Rejected")}
                            className="me-1"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteRequest(request.id)}
                      >
                        Delete
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">
                  No document requests found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* View Request Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Document Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div>
              <p><strong>Request Date:</strong> {format(new Date(selectedRequest.requestDate), "MMM dd, yyyy")}</p>
              <p><strong>Name:</strong> {selectedRequest.fullName}</p>
              <p><strong>Address:</strong> {selectedRequest.address}</p>
              <p><strong>Contact Number:</strong> {selectedRequest.contactNumber}</p>
              <p><strong>Document Type:</strong> {selectedRequest.documentType}</p>
              <p><strong>Purpose:</strong> {selectedRequest.purpose}</p>
              <p><strong>Status:</strong> 
                <span className={`badge ${
                  selectedRequest.status === "Approved" ? "bg-success" :
                  selectedRequest.status === "Rejected" ? "bg-danger" : "bg-warning"
                } ms-2`}>
                  {selectedRequest.status || "Pending"}
                </span>
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default DocumentRequest;