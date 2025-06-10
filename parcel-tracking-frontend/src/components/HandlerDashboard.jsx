import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import './Dashboard.css';

const HandlerDashboard = () => {
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [handlerUser, setHandlerUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('handlerUser');
    const userRole = localStorage.getItem('userRole');
    
    if (!userData || userRole !== 'handler') {
      navigate('/handler-login');
      return;
    }
    
    setHandlerUser(JSON.parse(userData));
    fetchShipments();
  }, [navigate]);

  const fetchShipments = async () => {
    try {
      const response = await apiClient.get('/handler/shipments');
      setShipments(response.data);
      setFilteredShipments(response.data);
    } catch (error) {
      setError('Failed to fetch shipments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    if (status === 'all') {
      setFilteredShipments(shipments);
    } else {
      setFilteredShipments(shipments.filter(s => s.status === status));
    }
  };

  const updateShipmentStatus = async (shipmentId, newStatus, currentAddress = '') => {
    try {
      const response = await apiClient.put(`/handler/shipments/${shipmentId}/status`, {
        status: newStatus,
        currentAddress: currentAddress || `Updated to ${newStatus}`
      });
      
      if (response.data) {
        // Refresh shipments
        fetchShipments();
        alert('Shipment status updated successfully!');
      }
    } catch (error) {
      alert('Failed to update shipment status');
    }
  };

  const markAsDelivered = async (shipmentId) => {
    const deliveryAddress = prompt('Enter delivery confirmation details:');
    if (deliveryAddress) {
      try {
        await apiClient.put(`/handler/shipments/${shipmentId}/deliver`, {
          deliveryAddress: deliveryAddress
        });
        fetchShipments();
        alert('Shipment marked as delivered successfully!');
      } catch (error) {
        alert('Failed to mark shipment as delivered');
      }
    }
  };

  const generateOTP = async (shipmentId) => {
    try {
      const response = await apiClient.post(`/shipment/otp/${shipmentId}`);
      if (response.data.otp) {
        alert(`OTP generated: ${response.data.otp}\nThis has been sent to the customer via email and SMS.`);
      }
    } catch (error) {
      alert('Failed to generate OTP');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('handlerUser');
    localStorage.removeItem('userRole');
    navigate('/handler-login');
  };

  if (loading) return <div className="loading">Loading shipments...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Handler Dashboard</h1>
          <p>Welcome back, {handlerUser?.firstName} {handlerUser?.lastName}</p>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{shipments.length}</h3>
          <p>Total Shipments</p>
        </div>
        <div className="stat-card">
          <h3>{shipments.filter(s => s.status === 'Pending').length}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-card">
          <h3>{shipments.filter(s => s.status === 'In Transit').length}</h3>
          <p>In Transit</p>
        </div>
        <div className="stat-card">
          <h3>{shipments.filter(s => s.status === 'Delivered').length}</h3>
          <p>Delivered</p>
        </div>
      </div>

      <div className="filters">
        <h3>Filter Shipments:</h3>
        <div className="filter-buttons">
          <button 
            className={statusFilter === 'all' ? 'active' : ''} 
            onClick={() => handleStatusFilter('all')}
          >
            All Shipments
          </button>
          <button 
            className={statusFilter === 'Pending' ? 'active' : ''} 
            onClick={() => handleStatusFilter('Pending')}
          >
            Pending
          </button>
          <button 
            className={statusFilter === 'In Transit' ? 'active' : ''} 
            onClick={() => handleStatusFilter('In Transit')}
          >
            In Transit
          </button>
          <button 
            className={statusFilter === 'Delivered' ? 'active' : ''} 
            onClick={() => handleStatusFilter('Delivered')}
          >
            Delivered
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="shipments-grid">
        {filteredShipments.map(shipment => (
          <div key={shipment.id} className="shipment-card">
            <div className="shipment-header">
              <h4>Tracking ID: {shipment.trackingId}</h4>
              <span className={`status-badge ${shipment.status.toLowerCase().replace(' ', '-')}`}>
                {shipment.status}
              </span>
            </div>
            
            <div className="shipment-details">
              <p><strong>Recipient:</strong> {shipment.recipientName}</p>
              <p><strong>Delivery Address:</strong> {shipment.deliveryAddress}</p>
              <p><strong>Package Type:</strong> {shipment.packageType}</p>
              <p><strong>Weight:</strong> {shipment.weight} kg</p>
              <p><strong>Customer Email:</strong> {shipment.userEmail}</p>
              <p><strong>Current Location:</strong> {shipment.currentAddress || 'Not set'}</p>
              <p><strong>Special Instructions:</strong> {shipment.specialInstructions}</p>
              <p><strong>Created:</strong> {new Date(shipment.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="shipment-actions">
              {shipment.status === 'Pending' && (
                <button 
                  onClick={() => updateShipmentStatus(shipment.id, 'In Transit')}
                  className="action-btn in-transit"
                >
                  Mark In Transit
                </button>
              )}
              
              {shipment.status === 'In Transit' && (
                <>
                  <button 
                    onClick={() => {
                      const location = prompt('Enter current location:');
                      if (location) updateShipmentStatus(shipment.id, 'In Transit', location);
                    }}
                    className="action-btn update"
                  >
                    Update Location
                  </button>
                  <button 
                    onClick={() => markAsDelivered(shipment.id)}
                    className="action-btn delivered"
                  >
                    Mark Delivered
                  </button>
                </>
              )}

              {shipment.status !== 'Delivered' && (
                <button 
                  onClick={() => generateOTP(shipment.id)}
                  className="action-btn otp"
                >
                  Generate OTP
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredShipments.length === 0 && (
        <div className="no-shipments">
          <p>No shipments found for the selected filter.</p>
        </div>
      )}
    </div>
  );
};

export default HandlerDashboard; 