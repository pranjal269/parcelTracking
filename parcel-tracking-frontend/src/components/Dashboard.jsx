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
      <div className="dashboard-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your shipments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header Section - Simple design matching screenshot */}
      <div className="customer-header-container">
        <div className="logo-section">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span className="logo-text">SmartTracking</span>
        </div>
        
        <div className="customer-welcome">Welcome, {userName || userEmail}</div>
        
        <div className="customer-actions">
          <button 
            onClick={() => navigate('/track-shipment')}
            className="track-button"
          >
            🔍 Track Shipment
          </button>
          <button 
            onClick={() => navigate('/create-shipment')}
            className="create-button"
          >
             Create Shipment
          </button>
          <button onClick={handleLogout} className="logout-button">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        <h1 className="dashboard-title">Your Dashboard</h1>
        <p className="dashboard-subtitle">Manage and track all your shipments in one place</p>

        {/* Stats Cards */}
        <div className="customer-stats">
          <div className="customer-stat-item">
            <p className="stat-title">Total Shipments</p>
            <p className="stat-value">{shipments.length}</p>
          </div>
          <div className="customer-stat-item">
            <p className="stat-title">Pending</p>
            <p className="stat-value">{shipments.filter(s => s.status === 'Pending').length}</p>
          </div>
          <div className="customer-stat-item">
            <p className="stat-title">In Transit</p>
            <p className="stat-value">{shipments.filter(s => s.status === 'In Transit').length}</p>
          </div>
          <div className="customer-stat-item">
            <p className="stat-title">Delivered</p>
            <p className="stat-value">{shipments.filter(s => s.status.includes('Delivered')).length}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Shipments Section */}
        <div className="customer-shipments">
          <h2 className="customer-shipments-title">Your Shipments</h2>
          
          {shipments.length === 0 ? (
            <div className="no-shipments">
              <p>You haven't created any shipments yet. Start by creating your first shipment!</p>
              <button 
                onClick={() => navigate('/create-shipment')}
                className="create-button"
                style={{ marginTop: '15px' }}
              >
                Create Your First Shipment
              </button>
            </div>
          ) : (
            <div className="shipment-card-container">
              {shipments.map((shipment) => (
                <div key={shipment.id} className="customer-shipment-card">
                  <h3 className="shipment-tracking-id">{shipment.trackingId}</h3>
                  
                  <div className="shipment-status-container">
                    <span className={`shipment-status ${shipment.status.toLowerCase().replace('_', '-')}`}>
                      {shipment.status === 'Delivered_Tampered' ? 'DELIVERED (TAMPERED)' : shipment.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="shipment-info-item">
                    <span className="info-icon">👤</span>
                    <span><strong>Recipient:</strong> {shipment.recipientName}</span>
                  </div>
                  
                  <div className="shipment-info-item">
                    <span className="info-icon">📅</span>
                    <span><strong>Created:</strong> {new Date(shipment.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="shipment-info-item">
                    <span className="info-icon">📍</span>
                    <span><strong>Address:</strong> {shipment.deliveryAddress}</span>
                  </div>

                  {shipment.qrCodeImage && (
                    <div className="qr-code-section">
                      <p className="qr-code-title">QR Code</p>
                      <img 
                        src={`data:image/png;base64,${shipment.qrCodeImage}`}
                        alt="QR Code"
                        className="qr-code-image"
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

                  <div className="shipment-actions" style={{ marginTop: '10px' }}>
                    {shipment.status === 'Delivered' && (
                      <div className="shipment-footer">
                        <span className="shipment-delivered-tag">✅ Delivered</span>
                      </div>
                    )}
                    
                    {shipment.status === 'Delivered_Tampered' && (
                      <div className="shipment-footer">
                        <span className="shipment-delivered-tag tampered">⚠️ Delivered (Tampered)</span>
                      </div>
                    )}
                    
                    {!shipment.status.includes('Delivered') && (
                      <button
                        onClick={() => handleDeliverOtp(shipment.id)}
                        className="track-button"
                      >
                        🔍 Track Package
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 