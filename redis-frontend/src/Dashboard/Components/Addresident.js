import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns"; // Import the format function
import "../css/Dashboard.css";

const API_URL = "http://localhost:5000/residents";

const AddResident = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    birthdate: null,
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
    role: "Other",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setFormData((prevData) => {
      const age = calculateAge(date); // Calculate age based on the selected birthdate
      return { ...prevData, birthdate: date, age };
    });
  };

  const calculateAge = (birthdate) => {
    if (!birthdate) return ""; // Return empty string if no birthdate is selected

    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();

    // Adjust age if the birthday hasn't occurred yet this year
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age.toString(); // Return age as a string
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      toast.error("Please select a CSV file first");
      return;
    }

    const formData = new FormData();
    formData.append("csvFile", file); // Backend expects 'csvFile' as the field name

    try {
      const response = await axios.post("http://localhost:5000/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.message === "CSV uploaded and data saved successfully") {
        toast.success("CSV uploaded successfully!");
      } else {
        toast.success("CSV uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading CSV:", error.response?.data || error);
      if (error.response) {
        toast.error(`Upload failed: ${error.response.data.message || "Unknown server error"}`);
      } else {
        toast.error("Server unreachable. Check connection.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id.trim() || !formData.name.trim()) {
      toast.error("ID and Name are required!");
      return;
    }

    // Format birthdate as yyyy-MM-dd before sending to the server
    const formattedBirthdate = formData.birthdate
      ? format(formData.birthdate, "yyyy-MM-dd")
      : "";

    const trimmedFormData = {
      ...formData,
      birthdate: formattedBirthdate, // Use the formatted birthdate
    };

    try {
      const response = await axios.post(API_URL, trimmedFormData);
      console.log("Resident added:", response.data);
      toast.success("Resident added successfully");

      // Clear the form after successful submission
      setFormData({
        id: "",
        name: "",
        birthdate: null,
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
        role: "Other",
      });
    } catch (error) {
      console.error("Error adding resident:", error);
      toast.error(error.response?.data?.message || "Failed to save resident");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "1200px", margin: "0 auto" }}>
 <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: "600", color: "#2c3e50" }}>
  👨‍👩‍👧‍👦 Add New Resident
</h2>
      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ID</Form.Label>
                  <Form.Control type="text" name="id" value={formData.id} onChange={handleInputChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Birthdate</Form.Label>
                  <DatePicker
                    selected={formData.birthdate}
                    onChange={handleDateChange}
                    dateFormat="yyyy-MM-dd" // Ensure the DatePicker displays dates in yyyy-MM-dd format
                    className="form-control"
                    placeholderText="Select birthdate"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    yearDropdownItemNumber={100}
                    scrollableYearDropdown
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Age</Form.Label>
                  <Form.Control type="number" name="age" value={formData.age} readOnly />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Sex</Form.Label>
                  <Form.Select name="sex" value={formData.sex} onChange={handleInputChange}>
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Civil Status</Form.Label>
                  <Form.Select name="civilStatus" value={formData.civilStatus} onChange={handleInputChange}>
                    <option value="">Select Civil Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Purok Number</Form.Label>
                  <Form.Control type="number" name="purokNumber" value={formData.purokNumber} onChange={handleInputChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Household Number</Form.Label>
                  <Form.Control type="number" name="householdNumber" value={formData.householdNumber} onChange={handleInputChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Employment Status</Form.Label>
                  <Form.Select name="employmentStatus" value={formData.employmentStatus} onChange={handleInputChange}>
                    <option value="">Select Employment Status</option>
                    <option value="Employed">Employed</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Student">Student</option>
                    <option value="Retired">Retired</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Educational Attainment</Form.Label>
                  <Form.Select name="educationalAttainment" value={formData.educationalAttainment} onChange={handleInputChange}>
                    <option value="">Select Educational Attainment</option>
                    <option value="Elementary">Elementary</option>
                    <option value="High School">High School</option>
                    <option value="College">College</option>
                    <option value="Vocational">Vocational</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="None">None</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Voter's Status</Form.Label>
                  <Form.Select name="votersStatus" value={formData.votersStatus} onChange={handleInputChange}>
                    <option value="">Select Voter's Status</option>
                    <option value="Registered">Registered</option>
                    <option value="Not Registered">Not Registered</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control type="text" name="address" value={formData.address} onChange={handleInputChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control type="text" name="phone" value={formData.phone} onChange={handleInputChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Residence Status</Form.Label>
                  <Form.Select name="residenceStatus" value={formData.residenceStatus} onChange={handleInputChange}>
                    <option value="">Select Residence Status</option>
                    <option value="Owned">Owned</option>
                    <option value="Rented">Rented</option>
                    <option value="Leased">Leased</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Years of Stay</Form.Label>
                  <Form.Control type="number" name="yearsOfStay" value={formData.yearsOfStay} onChange={handleInputChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select name="role" value={formData.role} onChange={handleInputChange}>
                    <option value="Head">Head</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-center mt-4">
              <Button type="submit" style={{ backgroundColor: "#007bff", border: "none", padding: "10px 30px" }}>
                Add Resident
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mt-5 shadow-sm">
        <Card.Body>
          <h4 className="mb-4">Upload CSV</h4>
          <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: "none" }} id="csv-upload" />
          <label htmlFor="csv-upload" className="btn btn-secondary">
            Choose CSV File
          </label>
        </Card.Body>
      </Card>

      <ToastContainer />
    </div>
  );
};

export default AddResident;