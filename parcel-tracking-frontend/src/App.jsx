import React from 'react';
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CreateShipment from './components/CreateShipment';
import TrackShipment from './components/TrackShipment';
import DirectTrackShipment from './components/DirectTrackShipment';
import OtpVerification from './components/OtpVerification';
import HandlerLogin from './components/HandlerLogin';
import HandlerDashboard from './components/HandlerDashboard';
import HandlerOtpVerification from './components/HandlerOtpVerification';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const userId = localStorage.getItem('userId');
  return userId ? children : <Navigate to="/login" replace />;
};

// Handler Protected Route Component
const HandlerProtectedRoute = ({ children }) => {
  const handlerUser = localStorage.getItem('handlerUser');
  const userRole = localStorage.getItem('userRole');
  return handlerUser && userRole === 'handler' ? children : <Navigate to="/handler-login" replace />;
};

// Admin Protected Route Component
const AdminProtectedRoute = ({ children }) => {
  const adminUser = localStorage.getItem('adminUser');
  const userRole = localStorage.getItem('userRole');
  return adminUser && userRole === 'admin' ? children : <Navigate to="/admin-login" replace />;
};

// Navigation Component
const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  // Don't show navigation on special login pages, admin/handler dashboards, home page, or customer pages with integrated headers
  if (location.pathname === '/' ||
      location.pathname === '/login' || 
      location.pathname === '/register' || 
      location.pathname === '/handler-login' ||
      location.pathname === '/admin-login' ||
      location.pathname === '/handler-dashboard' ||
      location.pathname === '/admin-dashboard' ||
      location.pathname === '/dashboard' ||
      location.pathname === '/create-shipment' ||
      location.pathname === '/track-shipment' ||
      location.pathname.startsWith('/otp-verification/') ||
      location.pathname.startsWith('/handler-otp-verification/')) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="container">
        <h1>Parcel Tracker</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <nav>
            <Link to="/track-shipment">Track Shipment</Link>
            {userId && (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/create-shipment">Create Shipment</Link>
              </>
            )}
            {!userId && (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
                <div style={{ margin: '0 10px', color: '#7f8c8d' }}>|</div>
                <Link to="/handler-login">Handler Login</Link>
                <Link to="/admin-login">Admin Login</Link>
              </>
            )}
          </nav>
          {userId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>Welcome, {userName}!</span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

function App() {
  const userId = localStorage.getItem('userId');

  return (
    <div className="App">
      <Navigation />
      <div className="container">
        <Routes>
          {/* Home Route */}
          <Route path="/" element={<Home />} />
          
          {/* Regular User Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/track-shipment" element={<TrackShipment />} />
          <Route path="/track/:trackingId" element={<DirectTrackShipment />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-shipment" 
            element={
              <ProtectedRoute>
                <CreateShipment />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/otp-verification/:shipmentId" 
            element={
              <ProtectedRoute>
                <OtpVerification />
              </ProtectedRoute>
            } 
          />

          {/* Handler Routes */}
          <Route path="/handler-login" element={<HandlerLogin />} />
          <Route 
            path="/handler-dashboard" 
            element={
              <HandlerProtectedRoute>
                <HandlerDashboard />
              </HandlerProtectedRoute>
            } 
          />
          <Route 
            path="/handler-otp-verification/:shipmentId" 
            element={
              <HandlerProtectedRoute>
                <HandlerOtpVerification />
              </HandlerProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route 
            path="/admin-dashboard" 
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            } 
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App; 