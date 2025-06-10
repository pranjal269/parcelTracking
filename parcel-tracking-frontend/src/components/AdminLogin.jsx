import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import './Auth.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/admin/login', formData);
      
      if (response.data.user) {
        // Store admin info in localStorage
        localStorage.setItem('adminUser', JSON.stringify(response.data.user));
        localStorage.setItem('userRole', 'admin');
        
        // Redirect to admin dashboard
        navigate('/admin-dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Admin login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Administrator Login</h2>
          <p>Access the complete system overview</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Admin Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your admin email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            className="auth-button admin-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login as Administrator'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Regular user? <span onClick={() => navigate('/login')} className="auth-link">Login here</span>
          </p>
          <p>
            Handler? <span onClick={() => navigate('/handler-login')} className="auth-link">Handler Login</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 