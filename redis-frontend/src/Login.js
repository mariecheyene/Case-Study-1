import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Spinner, Modal, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [requestData, setRequestData] = useState({
    documentType: "Barangay Clearance",
    fullName: "",
    address: "",
    contactNumber: "",
    purpose: ""
  });
  
  const navigate = useNavigate();

  // Toggle login form visibility
  const toggleLoginForm = () => {
    setShowLoginForm(!showLoginForm);
    setShowRequestModal(false);
  };

  // Toggle request modal visibility
  const toggleRequestModal = () => {
    setShowRequestModal(!showRequestModal);
    setShowLoginForm(false);
  };

  // Handle request data changes
  const handleRequestChange = (e) => {
    setRequestData({ ...requestData, [e.target.name]: e.target.value });
  };

  // Form validation
  const validateForm = () => {
    if (!email || !password) {
      setErrorMessage("Please fill in both fields.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage("Please enter a valid email.");
      return false;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  // Validate document request form
  const validateRequestForm = () => {
    if (!requestData.fullName || !requestData.address || !requestData.contactNumber || !requestData.purpose || !documentType) {
      toast.error("Please fill in all required fields.");
      return false;
    }
    return true;
  };

  // Handle document request submission
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    
    if (!requestData.fullName || !requestData.address || !requestData.contactNumber || !requestData.purpose) {
      toast.error("All fields are required!");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5000/document-requests", requestData);
      toast.success(response.data.message || "Request submitted successfully!");
      setShowRequestModal(false);
      setRequestData({
        documentType: "Barangay Clearance",
        fullName: "",
        address: "",
        contactNumber: "",
        purpose: ""
      });
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error(error.response?.data?.message || "Failed to submit request");
    }
  };

  // Normalize role names for consistent comparison
  const normalizeRole = (role) => {
    if (!role) return '';
    const lowerRole = role.toLowerCase();
    return lowerRole === 'barangayofficial' ? 'barangayOfficial' : lowerRole;
  };

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
  
    if (!validateForm()) return;
  
    setIsLoading(true);
  
    // Predefined accounts (always available)
    const predefinedAccounts = {
      "admin@gmail.com": {
        password: "Admin_0",
        role: "admin",
        name: "System Admin"
      },
      "official@gmail.com": {
        password: "Official_0",
        role: "barangayOfficial",
        name: "Barangay Official"
      }
    };
  
    // Check if it's a predefined account
    const normalizedEmail = email.toLowerCase();
    const predefinedAccount = predefinedAccounts[normalizedEmail];
  
    if (predefinedAccount && password === predefinedAccount.password) {
      const user = { 
        email: normalizedEmail, 
        role: predefinedAccount.role,
        name: predefinedAccount.name
      };
      
      localStorage.setItem("user", JSON.stringify(user));
  
      toast.success(`Welcome, ${predefinedAccount.role === 'admin' ? 'Admin' : 'Barangay Official'}!`, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: "custom-toast",
      });
  
      setTimeout(() => {
        navigate(`/${predefinedAccount.role}/dashboard`);
      }, 2000);
      
      setIsLoading(false);
      return;
    }
  
    // If not a predefined account, try backend login
    try {
      const response = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });
  
      if (!response.data.user) {
        throw new Error("Invalid response from server");
      }
  
      const { user } = response.data;
      const normalizedUser = {
        ...user,
        role: normalizeRole(user.role) // Normalize the role before storing
      };
      
      localStorage.setItem("user", JSON.stringify(normalizedUser));
  
      toast.success(`Welcome, ${user.name || normalizedUser.role}!`, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: "custom-toast",
      });
  
      setTimeout(() => {
        if (normalizedUser.role === "admin") {
          navigate("/admin/dashboard");
        } else if (normalizedUser.role === "barangayOfficial") {
          navigate("/barangayOfficial/dashboard");
        } else {
          navigate("/"); // Fallback for unknown roles
        }
      }, 2000);
    } catch (error) {
      console.error("Login error:", error.response || error);
      toast.error(
        error.response?.data?.message || "Invalid credentials. Please try again."
      );
    }
  
    setIsLoading(false);
  };

  return (
    <div
      className="login-page"
      style={{
        backgroundImage: `url('/img/acmac.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      {/* Semi-transparent overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1,
        }}
      ></div>

      {/* Navigation links */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          display: "flex",
          gap: "15px",
          zIndex: 2,
        }}
      >
        <div
          style={{ color: "white", cursor: "pointer" }}
          onClick={() => navigate("/about")}
        >
          About
        </div>
        <div
          style={{ color: "white", cursor: "pointer" }}
          onClick={() => navigate("/map")}
        >
          Map
        </div>
      </div>
      
      {/* Right side buttons */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          display: "flex",
          gap: "15px",
          zIndex: 2,
        }}
      >
        <div
          style={{ color: "white", cursor: "pointer" }}
          onClick={() => setShowRequestModal(true)}
        >
          Request Document
        </div>
        <div
          style={{
            color: "white",
            cursor: "pointer",
          }}
          onClick={toggleLoginForm}
        >
          Login
        </div>
      </div>

      {/* Logo and Welcome text (hidden when login form is visible) */}
      {!showLoginForm && !showRequestModal && (
        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            padding: "20px",
            borderRadius: "15px",
            backdropFilter: "blur(5px)",
          }}
        >
          <img
            src="/img/logo.jpg"
            alt="Barangay Acmac Logo"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              marginBottom: "15px",
              border: "2px solid white",
            }}
          />
          <h1
            style={{
              color: "white",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
              fontSize: "2.5rem",
              fontWeight: "bold",
            }}
          >
            Barangay Acmac Resident Profiling System
          </h1>
        </div>
      )}

      {/* Login form */}
      {showLoginForm && (
        <div className="login-container" style={{ zIndex: 2 }}>
          <div className="login-box">
            <h4 className="text-center login-title">Login</h4>
            <Form onSubmit={handleLogin} className="mt-3">
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  isInvalid={errorMessage && !email}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errorMessage}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isInvalid={errorMessage && !password}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errorMessage}
                </Form.Control.Feedback>
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100"
                disabled={isLoading}
              >
                {isLoading ? <Spinner animation="border" size="sm" /> : "Login"}
              </Button>
            </Form>
          </div>
        </div>
      )}

      {/* Document Request Modal */}
      <Modal show={showRequestModal} onHide={() => setShowRequestModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Request Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRequestSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Document Type</Form.Label>
              <Form.Select
                name="documentType"
                value={requestData.documentType}
                onChange={(e) => setRequestData({...requestData, documentType: e.target.value})}
                required
              >
                <option value="Barangay Clearance">Barangay Clearance</option>
                <option value="Barangay Certificate">Barangay Certificate</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Full Name *</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={requestData.fullName}
                onChange={(e) => setRequestData({...requestData, fullName: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address *</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={requestData.address}
                onChange={(e) => setRequestData({...requestData, address: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contact Number *</Form.Label>
              <Form.Control
                type="text"
                name="contactNumber"
                value={requestData.contactNumber}
                onChange={(e) => setRequestData({...requestData, contactNumber: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Purpose *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="purpose"
                value={requestData.purpose}
                onChange={(e) => setRequestData({...requestData, purpose: e.target.value})}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-center">
              <Button 
                type="submit" 
                style={{ 
                  backgroundColor: "#007bff", 
                  border: "none", 
                  padding: "10px 30px" 
                }}
              >
                Submit Request
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ top: "20px", textAlign: "center" }}
      />
    </div>
  );
};

export default Login;