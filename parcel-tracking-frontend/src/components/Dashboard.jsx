import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import './Dashboard.css';

const Dashboard = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/shipment/user/${userId}`);
      setShipments(response.data);
    } catch (err) {
      setError('Failed to fetch shipments');
      console.error('Error fetching shipments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverOtp = async (shipmentId) => {
    try {
      // Get the shipment with the corresponding ID
      const shipment = shipments.find(s => s.id === shipmentId);
      if (shipment) {
        navigate(`/track/${shipment.trackingId}`);
      } else {
        setError('Shipment not found');
      }
    } catch (err) {
      setError('Failed to navigate to tracking page');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="modern-dashboard">
        <div className="loading-container">
          <div className="modern-spinner"></div>
          <p>Loading your shipments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-dashboard">
      {/* Header Section */}
      <div className="customer-header">
        <div className="header-left">
          <div className="logo-section">
            <h1>📦 SmartTracking</h1>
          </div>
          <div className="user-info">
            <span className="user-name">Welcome, {userName}!</span>
            <span className="user-email">{userEmail}</span>
          </div>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/track-shipment')}
            className="modern-btn secondary"
          >
            🔍 Track Shipment
          </button>
          <button 
            onClick={() => navigate('/create-shipment')}
            className="modern-btn primary"
          >
            📦 Create Shipment
          </button>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1>Your Dashboard</h1>
          <p>Manage and track all your shipments in one place</p>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-number">{shipments.length}</div>
            <div className="stat-label">Total Shipments</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{shipments.filter(s => s.status === 'Pending').length}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{shipments.filter(s => s.status === 'In Transit').length}</div>
            <div className="stat-label">In Transit</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{shipments.filter(s => s.status === 'Delivered').length}</div>
            <div className="stat-label">Delivered</div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="modern-error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* Shipments Section */}
      {shipments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No Shipments Yet</h3>
          <p>You haven't created any shipments yet. Start by creating your first shipment!</p>
          <button 
            onClick={() => navigate('/create-shipment')}
            className="modern-btn primary"
          >
            Create Your First Shipment
          </button>
        </div>
      ) : (
        <div className="shipments-section">
          <div className="section-header">
            <h2>Your Shipments</h2>
            <div className="header-actions">
              <button 
                onClick={() => navigate('/track-shipment')}
                className="modern-btn secondary"
              >
                Track Any Shipment
              </button>
            </div>
          </div>

          <div className="shipments-grid">
            {shipments.map((shipment) => (
              <div key={shipment.id} className="shipment-card">
                <div className="card-header">
                  <div className="tracking-info">
                    <h4>{shipment.trackingId}</h4>
                    <span className={`status-badge ${shipment.status.toLowerCase().replace(' ', '-')}`}>
                      {shipment.status}
                    </span>
                  </div>
                  <div className="card-id">#{shipment.id}</div>
                </div>

                <div className="card-content">
                  <div className="recipient-info">
                    <div className="info-item">
                      <span className="label">👤 Recipient:</span>
                      <span className="value">{shipment.recipientName}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">📅 Created:</span>
                      <span className="value">{new Date(shipment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">📍 Address:</span>
                      <span className="value">{shipment.deliveryAddress}</span>
                    </div>
                  </div>

                  {shipment.qrCodeImage && (
                    <div className="qr-section">
                      <h5>QR Code</h5>
                      <img 
                        src={`data:image/png;base64,${shipment.qrCodeImage}`}
                        alt="QR Code"
                        className="qr-code"
                        onClick={() => {
                          const newWindow = window.open();
                          newWindow.document.write(`
                            <html>
                              <head><title>QR Code - ${shipment.trackingId}</title></head>
                              <body style="display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f0f0f0;">
                                <img src="data:image/png;base64,${shipment.qrCodeImage}" style="max-width:90%;height:auto;" />
                              </body>
                            </html>
                          `);
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  {!shipment.status.includes('Delivered') ? (
                    <button
                      onClick={() => handleDeliverOtp(shipment.id)}
                      className="modern-btn primary"
                    >
                      🔍 Track Package
                    </button>
                  ) : shipment.status === 'Delivered_Tampered' ? (
                    <div className="delivered-badge tampered">
                      ⚠️ Delivered (Tampered)
                    </div>
                  ) : (
                    <div className="delivered-badge">
                      ✅ Delivered
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button 
            onClick={() => navigate('/create-shipment')}
            className="action-card"
          >
            <div className="action-icon">📦</div>
            <div className="action-text">
              <h4>Create Shipment</h4>
              <p>Send a new package</p>
            </div>
          </button>
          <button 
            onClick={() => navigate('/track-shipment')}
            className="action-card"
          >
            <div className="action-icon">🔍</div>
            <div className="action-text">
              <h4>Track Shipment</h4>
              <p>Find any package</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 