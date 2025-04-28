import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Modal, Form, Alert, Spinner, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcementData, setAnnouncementData] = useState({
    title: "",
    date: new Date(),
    description: ""
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/announcements");
      setAnnouncements(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAnnouncementData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setAnnouncementData(prev => ({ ...prev, date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const formattedDate = format(announcementData.date, "yyyy-MM-dd");
      const payload = { ...announcementData, date: formattedDate };

      if (editingAnnouncement) {
        await axios.put(`http://localhost:5000/announcements/${editingAnnouncement.id}`, payload);
        setSuccess("Announcement updated successfully!");
      } else {
        await axios.post("http://localhost:5000/announcements", payload);
        setSuccess("Announcement added successfully!");
      }

      setShowModal(false);
      setEditingAnnouncement(null);
      setAnnouncementData({ title: "", date: new Date(), description: "" });
      fetchAnnouncements();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save announcement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementData({
      title: announcement.title,
      date: new Date(announcement.date),
      description: announcement.description
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await axios.delete(`http://localhost:5000/announcements/${id}`);
        setSuccess("Announcement deleted successfully!");
        fetchAnnouncements();
      } catch (error) {
        setError("Failed to delete announcement");
      }
    }
  };

  return (
    <div className="container mt-4">
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Announcements</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>Add Announcement</Button>
      </div>

      <Modal show={showModal} onHide={() => !isSubmitting && setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingAnnouncement ? "Edit Announcement" : "New Announcement"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title *</Form.Label>
              <Form.Control type="text" name="title" value={announcementData.title} onChange={handleInputChange} required disabled={isSubmitting} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date *</Form.Label>
              <DatePicker selected={announcementData.date} onChange={handleDateChange} className="form-control" dateFormat="yyyy-MM-dd" required disabled={isSubmitting} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={announcementData.description} onChange={handleInputChange} required disabled={isSubmitting} />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)} disabled={isSubmitting}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Save"}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {loading && <div className="text-center my-5"><Spinner animation="border" /><p>Loading announcements...</p></div>}

      <div className="row">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="col-md-6 col-lg-4 mb-4">
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <Card.Title>{announcement.title}</Card.Title>
                  <div>
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(announcement)}>Edit</Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(announcement.id)}>Delete</Button>
                  </div>
                </div>
                <Card.Subtitle className="mb-3 text-muted">{new Date(announcement.date).toLocaleDateString()}</Card.Subtitle>
                <Card.Text>{announcement.description}</Card.Text>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
