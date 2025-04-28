import React, { useState, useEffect } from "react";
import { NavLink, Routes, Route, useLocation, Navigate } from "react-router-dom";
import "./css/Admin.css";
import "boxicons/css/boxicons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import DashboardHome from "./Components/Dashboard";
import AddResident from "./Components/Addresident";
import ResidentList from "./Components/ResidentList";
import PurokManagement from "./Components/PurokManagement";
import HouseholdManagement from "./Components/HouseholdManagement";
import ContactDirectory from "./Components/ContactDirectory";
import ResidencyVerification from "./Components/ResidencyVerification";
import ReportsAnalytics from "./Components/ReportsAnalytics";
import UserManagement from "./Components/UserManagement";
import DocumentRequests from "./Components/DocumentRequests";
import { Badge, Dropdown } from "react-bootstrap";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./css/dark-mode.css";

const Admin = () => {
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
    
    // Apply dark mode class immediately
    if (savedDarkMode) {
      document.body.classList.add("dark");
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode);
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  const fetchDocumentRequests = async () => {
    try {
      const response = await axios.get("http://localhost:5000/document-requests");
      const requestsWithViewed = response.data.map(req => ({
        ...req,
        viewed: req.viewed === true || req.viewed === 'true'
      }));
      
      setRequests(requestsWithViewed);
      setUnreadCount(requestsWithViewed.filter(req => !req.viewed).length);
    } catch (error) {
      console.error("Error fetching document requests:", error);
      toast.error("Failed to load document requests");
    }
  };

  const markAsViewed = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/document-requests/${id}`,
        { viewed: true }
      );
      
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, viewed: true } : req
      ));
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error("Error marking request as viewed:", error);
      toast.error("Failed to mark as read");
    }
  };

  return (
    <div className="dashboard">
      <div className={`sidebar ${isSidebarClosed ? "close" : ""}`}>
        <NavLink to="/admin/dashboard" className="logo">
          <i className="bx bx-home"></i>
          <div className="logo-name">
            <span>Barangay</span>Acmac
          </div>
        </NavLink>
        <ul className="side-menu">
          {[
            { name: "Dashboard", icon: "bx bxs-dashboard", path: "/admin/dashboard" },
            { name: "Add Resident", icon: "bx bx-user-plus", path: "/admin/add-resident" },
            { name: "Resident List", icon: "bx bx-group", path: "/admin/resident-list" },
            { name: "Purok Management", icon: "bx bx-map", path: "/admin/purok-management" },
            { name: "Household\nManagement", icon: "bx bx-home-alt", path: "/admin/household-management" },
            { name: "Contact Directory", icon: "bx bx-book-open", path: "/admin/contact-directory" },
            { name: "Residency Verification", icon: "bx bx-file", path: "/admin/residency-verification" },
            { name: "Reports & Analytics", icon: "bx bx-line-chart", path: "/admin/reports-analytics" },
            { name: "User Management", icon: "bx bx-cog", path: "/admin/user-management" },
            { name: "Document Requests", icon: "bx bx-file", path: "/admin/document-requests" },
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

      <div className="content">
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
                  key={request.id}
                  className={!request.viewed ? "unread" : ""}
                  onClick={() => markAsViewed(request.id)}
                >
                  <strong>{request.fullName}</strong> - {request.documentType}
                  <br />
                  <small>{request.purpose.substring(0, 30)}...</small>
                </Dropdown.Item>
              ))}
              <Dropdown.Divider />
              <Dropdown.Item as={NavLink} to="/admin/document-requests">
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
            <img src="/img/admin.png" alt="Profile" />
          </NavLink>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/admin/dashboard" />} />
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/add-resident" element={<AddResident />} />
            <Route path="/resident-list" element={<ResidentList />} />
            <Route path="/purok-management" element={<PurokManagement />} />
            <Route path="/household-management" element={<HouseholdManagement />} />
            <Route path="/contact-directory" element={<ContactDirectory />} />
            <Route path="/residency-verification" element={<ResidencyVerification />} />
            <Route path="/reports-analytics" element={<ReportsAnalytics />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/document-requests" element={<DocumentRequests />} />
          </Routes>
        </main>
      </div>

      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Admin;