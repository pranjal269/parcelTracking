import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import './Dashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [allShipments, setAllShipments] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminUser, setAdminUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('adminUser');
    const userRole = localStorage.getItem('userRole');
    
    if (!userData || userRole !== 'admin') {
      navigate('/admin-login');
      return;
    }
    
    setAdminUser(JSON.parse(userData));
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard overview
      const dashboardResponse = await apiClient.get('/admin/dashboard');
      setDashboardData(dashboardResponse.data);

      // Fetch all shipments
      const shipmentsResponse = await apiClient.get('/admin/shipments?pageSize=100');
      setAllShipments(shipmentsResponse.data.shipments || []);
      setFilteredShipments(shipmentsResponse.data.shipments || []);

      // Fetch all users
      const usersResponse = await apiClient.get('/admin/users');
      setUsers(usersResponse.data);
    } catch (error) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    if (status === 'all') {
      setFilteredShipments(allShipments);
    } else {
      setFilteredShipments(allShipments.filter(s => s.status === status));
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await apiClient.put(`/admin/users/${userId}/role`, { role: newRole });
      // Refresh users data
      const usersResponse = await apiClient.get('/admin/users');
      setUsers(usersResponse.data);
      alert('User role updated successfully!');
    } catch (error) {
      alert('Failed to update user role');
    }
  };

  const deleteShipment = async (shipmentId) => {
    if (window.confirm('Are you sure you want to delete this shipment? This action cannot be undone.')) {
      try {
        await apiClient.delete(`/admin/shipments/${shipmentId}`);
        // Refresh shipments data
        const shipmentsResponse = await apiClient.get('/admin/shipments?pageSize=100');
        setAllShipments(shipmentsResponse.data.shipments || []);
        setFilteredShipments(shipmentsResponse.data.shipments || []);
        alert('Shipment deleted successfully!');
      } catch (error) {
        alert('Failed to delete shipment');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('userRole');
    navigate('/admin-login');
  };

  if (loading) return <div className="loading">Loading admin dashboard...</div>;

  return (
    <div className="dashboard-container admin-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {adminUser?.firstName} {adminUser?.lastName}</p>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''} 
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'shipments' ? 'active' : ''} 
          onClick={() => setActiveTab('shipments')}
        >
          All Shipments
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''} 
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
      </div>

      {activeTab === 'overview' && dashboardData && (
        <div className="overview-tab">
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>{dashboardData.statistics.totalShipments}</h3>
              <p>Total Shipments</p>
            </div>
            <div className="stat-card">
              <h3>{dashboardData.statistics.pendingShipments}</h3>
              <p>Pending</p>
            </div>
            <div className="stat-card">
              <h3>{dashboardData.statistics.inTransitShipments}</h3>
              <p>In Transit</p>
            </div>
            <div className="stat-card">
              <h3>{dashboardData.statistics.deliveredShipments}</h3>
              <p>Delivered</p>
            </div>
            <div className="stat-card">
              <h3>{dashboardData.statistics.totalUsers}</h3>
              <p>Total Users</p>
            </div>
            <div className="stat-card">
              <h3>{dashboardData.statistics.totalHandlers}</h3>
              <p>Handlers</p>
            </div>
          </div>

          <div className="recent-shipments">
            <h3>Recent Shipments</h3>
            <div className="shipments-table">
              <table>
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>Recipient</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Customer Email</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentShipments.map(shipment => (
                    <tr key={shipment.id}>
                      <td>{shipment.trackingId}</td>
                      <td>{shipment.recipientName}</td>
                      <td>
                        <span className={`status-badge ${shipment.status.toLowerCase().replace(' ', '-')}`}>
                          {shipment.status}
                        </span>
                      </td>
                      <td>{new Date(shipment.createdAt).toLocaleDateString()}</td>
                      <td>{shipment.userEmail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'shipments' && (
        <div className="shipments-tab">
          <div className="filters">
            <h3>Filter Shipments:</h3>
            <div className="filter-buttons">
              <button 
                className={statusFilter === 'all' ? 'active' : ''} 
                onClick={() => handleStatusFilter('all')}
              >
                All ({allShipments.length})
              </button>
              <button 
                className={statusFilter === 'Pending' ? 'active' : ''} 
                onClick={() => handleStatusFilter('Pending')}
              >
                Pending ({allShipments.filter(s => s.status === 'Pending').length})
              </button>
              <button 
                className={statusFilter === 'In Transit' ? 'active' : ''} 
                onClick={() => handleStatusFilter('In Transit')}
              >
                In Transit ({allShipments.filter(s => s.status === 'In Transit').length})
              </button>
              <button 
                className={statusFilter === 'Delivered' ? 'active' : ''} 
                onClick={() => handleStatusFilter('Delivered')}
              >
                Delivered ({allShipments.filter(s => s.status === 'Delivered').length})
              </button>
            </div>
          </div>

          <div className="shipments-grid">
            {filteredShipments.map(shipment => (
              <div key={shipment.id} className="shipment-card admin-card">
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
                  <p><strong>User ID:</strong> {shipment.userId}</p>
                  <p><strong>Current Location:</strong> {shipment.currentAddress || 'Not set'}</p>
                  <p><strong>Special Instructions:</strong> {shipment.specialInstructions}</p>
                  <p><strong>Created:</strong> {new Date(shipment.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="shipment-actions">
                  <button 
                    onClick={() => deleteShipment(shipment.id)}
                    className="action-btn delete"
                  >
                    Delete Shipment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-tab">
          <h3>User Management</h3>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Shipments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber || 'Not provided'}</td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role || 'User'}
                      </span>
                    </td>
                    <td>{user.shipmentCount}</td>
                    <td>
                      <select 
                        value={user.role || 'User'} 
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="role-select"
                      >
                        <option value="User">User</option>
                        <option value="Handler">Handler</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default AdminDashboard; 