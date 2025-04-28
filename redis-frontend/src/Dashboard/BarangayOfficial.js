import React, { useState, useEffect } from "react";
import { NavLink, Routes, Route, useLocation, Navigate } from "react-router-dom";
import "./css/Admin.css"; // Reuse the same CSS as Admin
import "boxicons/css/boxicons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import DashboardHome from "./Components/Dashboard";
import ViewResidentList from './Components/ViewResidentList';
import PurokManagement from "./Components/PurokManagement";
import HouseholdManagement from "./Components/HouseholdManagement";
import ContactDirectory from "./Components/ContactDirectory";
import ReportsAnalytics from "./Components/ReportsAnalytics";
import ResidencyVerification from './Components/ResidencyVerification';
import DocumentRequests from "./Components/DocumentRequests";
import { Badge, Dropdown } from "react-bootstrap";
import axios from "axios";

const BarangayOfficial = () => {
  const [isSidebarClosed, setIsSidebarClosed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [requests, setRequests] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    fetchDocumentRequests();
    const interval = setInterval(fetchDocumentRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarClosed(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode);
    document.body.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const fetchDocumentRequests = async () => {
    try {
      const response = await axios.get("http://localhost:5000/document-requests");
      const requestsWithViewed = response.data.map(req => ({
        ...req,
        viewed: req.viewed === 'true' // Convert Redis string to boolean
      }));
      
      setRequests(requestsWithViewed);
      setUnreadCount(requestsWithViewed.filter(req => !req.viewed).length);
      
    } catch (error) {
      console.error("Error fetching document requests:", error);
    }
  };

  const markAsViewed = async (id) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/document-requests/${id}`,
        { viewed: true }
      );
      
      // Update the unread count with the response from server
      setUnreadCount(response.data.unreadCount);
      
      // Update the local requests state
      setRequests(prev => prev.map(req => 
        req._id === id ? { ...req, viewed: true } : req
      ));
      
    } catch (error) {
      console.error("Error marking request as viewed:", error);
    }
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarClosed ? "close" : ""}`}>
        <NavLink to="/barangayOfficial/dashboard" className="logo">
          <i className="bx bx-home"></i>
          <div className="logo-name">
            <span>Barangay</span>Acmac
          </div>
        </NavLink>
        <ul className="side-menu">
          {[
            { name: "Dashboard", icon: "bx bxs-dashboard", path: "/barangayOfficial/dashboard" },
            { name: "Resident List", icon: "bx bx-group", path: "/barangayOfficial/resident-list" },
            { name: "Purok Management", icon: "bx bx-map", path: "/barangayOfficial/purok-management" },
            { name: "Household\nManagement", icon: "bx bx-home-alt", path: "/barangayOfficial/household-management" }, 
            { name: "Contact Directory", icon: "bx bx-book-open", path: "/barangayOfficial/contact-directory" },
            { name: "Residency Verification", icon: "bx bx-file", path: "/barangayOfficial/residency-verification" },
            { name: "Reports & Analytics", icon: "bx bx-line-chart", path: "/barangayOfficial/reports-analytics" },
            { name: "Document Requests", icon: "bx bx-file", path: "/barangayOfficial/document-requests" },
          ].map((link, index) => (
            <li key={index}>
              <NavLink
                to={link.path}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <i className={link.icon}></i>
                <span>{link.name.split("\n").map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <ul className="side-menu">
          <li>
            <NavLink to="/" className="logout" onClick={() => localStorage.removeItem("user")}>
              <i className="bx bx-log-out-circle"></i>
              Logout
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        {/* Navbar */}
        <nav>
          <i className="bx bx-menu" onClick={() => setIsSidebarClosed(!isSidebarClosed)}></i>
          
          <Dropdown className="notification-dropdown me-3">
            <Dropdown.Toggle variant="link" id="dropdown-notifications">
              <i className="bx bx-bell"></i>
              {unreadCount > 0 && (
                <Badge pill bg="danger" className="notification-badge">
                  {unreadCount}
                </Badge>
              )}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Header>
                Document Requests ({unreadCount} new)
              </Dropdown.Header>
              {requests.slice(0, 5).map((request) => (
                <Dropdown.Item 
                  key={request._id}
                  className={!request.viewed ? "unread" : ""}
                  onClick={() => markAsViewed(request._id)}
                >
                  <strong>{request.fullName}</strong> - {request.documentType}
                  <br />
                  <small>{request.purpose.substring(0, 30)}...</small>
                </Dropdown.Item>
              ))}
              <Dropdown.Divider />
              <Dropdown.Item as={NavLink} to="/barangayOfficial/document-requests">
                View All Requests
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <div className="theme-toggle-container">
            <i className={`bx ${isDarkMode ? "" : ""}`}></i>
            <input
              type="checkbox"
              id="theme-toggle"
              hidden
              checked={isDarkMode}
              onChange={() => setIsDarkMode(!isDarkMode)}
            />
            <label htmlFor="theme-toggle" className="theme-toggle"></label>
          </div>
          <NavLink to="#" className="profile">
            <img src="/img/user.png" alt="Profile" />
          </NavLink>
        </nav>

        {/* Routing for Dashboard Sections */}
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/barangayOfficial/dashboard" />} />
             <Route path="dashboard" element={<DashboardHome />} />
             <Route path="resident-list" element={<ViewResidentList />} /> {/* Use ViewResidentList for Barangay Officials */}
             <Route path="purok-management" element={<PurokManagement />} />
             <Route path="household-management" element={<HouseholdManagement />} />
             <Route path="contact-directory" element={<ContactDirectory />} />
             <Route path="residency-verification" element={<ResidencyVerification />} />
             <Route path="reports-analytics" element={<ReportsAnalytics />} />
             <Route path="document-requests" element={<DocumentRequests />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default BarangayOfficial;