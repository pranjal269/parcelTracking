import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import './Dashboard.css';

const HandlerDashboard = () => {
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [tamperFilter, setTamperFilter] = useState('all');
  const [workflowSteps, setWorkflowSteps] = useState([]);
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
    fetchWorkflowSteps();
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

  const fetchWorkflowSteps = async () => {
    try {
      const response = await apiClient.get('/handler/workflow-steps');
      setWorkflowSteps(response.data);
    } catch (error) {
      console.error('Failed to fetch workflow steps:', error);
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    applyFilters(status, tamperFilter);
  };

  const handleTamperFilter = (tamper) => {
    setTamperFilter(tamper);
    applyFilters(statusFilter, tamper);
  };

  const applyFilters = (status, tamper) => {
    let filtered = shipments;
    
    if (status !== 'all') {
      filtered = filtered.filter(s => s.status === status);
    }
    
    if (tamper === 'tampered') {
      filtered = filtered.filter(s => s.isTampered === true);
    } else if (tamper === 'clean') {
      filtered = filtered.filter(s => s.isTampered === false || !s.isTampered);
    }
    
    setFilteredShipments(filtered);
  };

  const updateShipmentStatus = async (shipmentId, newStatus, currentAddress = '') => {
    try {
      const response = await apiClient.put(`/handler/shipments/${shipmentId}/status`, {
        status: newStatus,
        currentAddress: currentAddress || `Updated to ${newStatus}`,
        handlerEmail: handlerUser?.email
      });
      
      if (response.data) {
        // Refresh shipments
        fetchShipments();
        alert('Shipment status updated successfully!');
      }
    } catch (error) {
      if (error.response?.data?.isTampered) {
        alert(`⚠️ TAMPER DETECTED!\n\n${error.response.data.tamperReason}\n\nThe shipment has been marked as tampered.`);
        fetchShipments(); // Refresh to show tampered status
      } else {
      alert('Failed to update shipment status');
      }
    }
  };

  const markAsDelivered = async (shipmentId) => {
    const deliveryAddress = prompt('Enter delivery confirmation details:');
    if (deliveryAddress) {
      try {
        const response = await apiClient.put(`/handler/shipments/${shipmentId}/deliver`, {
          deliveryAddress: deliveryAddress,
          handlerEmail: handlerUser?.email
        });
        
        fetchShipments();
        
        if (response.data.warning) {
          alert(`⚠️ TAMPERED PACKAGE DELIVERED\n\n${response.data.message}\n\n${response.data.warning}\n\nRecipient will be notified of tampering.`);
        } else {
        alert('Shipment marked as delivered successfully!');
        }
      } catch (error) {
        if (error.response?.data?.canDeliverAnyway) {
          const confirmForceDeliver = window.confirm(
            `⚠️ TAMPER DETECTED!\n\n${error.response.data.tamperReason}\n\nThe shipment has been marked as tampered.\n\nDo you want to deliver it anyway as "Delivered (Tampered)"?\n\nClick OK to force deliver, or Cancel to keep as tampered.`
          );
          
          if (confirmForceDeliver) {
            forceDeliverTampered(shipmentId, deliveryAddress);
          }
          fetchShipments(); // Refresh to show tampered status
        } else {
        alert('Failed to mark shipment as delivered');
        }
      }
    }
  };

  const forceDeliverTampered = async (shipmentId, deliveryAddress) => {
    try {
      const response = await apiClient.put(`/handler/shipments/${shipmentId}/force-deliver`, {
        deliveryAddress: deliveryAddress,
        handlerEmail: handlerUser?.email
      });
      
      fetchShipments();
      alert(`📦 TAMPERED PACKAGE DELIVERED\n\n${response.data.message}\n\n${response.data.warning}`);
    } catch (error) {
      alert('Failed to force deliver tampered package');
    }
  };

  const markAsTampered = async (shipmentId) => {
    const reason = prompt('Enter reason for marking as tampered:');
    if (reason) {
      try {
        await apiClient.post(`/handler/shipments/${shipmentId}/mark-tampered`, {
          reason: reason,
          handlerEmail: handlerUser?.email
        });
        fetchShipments();
        alert('Shipment marked as tampered successfully!');
      } catch (error) {
        alert('Failed to mark shipment as tampered');
      }
    }
  };

  const generateOTP = async (shipmentId) => {
    try {
      // Navigate to the OTP verification page for the handler
      navigate(`/handler-otp-verification/${shipmentId}`);
    } catch (error) {
      alert('Failed to navigate to OTP verification page');
    }
  };

  const getNextValidStatus = (currentStatus) => {
    const currentIndex = workflowSteps.indexOf(currentStatus);
    if (currentIndex >= 0 && currentIndex < workflowSteps.length - 1) {
      return workflowSteps[currentIndex + 1];
    }
    return null;
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
        <div className="stat-card tamper-delivered">
          <h3>{shipments.filter(s => s.status === 'Delivered_Tampered').length}</h3>
          <p>🟠 Delivered (Tampered)</p>
        </div>
        <div className="stat-card tamper-alert">
          <h3>{shipments.filter(s => s.isTampered && !s.status.includes('Delivered')).length}</h3>
          <p>🚨 Tampered</p>
        </div>
      </div>

      <div className="workflow-info">
        <h3>📋 Valid Workflow:</h3>
        <div className="workflow-steps">
          {workflowSteps.map((step, index) => (
            <span key={step} className="workflow-step">
              {step} {index < workflowSteps.length - 1 && '→'}
            </span>
          ))}
        </div>
        <p className="workflow-note">
          ⚠️ Skipping steps will automatically mark shipment as tampered
        </p>
      </div>

      <div className="filters">
        <h3>Filter Shipments:</h3>
        <div className="filter-section">
          <div className="filter-group">
            <label>Status:</label>
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
                className={statusFilter === 'Picked Up' ? 'active' : ''} 
                onClick={() => handleStatusFilter('Picked Up')}
              >
                Picked Up
              </button>
          <button 
            className={statusFilter === 'In Transit' ? 'active' : ''} 
            onClick={() => handleStatusFilter('In Transit')}
          >
            In Transit
          </button>
              <button 
                className={statusFilter === 'Out for Delivery' ? 'active' : ''} 
                onClick={() => handleStatusFilter('Out for Delivery')}
              >
                Out for Delivery
              </button>
          <button 
            className={statusFilter === 'Delivered' ? 'active' : ''} 
            onClick={() => handleStatusFilter('Delivered')}
          >
            Delivered
          </button>
              <button 
                className={statusFilter === 'Delivered_Tampered' ? 'active tamper-delivered-filter' : 'tamper-delivered-filter'} 
                onClick={() => handleStatusFilter('Delivered_Tampered')}
              >
                🟠 Delivered (Tampered)
              </button>
            </div>
          </div>
          
          <div className="filter-group">
            <label>Tamper Status:</label>
            <div className="filter-buttons">
              <button 
                className={tamperFilter === 'all' ? 'active' : ''} 
                onClick={() => handleTamperFilter('all')}
              >
                All
              </button>
              <button 
                className={tamperFilter === 'clean' ? 'active' : ''} 
                onClick={() => handleTamperFilter('clean')}
              >
                ✅ Clean
              </button>
              <button 
                className={tamperFilter === 'tampered' ? 'active tamper-filter' : 'tamper-filter'} 
                onClick={() => handleTamperFilter('tampered')}
              >
                🚨 Tampered
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="shipments-grid">
        {filteredShipments.map(shipment => (
          <div key={shipment.id} className={`shipment-card ${shipment.isTampered ? 'tampered-card' : ''} ${shipment.status === 'Delivered_Tampered' ? 'delivered-tampered-card' : ''}`}>
            <div className="shipment-header">
              <h4>Tracking ID: {shipment.trackingId}</h4>
              <div className="status-badges">
                <span className={`status-badge ${shipment.status.toLowerCase().replace(' ', '-').replace('_', '-')}`}>
                  {shipment.status === 'Delivered_Tampered' ? 'Delivered (Tampered)' : shipment.status}
                </span>
                {shipment.isTampered && shipment.status !== 'Delivered_Tampered' && (
                  <span className="tamper-badge">
                    🚨 TAMPERED
                  </span>
                )}
                {shipment.wasDeliveredWithTamper && (
                  <span className="tamper-delivered-badge">
                    🟠 DELIVERED WITH TAMPER
              </span>
                )}
              </div>
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
              
              {shipment.statusHistory && (
                <p><strong>Status History:</strong> {shipment.statusHistory}</p>
              )}
              
              {shipment.isTampered && (
                <div className="tamper-details">
                  <p><strong>🚨 Tamper Reason:</strong> {shipment.tamperReason}</p>
                  <p><strong>Detected At:</strong> {new Date(shipment.tamperDetectedAt).toLocaleString()}</p>
                  <p><strong>Detected By:</strong> {shipment.tamperDetectedBy}</p>
                </div>
              )}
            </div>

            <div className="shipment-actions">
              {/* Normal workflow for non-tampered packages */}
              {!shipment.isTampered && (
                <>
              {shipment.status === 'Pending' && (
                    <button 
                      onClick={() => updateShipmentStatus(shipment.id, 'Picked Up')}
                      className="action-btn picked-up"
                    >
                      Mark Picked Up
                    </button>
                  )}
                  
                  {shipment.status === 'Picked Up' && (
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
                        onClick={() => updateShipmentStatus(shipment.id, 'Out for Delivery')}
                        className="action-btn out-for-delivery"
                      >
                        Mark Out for Delivery
                      </button>
                    </>
                  )}
                  
                  {shipment.status === 'Out for Delivery' && (
                  <button 
                    onClick={() => generateOTP(shipment.id)}
                    className="action-btn delivered"
                  >
                    Verify Delivery (OTP)
                  </button>
                  )}
                </>
              )}

              {/* Special actions for tampered packages */}
              {shipment.isTampered && shipment.status !== 'Delivered_Tampered' && (
                <div className="tampered-actions">
                  <div className="tampered-warning">
                    ⚠️ This package is marked as tampered
                  </div>
                  <button 
                    onClick={() => generateOTP(shipment.id)}
                    className="action-btn force-deliver"
                  >
                    🟠 Verify & Deliver as Tampered
                  </button>
                </div>
              )}

              {/* Common actions for non-delivered packages */}
              {!shipment.status.includes('Delivered') && (
                <>
                {shipment.qrCodeImage && (
                  <button 
                    onClick={() => generateOTP(shipment.id)}
                    className="action-btn qr-code"
                  >
                    🔍 Scan QR & Verify
                  </button>
                )}
                  
                  {!shipment.isTampered && (
                    <button 
                      onClick={() => markAsTampered(shipment.id)}
                      className="action-btn tamper-btn"
                    >
                      🚨 Mark Tampered
                    </button>
                  )}
                </>
              )}
              
              {/* Status for completed deliveries */}
              {shipment.status === 'Delivered_Tampered' && (
                <div className="completed-delivery tampered-delivery">
                  ✅ Package delivered despite tampering concerns
                </div>
              )}
              
              {shipment.status === 'Delivered' && (
                <div className="completed-delivery">
                  ✅ Package delivered successfully
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredShipments.length === 0 && (
        <div className="no-shipments">
          <p>No shipments found for the selected filters.</p>
        </div>
      )}
    </div>
  );
};

export default HandlerDashboard; 