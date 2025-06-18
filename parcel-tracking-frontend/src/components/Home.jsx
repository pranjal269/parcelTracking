import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-header">
          <div className="logo-section">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '12px' }}>
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <div>
              <h1>Smart Tracking</h1>
              <p className="tagline">Your trusted parcel tracking solution</p>
            </div>
          </div>
        </div>

        <div className="home-main">
          <div className="welcome-section">
            <h2>Track Your Parcels with Ease</h2>
            <p>Experience seamless package tracking with real-time updates, secure authentication, and comprehensive management tools.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Real-time Tracking</h3>
              <p>Monitor your packages throughout their journey with live updates and detailed status information.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Authentication</h3>
              <p>Your data is protected with advanced security measures and OTP verification systems.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile Responsive</h3>
              <p>Access your tracking information from any device with our fully responsive design.</p>
            </div>
          </div>

          <div className="cta-section">
            <div className="cta-card">
              <h3>Get Started Today</h3>
              <p>Choose your access level and start tracking your parcels</p>
              
              <div className="button-grid">
                <div className="button-group">
                  <h4>Customer Access</h4>
                  <div className="button-row">
                    <button 
                      className="home-button primary"
                      onClick={() => navigate('/login')}
                    >
                      Login
                    </button>
                    <button 
                      className="home-button secondary"
                      onClick={() => navigate('/register')}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
                
                <div className="button-group">
                  <h4>Staff Access</h4>
                  <div className="button-row">
                    <button 
                      className="home-button handler"
                      onClick={() => navigate('/handler-login')}
                    >
                      Handler Login
                    </button>
                    <button 
                      className="home-button admin"
                      onClick={() => navigate('/admin-login')}
                    >
                      Admin Login
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="quick-track-section">
            <div className="quick-track-card">
              <h3>Quick Track</h3>
              <p>Track a package without logging in</p>
              <button 
                className="home-button quick-track"
                onClick={() => navigate('/track-shipment')}
              >
                Track Package
              </button>
            </div>
          </div>
        </div>

        <div className="home-footer">
          <p>&copy; 2025 Smart Tracking. Your packages, our priority.</p>
        </div>
      </div>
    </div>
  );
};

export default Home; 