import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import './Dashboard.css';

const CreateShipment = () => {
  const [formData, setFormData] = useState({
    recipientName: '',
    deliveryAddress: '',
    recipientPhoneNumber: '',
    weight: '',
    packageType: '',
    specialInstructions: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');
  const userEmail = localStorage.getItem('userEmail');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate weight
    const weight = parseFloat(formData.weight);
    if (isNaN(weight) || weight < 0.01 || weight > 1000) {
      setError('Weight must be between 0.01 and 1000 kg');
      return;
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.recipientPhoneNumber)) {
      setError('Please enter a valid phone number (10-15 digits)');
      return;
    }

    setLoading(true);

    try {
      const userId = parseInt(localStorage.getItem('userId'));
      const shipmentData = {
        recipientName: formData.recipientName,
        deliveryAddress: formData.deliveryAddress,
        recipientPhoneNumber: formData.recipientPhoneNumber,
        weight: weight,
        packageType: formData.packageType || 'General',
        specialInstructions: formData.specialInstructions || '',
        userId
      };

      const response = await apiClient.post('/shipment', shipmentData);
      
      alert(`Shipment created! Tracking ID: ${response.data.trackingId}`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create shipment. Please try again.');
    } finally {
      setLoading(false);
    }
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
            onClick={() => navigate('/track-shipment')}
            className="modern-btn secondary"
          >
            🔍 Track Shipment
          </button>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1>📦 Create New Shipment</h1>
          <p>Fill in the details below to create a new shipment with tracking</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="modern-error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* Form Section */}
      <div className="shipment-form-container">
        <div className="form-card">
          <div className="form-header">
            <h2>Shipment Details</h2>
            <p>Please provide accurate information for successful delivery</p>
          </div>

          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="recipientName">
                  <span className="label-icon">👤</span>
                  Recipient Name
                </label>
                <input
                  type="text"
                  id="recipientName"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  required
                  placeholder="Enter recipient's full name"
                  className="modern-input"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="recipientPhoneNumber">
                  <span className="label-icon">📱</span>
                  Recipient Phone Number
                </label>
                <input
                  type="tel"
                  id="recipientPhoneNumber"
                  name="recipientPhoneNumber"
                  value={formData.recipientPhoneNumber}
                  onChange={handleChange}
                  required
                  placeholder="Enter recipient's phone number (e.g., 9876543210)"
                  className="modern-input"
                />
                <small className="form-hint">
                  Phone number will be used for delivery OTP
                </small>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="deliveryAddress">
                  <span className="label-icon">📍</span>
                  Delivery Address
                </label>
                <textarea
                  id="deliveryAddress"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  required
                  placeholder="Enter complete delivery address including street, city, state, and postal code"
                  rows="4"
                  className="modern-textarea"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="weight">
                  <span className="label-icon">⚖️</span>
                  Weight (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  min="0.01"
                  max="1000"
                  step="0.01"
                  placeholder="0.01 - 1000 kg"
                  className="modern-input"
                />
                <small className="form-hint">
                  Weight must be between 0.01 kg and 1000 kg
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="packageType">
                  <span className="label-icon">📦</span>
                  Package Type
                </label>
                <select
                  id="packageType"
                  name="packageType"
                  value={formData.packageType}
                  onChange={handleChange}
                  className="modern-select"
                >
                  <option value="">Select package type (optional)</option>
                  <option value="General">General</option>
                  <option value="Documents">Documents</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Fragile">Fragile</option>
                  <option value="Perishable">Perishable</option>
                  <option value="Books">Books</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="specialInstructions">
                  <span className="label-icon">📝</span>
                  Special Instructions
                </label>
                <textarea
                  id="specialInstructions"
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  placeholder="Any special handling instructions (optional)"
                  rows="3"
                  className="modern-textarea"
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                disabled={loading}
                className="modern-btn primary large"
              >
                {loading ? (
                  <>
                    <div className="btn-spinner"></div>
                    Creating Shipment...
                  </>
                ) : (
                  <>
                    <span>🚚</span>
                    Create Shipment
                  </>
                )}
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/dashboard')}
                className="modern-btn secondary large"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="info-card">
          <div className="info-header">
            <h3>🎯 What happens next?</h3>
          </div>
          <div className="info-content">
            <div className="info-step">
              <div className="step-icon">1️⃣</div>
              <div className="step-text">
                <h4>Tracking ID Generated</h4>
                <p>A unique tracking ID will be created for this shipment</p>
              </div>
            </div>
            <div className="info-step">
              <div className="step-icon">2️⃣</div>
              <div className="step-text">
                <h4>QR Code Created</h4>
                <p>A scannable QR code containing shipment details</p>
              </div>
            </div>
            <div className="info-step">
              <div className="step-icon">3️⃣</div>
              <div className="step-text">
                <h4>Notifications Sent</h4>
                <p>Email and SMS alerts sent to you and recipient</p>
              </div>
            </div>
            <div className="info-step">
              <div className="step-icon">4️⃣</div>
              <div className="step-text">
                <h4>Ready to Track</h4>
                <p>Monitor status and generate delivery OTP when ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateShipment; 