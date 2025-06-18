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
            onClick={() => navigate('/track-shipment')}
            className="track-button"
          >
            🔍 Track Shipment
          </button>
          <button onClick={handleLogout} className="logout-button">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <h1 className="dashboard-title"> Create New Shipment</h1>
        <p className="dashboard-subtitle">Fill in the details below to create a new shipment with tracking</p>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Two-column layout container */}
        <div className="create-shipment-layout">
          {/* Form Container - Left Column (Wider) */}
          <div className="form-container shipment-form-column">
            <h2>Shipment Details</h2>
            <p>Please provide accurate information for successful delivery</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="recipientName">👤 Recipient Name</label>
                <input
                  type="text"
                  id="recipientName"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  required
                  placeholder="Enter recipient's full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="recipientPhoneNumber">📱 Recipient Phone Number</label>
                <input
                  type="tel"
                  id="recipientPhoneNumber"
                  name="recipientPhoneNumber"
                  value={formData.recipientPhoneNumber}
                  onChange={handleChange}
                  required
                  placeholder="Enter recipient's phone number (e.g., 9876543210)"
                />
                <small>Phone number will be used for delivery OTP</small>
              </div>

              <div className="form-group">
                <label htmlFor="deliveryAddress">📍 Delivery Address</label>
                <textarea
                  id="deliveryAddress"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  required
                  placeholder="Enter complete delivery address including street, city, state, and postal code"
                  rows="4"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="weight">⚖️ Weight (kg)</label>
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
                />
                <small>Weight must be between 0.01 kg and 1000 kg</small>
              </div>

              <div className="form-group">
                <label htmlFor="packageType"> Package Type</label>
                <select
                  id="packageType"
                  name="packageType"
                  value={formData.packageType}
                  onChange={handleChange}
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

              <div className="form-group">
                <label htmlFor="specialInstructions">📝 Special Instructions</label>
                <textarea
                  id="specialInstructions"
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  placeholder="Any special handling instructions (optional)"
                  rows="3"
                ></textarea>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="create-button"
                >
                  {loading ? 'Creating Shipment...' : '🚚 Create Shipment'}
                </button>
                <button 
                  type="button" 
                  onClick={() => navigate('/dashboard')}
                  className="track-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Info Section - Right Column */}
          <div className="info-section what-happens-next-column">
            <h3>🎯 What happens next?</h3>
            <div className="info-steps">
              <div className="info-step">
                <span className="step-number">1</span>
                <div className="step-content">
                  <h4>Tracking ID Generated</h4>
                  <p>A unique tracking ID will be created for this shipment</p>
                </div>
              </div>
              <div className="info-step">
                <span className="step-number">2</span>
                <div className="step-content">
                  <h4>QR Code Created</h4>
                  <p>A scannable QR code containing shipment details</p>
                </div>
              </div>
              <div className="info-step">
                <span className="step-number">3</span>
                <div className="step-content">
                  <h4>Notifications Sent</h4>
                  <p>Email and SMS alerts sent to you and recipient</p>
                </div>
              </div>
              <div className="info-step">
                <span className="step-number">4</span>
                <div className="step-content">
                  <h4>Ready to Track</h4>
                  <p>Monitor status and generate delivery OTP when ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateShipment; 