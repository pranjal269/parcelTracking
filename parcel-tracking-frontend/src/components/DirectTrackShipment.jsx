import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

const DirectTrackShipment = () => {
  const { trackingId } = useParams();
  const [shipment, setShipment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipment = async () => {
      if (!trackingId) {
        setError('No tracking ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get(`/shipment/tracking/${trackingId}`);
        setShipment(response.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Shipment not found. Please check your tracking ID.');
        } else {
          setError(err.response?.data?.message || 'An error occurred while tracking the shipment.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchShipment();
  }, [trackingId]);

  if (loading) {
    return (
      <div>
        <h2>Loading Shipment Details...</h2>
        <div className="loading">
          <div className="spinner"></div>
          <p>Fetching shipment information for: {trackingId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2>Tracking Error</h2>
        <div className="error">{error}</div>
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3>Having trouble?</h3>
          <p>The tracking ID "{trackingId}" could not be found in our system.</p>
          <Link to="/track-shipment" className="btn-secondary">
            Try Manual Tracking
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Shipment Details</h2>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Showing details for tracking ID: <strong>{trackingId}</strong>
      </p>

      {shipment && (
        <div className="tracking-result">
          <div className="card">
            <h3>📦 Shipment Information</h3>
            <div className="details">
              <p><strong>Tracking ID:</strong> {shipment.trackingId}</p>
              <p><strong>Recipient:</strong> {shipment.recipientName}</p>
              <p><strong>Delivery Address:</strong> {shipment.deliveryAddress}</p>
              <p><strong>Package Type:</strong> {shipment.packageType || 'Standard'}</p>
              <p><strong>Weight:</strong> {shipment.weight} kg</p>
              {shipment.specialInstructions && (
                <p><strong>Special Instructions:</strong> {shipment.specialInstructions}</p>
              )}
              <p><strong>Status:</strong> 
                <span 
                  style={{
                    marginLeft: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    backgroundColor: shipment.status === 'Delivered' ? '#28a745' : 
                                   shipment.status === 'Pending' ? '#ffc107' : '#007bff',
                    color: 'white'
                  }}
                >
                  {shipment.status}
                </span>
              </p>
              <p><strong>Created:</strong> {new Date(shipment.createdAt).toLocaleString()}</p>
              {shipment.currentAddress && (
                <p><strong>Current Location:</strong> {shipment.currentAddress}</p>
              )}
            </div>

            {shipment.status === 'Delivered' ? (
              <div 
                style={{
                  backgroundColor: '#d4edda',
                  color: '#155724',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  marginTop: '1.5rem',
                  border: '2px solid #c3e6cb'
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>
                  ✅ Shipment Successfully Delivered!
                </h4>
                <p style={{ margin: '0', fontSize: '0.875rem' }}>
                  Your package has been successfully delivered to the recipient.
                </p>
              </div>
            ) : (
              <div 
                style={{
                  backgroundColor: '#e3f2fd',
                  color: '#1565c0',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  marginTop: '1.5rem',
                  border: '2px solid #bbdefb'
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>
                  🚚 Shipment In Transit
                </h4>
                <p style={{ margin: '0', fontSize: '0.875rem' }}>
                  Your shipment is currently being processed and will be delivered soon.
                </p>
              </div>
            )}

            {shipment.qrCodeImage && (
              <div className="qr-code" style={{ marginTop: '2rem' }}>
                <h4>QR Code</h4>
                <img 
                  src={`data:image/png;base64,${shipment.qrCodeImage}`}
                  alt="Shipment QR Code"
                  width="200"
                  height="200"
                  style={{ 
                    border: '2px solid #ddd', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                  Share this QR code for quick access to shipment details
                </p>
              </div>
            )}
          </div>

          <div className="card" style={{ marginTop: '2rem' }}>
            <h3>📋 Tracking Timeline</h3>
            <div style={{ padding: '1rem 0' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '1rem',
                padding: '0.75rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#28a745',
                  borderRadius: '50%',
                  marginRight: '1rem'
                }}></div>
                <div>
                  <strong>Package Created</strong>
                  <p style={{ margin: '0', fontSize: '0.875rem', color: '#666' }}>
                    {new Date(shipment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {shipment.status !== 'Pending' && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: shipment.status === 'Delivered' ? '#28a745' : '#007bff',
                    borderRadius: '50%',
                    marginRight: '1rem'
                  }}></div>
                  <div>
                    <strong>Status: {shipment.status}</strong>
                    <p style={{ margin: '0', fontSize: '0.875rem', color: '#666' }}>
                      Current status of your shipment
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/track-shipment" className="btn-secondary">
              Track Another Shipment
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectTrackShipment; 