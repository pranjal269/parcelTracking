import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import './Dashboard.css';

const HandlerOtpVerification = () => {
  const { shipmentId } = useParams();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState(null);
  const [loadingShipment, setLoadingShipment] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if handler is logged in
    const handlerUser = localStorage.getItem('handlerUser');
    const userRole = localStorage.getItem('userRole');
    
    if (!handlerUser || userRole !== 'handler') {
      navigate('/handler-login');
      return;
    }
    
    // Load shipment details
    fetchShipment();
  }, [shipmentId, navigate]);

  const fetchShipment = async () => {
    try {
      setLoadingShipment(true);
      const response = await apiClient.get(`/shipment/${shipmentId}`);
      setShipment(response.data);
      
      // Update shipment status to "Out for Delivery" if not already
      if (response.data.status !== 'Out for Delivery' && response.data.status !== 'Delivered') {
        await apiClient.put(`/handler/shipments/${shipmentId}/status`, {
          status: 'Out for Delivery',
          handlerEmail: JSON.parse(localStorage.getItem('handlerUser')).email
        });
      }
    } catch (err) {
      setError('Failed to fetch shipment data');
      console.error('Error fetching shipment:', err);
    } finally {
      setLoadingShipment(false);
    }
  };

  const generateOtp = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post(`/handler/shipments/${shipmentId}/generate-otp`);
      
      if (response.data && response.data.recipientPhone) {
        setSuccess(`OTP has been sent to the recipient's phone: ${response.data.recipientPhone}`);
      } else {
        setSuccess('OTP has been sent to the recipient\'s phone.');
      }
      
      setError('');
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
        
        // Display additional information for debugging
        if (err.response.data.recipientPhone === null || err.response.data.recipientPhone === '') {
          setError(`${err.response.data.message} (Recipient phone number is empty or null)`);
        } else if (err.response.data.recipientPhone) {
          setError(`${err.response.data.message} (Recipient phone: ${err.response.data.recipientPhone})`);
        }
      } else {
        setError('Failed to generate OTP. Please ensure recipient has a valid phone number.');
      }
      console.error('Error generating OTP:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await apiClient.post(`/handler/shipments/${shipmentId}/verify-otp`, {
        otp: otp,
        handlerEmail: JSON.parse(localStorage.getItem('handlerUser')).email
      });
      
      if (response.data.warning) {
        // For tampered packages
        setSuccess(`Delivery confirmed! ${response.data.message} ${response.data.warning}`);
      } else {
        // For normal packages
        setSuccess('Delivery confirmed! Shipment marked as Delivered.');
      }
      
      // Navigate back to dashboard after a delay
      setTimeout(() => {
        navigate('/handler-dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loadingShipment) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading shipment data...</p>
      </div>
    );
  }

  return (
    <div className="otp-verification-container">
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Delivery Verification</h2>
        <div>
          <button 
            onClick={handlePrint}
            className="btn-secondary print-btn"
            style={{ marginRight: '1rem' }}
          >
            🖨️ Print Label
          </button>
          <button 
            onClick={() => navigate('/handler-dashboard')}
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {shipment && (
        <div className="shipment-details-card">
          <div className="print-section">
            <div className="header-section">
              <h2>Parcel Tracking</h2>
              <h3>Tracking ID: {shipment.trackingId}</h3>
            </div>
            
            <div className="details-grid">
              <div className="detail-item">
                <strong>Recipient:</strong> 
                <span>{shipment.recipientName}</span>
              </div>
              <div className="detail-item">
                <strong>Phone:</strong> 
                <span>{shipment.recipientPhoneNumber || "Not provided"}</span>
              </div>
              <div className="detail-item">
                <strong>Destination:</strong> 
                <span>{shipment.deliveryAddress}</span>
              </div>
              <div className="detail-item">
                <strong>Package:</strong> 
                <span>{shipment.packageType} ({shipment.weight} kg)</span>
              </div>
              <div className="detail-item">
                <strong>Sender:</strong> 
                <span>{shipment.userEmail}</span>
              </div>
              <div className="detail-item">
                <strong>Created:</strong> 
                <span>{new Date(shipment.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <strong>Status:</strong> 
                <span>{shipment.status}</span>
              </div>
            </div>
            
            {shipment.qrCodeImage && (
              <div className="qr-code-container">
                <img 
                  src={`data:image/png;base64,${shipment.qrCodeImage}`}
                  alt="Tracking QR Code"
                  className="qr-code-image"
                />
                <p className="qr-code-caption">Scan to track package</p>
              </div>
            )}

            <div className="special-instructions">
              <strong>Special Instructions:</strong>
              <p>{shipment.specialInstructions || 'No special instructions'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="form-container no-print">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h3>OTP Verification</h3>
          <p style={{ color: '#666' }}>
            Please generate an OTP and have the recipient enter it to confirm delivery
          </p>
          
          {shipment && shipment.isTampered && (
            <div className="tampered-warning" style={{ 
              backgroundColor: '#fff3cd', 
              color: '#856404', 
              padding: '10px 15px', 
              borderRadius: '4px', 
              margin: '15px 0', 
              border: '1px solid #ffeeba',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <div>
                <strong>Warning: Tampered Package</strong>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>
                  This package has been marked as tampered. OTP verification is still required before delivery.
                  {shipment.tamperReason && (
                    <span style={{ display: 'block', marginTop: '5px' }}>
                      <strong>Reason:</strong> {shipment.tamperReason}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="otp">Delivery OTP:</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={handleOtpChange}
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              className="otp-input"
              style={{ 
                fontSize: '1.5rem', 
                textAlign: 'center', 
                letterSpacing: '0.5rem',
                fontFamily: 'monospace'
              }}
              required
            />
            <small style={{ color: '#666', fontSize: '0.875rem' }}>
              Enter the 6-digit code as provided by the recipient
            </small>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <button
              type="button" 
              onClick={generateOtp}
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Generating...' : '📱 Generate & Send OTP'}
            </button>
            
            <button type="submit" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : shipment && shipment.isTampered 
                ? '⚠️ Verify OTP & Mark Delivered (Tampered)' 
                : '✅ Verify OTP & Mark Delivered'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <h4>Instructions:</h4>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6', margin: '0.5rem 0' }}>
            <li>Generate an OTP to send to the recipient's phone</li>
            <li>Ask the recipient to check their phone for the 6-digit OTP</li>
            <li>Enter the code exactly as provided by the recipient</li>
            <li>The OTP is valid for a limited time</li>
            <li>Once verified, the shipment will be marked as delivered</li>
          </ul>
        </div>
      </div>
      
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-section, .print-section * {
              visibility: visible;
            }
            .no-print {
              display: none;
            }
            .print-section {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
            }
            .qr-code-image {
              width: 200px;
              height: 200px;
            }
          }
          
          .otp-verification-container {
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .print-btn {
            background-color: #6c757d;
          }
          
          .print-section {
            border: 2px solid #333;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 8px;
          }
          
          .header-section {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
          }
          
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .detail-item {
            display: flex;
            flex-direction: column;
          }
          
          .qr-code-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 20px;
            margin-bottom: 20px;
          }
          
          .qr-code-image {
            width: 150px;
            height: 150px;
          }
          
          .qr-code-caption {
            margin-top: 8px;
            font-style: italic;
          }
          
          .special-instructions {
            margin-top: 20px;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
        `}
      </style>
    </div>
  );
};

export default HandlerOtpVerification; 