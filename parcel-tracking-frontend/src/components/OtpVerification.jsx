import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const OtpVerification = () => {
  const { shipmentId } = useParams();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Generate fresh OTP when component mounts
    generateOtp();
  }, [shipmentId]);

  const generateOtp = async () => {
    try {
      setGenerating(true);
      await apiClient.post(`/shipment/otp/${shipmentId}`);
      setSuccess('Fresh OTP has been sent to your email.');
      setError('');
    } catch (err) {
      setError('Failed to generate OTP. Please try again.');
      console.error('Error generating OTP:', err);
    } finally {
      setGenerating(false);
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
      // Send OTP as JSON string
      await apiClient.post(`/shipment/otp/verify/${shipmentId}`, JSON.stringify(otp), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setSuccess('Delivery confirmed! Shipment marked as Delivered.');
      
      // Navigate back to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
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

  const handleRegenerateOtp = () => {
    setOtp('');
    setError('');
    setSuccess('');
    generateOtp();
  };

  if (generating) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Generating fresh OTP...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Delivery OTP Verification</h2>
        <button 
          onClick={() => navigate('/dashboard')}
          className="btn-secondary"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="form-container">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h3>Shipment ID: {shipmentId}</h3>
          <p style={{ color: '#666' }}>
            Enter the 6-digit OTP sent to your email to confirm delivery.
          </p>
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
              Enter the 6-digit code exactly as received in your email
            </small>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <button type="submit" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : 'Verify Delivery'}
            </button>
            
            <button 
              type="button" 
              onClick={handleRegenerateOtp}
              className="btn-secondary"
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Resend OTP'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <h4>Instructions:</h4>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6', margin: '0.5rem 0' }}>
            <li>Check your email for the 6-digit delivery OTP</li>
            <li>Enter the code exactly as received</li>
            <li>The OTP is valid for a limited time</li>
            <li>Click "Resend OTP" if you didn't receive it</li>
            <li>Once verified, the shipment will be marked as delivered</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification; 