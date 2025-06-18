import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import './Dashboard.css';

const TrackShipment = () => {
  const [trackingId, setTrackingId] = useState('');
  const [shipment, setShipment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');
  const userEmail = localStorage.getItem('userEmail');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      setError('Please enter a tracking ID');
      return;
    }

    setError('');
    setLoading(true);
    setSearched(true);
    setShipment(null);

    try {
      const response = await apiClient.get(`/shipment/tracking/${trackingId.trim()}`);
      setShipment(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Shipment not found. Please check your tracking ID and try again.');
      } else {
        setError(err.response?.data?.message || 'An error occurred while tracking the shipment.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTrackingId('');
    setShipment(null);
    setError('');
    setSearched(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    navigate('/login');
  };

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
            onClick={() => navigate('/dashboard')}
            className="track-button"
          >
            🏠 Dashboard
          </button>
          <button 
            onClick={() => navigate('/create-shipment')}
            className="create-button"
          >
            📦 Create Shipment
          </button>
          <button onClick={handleLogout} className="logout-button">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <h1 className="dashboard-title">🔍 Track Your Shipment</h1>
        <p className="dashboard-subtitle">Enter your tracking ID below to check the real-time status of your shipment</p>

        {/* Search Form */}
        <div className="tracking-form-container">
          <form onSubmit={handleSubmit}>
            <div className="tracking-input-group">
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Enter your tracking ID (e.g., PT-2506-F82RRC)"
                className="tracking-input"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="track-button"
              style={{ marginTop: '15px' }}
            >
              {loading ? 'Searching...' : '🔍 Track Shipment'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Shipment Results */}
        {shipment && (
          <div className="tracking-result">
            <h3>Shipment Found</h3>
            <div className="details">
              <p><strong>Tracking ID:</strong> {shipment.trackingId}</p>
              <p><strong>Status:</strong> {shipment.status}</p>
              <p><strong>Recipient:</strong> {shipment.recipientName}</p>
              <p><strong>Delivery Address:</strong> {shipment.deliveryAddress}</p>
              <p><strong>Created:</strong> {new Date(shipment.createdAt).toLocaleDateString()}</p>
              {shipment.currentAddress && (
                <p><strong>Current Location:</strong> {shipment.currentAddress}</p>
              )}
            </div>
            
            {shipment.qrCodeImage && (
              <div className="qr-code">
                <h4>QR Code</h4>
                <img 
                  src={`data:image/png;base64,${shipment.qrCodeImage}`} 
                  alt="QR Code" 
                  style={{ maxWidth: '200px' }}
                />
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="help-section">
          <h3>💡 Need Help?</h3>
          <p>✓ Make sure you've entered the correct tracking ID</p>
          <p>✓ Tracking IDs are usually in the format PT-XXXX-XXXXXX</p>
          <p>✓ Check your email for the tracking ID if you can't find it</p>
          <p>✓ Contact customer support if you continue to have issues</p>
        </div>
      </div>
    </div>
  );
};

export default TrackShipment; 