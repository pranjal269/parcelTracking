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
            onClick={() => navigate('/dashboard')}
            className="modern-btn secondary"
          >
            🏠 Dashboard
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
          <h1>🔍 Track Your Shipment</h1>
          <p>Enter your tracking ID below to check the real-time status of your shipment</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="tracking-search-container">
        <div className="search-card">
          <div className="search-header">
            <h2>Enter Tracking Information</h2>
            <p>Tracking IDs are usually in the format PT-XXXX-XXXXXX</p>
          </div>

          <form onSubmit={handleSubmit} className="tracking-form">
            <div className="search-input-group">
              <div className="input-wrapper">
                <span className="input-icon">📦</span>
                <input
                  type="text"
                  id="trackingId"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter your tracking ID (e.g., PT-2506-F82RRC)"
                  required
                  className="tracking-input"
                />
              </div>
              <div className="search-actions">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="modern-btn primary large"
                >
                  {loading ? (
                    <>
                      <div className="btn-spinner"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      Track Shipment
                    </>
                  )}
                </button>
                {searched && (
                  <button 
                    type="button" 
                    onClick={handleReset}
                    className="modern-btn secondary large"
                  >
                    <span>🔄</span>
                    Reset
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="tracking-loading">
          <div className="loading-animation">
            <div className="package-icon">📦</div>
            <div className="loading-text">
              <h3>Searching for your shipment...</h3>
              <p>Please wait while we locate your package</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="modern-error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* Shipment Results */}
      {shipment && (
        <div className="tracking-results">
          <div className="result-card">
            <div className="result-header">
              <div className="success-icon">✅</div>
              <div className="success-text">
                <h2>Shipment Found!</h2>
                <p>Here are the details for your shipment</p>
              </div>
            </div>

            <div className="shipment-details">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">🏷️ Tracking ID</span>
                  <span className="detail-value">{shipment.trackingId}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">👤 Recipient</span>
                  <span className="detail-value">{shipment.recipientName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">📍 Delivery Address</span>
                  <span className="detail-value">{shipment.deliveryAddress}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">📅 Created Date</span>
                  <span className="detail-value">{new Date(shipment.createdAt).toLocaleDateString()}</span>
                </div>
                {shipment.deliveredAt && (
                  <div className="detail-item">
                    <span className="detail-label">🎯 Delivered Date</span>
                    <span className="detail-value">{new Date(shipment.deliveredAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="status-section">
                <h3>Current Status</h3>
                <div className={`status-indicator ${shipment.status.toLowerCase().replace(' ', '-')}`}>
                  <div className="status-icon">
                    {shipment.status === 'Delivered' ? '🎯' : shipment.status === 'In Transit' ? '🚚' : '📦'}
                  </div>
                  <div className="status-text">
                    <h4>{shipment.status}</h4>
                    <p>
                      {shipment.status === 'Delivered' 
                        ? 'Your package has been successfully delivered!'
                        : shipment.status === 'In Transit'
                        ? 'Your package is on its way to the destination.'
                        : 'Your package is being processed.'}
                    </p>
                  </div>
                </div>
              </div>

              {shipment.qrCodeImage && (
                <div className="qr-section">
                  <h3>QR Code</h3>
                  <div className="qr-display">
                    <img 
                      src={`data:image/png;base64,${shipment.qrCodeImage}`}
                      alt="Shipment QR Code"
                      className="qr-image"
                    />
                    <p>Scan this QR code for quick access to shipment details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {searched && !shipment && !loading && !error && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No Shipment Found</h3>
          <p>No shipment found with tracking ID "<strong>{trackingId}</strong>"</p>
          <p>Please check the tracking ID and try again.</p>
          <button 
            onClick={handleReset}
            className="modern-btn primary"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Help Section */}
      <div className="help-section">
        <div className="help-card">
          <h3>💡 Need Help?</h3>
          <div className="help-tips">
            <div className="tip">
              <span className="tip-icon">✓</span>
              <span>Make sure you've entered the correct tracking ID</span>
            </div>
            <div className="tip">
              <span className="tip-icon">✓</span>
              <span>Tracking IDs are usually in the format PT-XXXX-XXXXXX</span>
            </div>
            <div className="tip">
              <span className="tip-icon">✓</span>
              <span>Check your email for the tracking ID if you can't find it</span>
            </div>
            <div className="tip">
              <span className="tip-icon">✓</span>
              <span>Contact customer support if you continue to have issues</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackShipment; 