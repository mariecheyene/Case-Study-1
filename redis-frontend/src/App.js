import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './Login';
import Admin from './Dashboard/Admin';
import BarangayOfficial from './Dashboard/BarangayOfficial';
import DashboardHome from './Dashboard/Components/Dashboard';
import AddResident from './Dashboard/Components/Addresident';
import ResidentList from './Dashboard/Components/ResidentList';
import ViewResidentList from './Dashboard/Components/ViewResidentList'; 
import PurokManagement from './Dashboard/Components/PurokManagement';
import HouseholdManagement from './Dashboard/Components/HouseholdManagement';
import ContactDirectory from './Dashboard/Components/ContactDirectory';
import ResidencyVerification from './Dashboard/Components/ResidencyVerification';
import ReportsAnalytics from './Dashboard/Components/ReportsAnalytics';
import UserManagement from './Dashboard/Components/UserManagement';
import DocumentRequests from "./Dashboard/Components/DocumentRequests";
import About from './About';
import MapPage from './Dashboard/Components/MapPage'; // Import the new MapPage component
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';

const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    return <Navigate to="/" />;
  }
  
  // Convert both to lowercase for case-insensitive comparison
  const userRole = user.role.toLowerCase();
  const requiredRole = role.toLowerCase();
  
  return userRole === requiredRole ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/map" element={<MapPage />} /> {/* Add the Map route */}

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <Admin />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="add-resident" element={<AddResident />} />
          <Route path="resident-list" element={<ResidentList />} />
          <Route path="purok-management" element={<PurokManagement />} />
          <Route path="household-management" element={<HouseholdManagement />} />
          <Route path="contact-directory" element={<ContactDirectory />} />
          <Route path="residency-verification" element={<ResidencyVerification />} />
          <Route path="reports-analytics" element={<ReportsAnalytics />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="document-requests" element={<DocumentRequests />} />
        </Route>

        {/* Barangay Official Routes */}
        <Route
          path="/barangayOfficial/*"
          element={
            <ProtectedRoute role="barangayOfficial">
              <BarangayOfficial />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="resident-list" element={<ViewResidentList />} />
          <Route path="purok-management" element={<PurokManagement />} />
          <Route path="household-management" element={<HouseholdManagement />} />
          <Route path="contact-directory" element={<ContactDirectory />} />
          <Route path="residency-verification" element={<ResidencyVerification />} />
          <Route path="reports-analytics" element={<ReportsAnalytics />} />
          <Route path="document-requests" element={<DocumentRequests />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;