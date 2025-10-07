import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

/**
 * AdminDashboard Component
 * 
 * Main admin dashboard with key metrics and overview:
 * - Platform statistics and KPIs
 * - Recent activities and notifications
 * - Quick action buttons
 * - Charts and analytics (placeholder)
 * - Recent registrations and approvals
 * 
 * @returns {JSX.Element} Admin dashboard component
 */
export default function AdminDashboard() {
  const { addToast } = useToast();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPharmacies: 0,
    pendingVerification: 0,
    verifiedPharmacies: 0,
    suspendedPharmacies: 0,
    totalInsurances: 0,
    recentRegistrations: 0,
    totalContactMessages: 0,
    newContactMessages: 0,
    urgentContactMessages: 0,
    recentContactMessages: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [platformHealth, setPlatformHealth] = useState({
    database: 'checking',
    api: 'checking',
    email: 'checking'
  });

  /**
   * Fetch dashboard data
   */
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch dashboard statistics from API
      const statsResponse = await fetch('/api/admin/dashboard/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }

      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.data);
      } else {
        throw new Error(statsData.message || 'Failed to load statistics');
      }

      // Fetch recent activities from API
      const activitiesResponse = await fetch('/api/admin/dashboard/activities', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });

      if (!activitiesResponse.ok) {
        throw new Error('Failed to fetch recent activities');
      }

      const activitiesData = await activitiesResponse.json();
      
      if (activitiesData.success) {
        setRecentActivities(activitiesData.data);
      } else {
        throw new Error(activitiesData.message || 'Failed to load activities');
      }

      // Fetch platform health from API
      const healthResponse = await fetch('/api/admin/dashboard/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        if (healthData.success) {
          setPlatformHealth(healthData.data);
        }
      }

    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load dashboard data: ' + err.message);
      addToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle quick actions
   */
  const handleQuickAction = (action) => {
    addToast(`${action} action triggered`, 'info');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-3">Welcome to Admin Dashboard</h1>
            <p className="text-teal-100 text-lg">
              Manage your PharmaFind platform, approve pharmacies, and monitor system activity.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="material-icons text-4xl text-white">admin_panel_settings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      <ErrorMessage error={error} onClose={() => setError('')} />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl">
              <span className="material-icons text-blue-600 text-xl">people</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Total Pharmacies */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-xl">
              <span className="material-icons text-green-600 text-xl">local_pharmacy</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pharmacies</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPharmacies}</p>
            </div>
          </div>
        </div>

        {/* Pending Verification */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <span className="material-icons text-yellow-600 text-xl">pending</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Verification</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingVerification}</p>
            </div>
          </div>
        </div>

        {/* Verified Pharmacies */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-teal-100 rounded-xl">
              <span className="material-icons text-teal-600 text-xl">verified</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-gray-900">{stats.verifiedPharmacies}</p>
            </div>
          </div>
        </div>

        {/* Suspended Pharmacies */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-xl">
              <span className="material-icons text-red-600 text-xl">block</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Suspended</p>
              <p className="text-2xl font-bold text-gray-900">{stats.suspendedPharmacies}</p>
            </div>
          </div>
        </div>

        {/* Total Insurances */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-xl">
              <span className="material-icons text-purple-600 text-xl">verified_user</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Insurances</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInsurances}</p>
            </div>
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <span className="material-icons text-indigo-600 text-xl">trending_up</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New This Week</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentRegistrations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Messages Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Messages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl">
              <span className="material-icons text-blue-600 text-xl">message</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalContactMessages}</p>
            </div>
          </div>
        </div>

        {/* New Messages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-xl">
              <span className="material-icons text-orange-600 text-xl">mark_email_unread</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New Messages</p>
              <p className="text-2xl font-bold text-gray-900">{stats.newContactMessages}</p>
            </div>
          </div>
        </div>

        {/* Urgent Messages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-xl">
              <span className="material-icons text-red-600 text-xl">priority_high</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Urgent Messages</p>
              <p className="text-2xl font-bold text-gray-900">{stats.urgentContactMessages}</p>
            </div>
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-xl">
              <span className="material-icons text-green-600 text-xl">schedule</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentContactMessages}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="material-icons text-teal-600 mr-3">flash_on</span>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/admin/pharmacies"
            className="group flex items-center p-6 border border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all duration-200 hover:shadow-md"
          >
            <div className="p-3 bg-teal-100 rounded-xl group-hover:bg-teal-200 transition-colors">
              <span className="material-icons text-teal-600 text-xl">local_pharmacy</span>
            </div>
            <div className="ml-4">
              <p className="font-semibold text-gray-900">Manage Pharmacies</p>
              <p className="text-sm text-gray-600">Approve pending pharmacies</p>
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="group flex items-center p-6 border border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all duration-200 hover:shadow-md"
          >
            <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
              <span className="material-icons text-blue-600 text-xl">people</span>
            </div>
            <div className="ml-4">
              <p className="font-semibold text-gray-900">Manage Users</p>
              <p className="text-sm text-gray-600">View and manage users</p>
            </div>
          </Link>

          <Link
            to="/admin/insurances"
            className="group flex items-center p-6 border border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all duration-200 hover:shadow-md"
          >
            <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
              <span className="material-icons text-purple-600 text-xl">verified</span>
            </div>
            <div className="ml-4">
              <p className="font-semibold text-gray-900">Manage Insurances</p>
              <p className="text-sm text-gray-600">Add or edit insurances</p>
            </div>
          </Link>

          <Link
            to="/admin/messages"
            className="group flex items-center p-6 border border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all duration-200 hover:shadow-md"
          >
            <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
              <span className="material-icons text-orange-600 text-xl">message</span>
            </div>
            <div className="ml-4">
              <p className="font-semibold text-gray-900">Contact Messages</p>
              <p className="text-sm text-gray-600">View and respond to messages</p>
            </div>
          </Link>

          <Link
            to="/admin/analytics"
            className="group flex items-center p-6 border border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all duration-200 hover:shadow-md"
          >
            <div className="p-3 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition-colors">
              <span className="material-icons text-indigo-600 text-xl">analytics</span>
            </div>
            <div className="ml-4">
              <p className="font-semibold text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-600">Platform statistics</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="material-icons text-teal-600 mr-3">history</span>
            Recent Activities
          </h2>
          <Link
            to="/admin/activities"
            className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center"
          >
            View All
            <span className="material-icons text-sm ml-1">arrow_forward</span>
          </Link>
        </div>
        
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <div className={`w-3 h-3 rounded-full mr-4 ${
                activity.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                activity.status === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Platform Health */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="material-icons text-green-600 mr-3">health_and_safety</span>
            Platform Health
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Status</span>
              <span className={`flex items-center ${
                platformHealth.api === 'operational' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                <span className="material-icons text-sm mr-1">
                  {platformHealth.api === 'operational' ? 'check_circle' : 'warning'}
                </span>
                {platformHealth.api === 'operational' ? 'Online' : 'Checking...'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className={`flex items-center ${
                platformHealth.database === 'connected' ? 'text-green-600' : 'text-red-600'
              }`}>
                <span className="material-icons text-sm mr-1">
                  {platformHealth.database === 'connected' ? 'check_circle' : 'error'}
                </span>
                {platformHealth.database === 'connected' ? 'Connected' : 
                 platformHealth.database === 'checking' ? 'Checking...' : 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email Service</span>
              <span className={`flex items-center ${
                platformHealth.email === 'configured' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                <span className="material-icons text-sm mr-1">
                  {platformHealth.email === 'configured' ? 'check_circle' : 'warning'}
                </span>
                {platformHealth.email === 'configured' ? 'Active' : 
                 platformHealth.email === 'log_only' ? 'Log Only' : 'Checking...'}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="material-icons text-indigo-600 mr-3">trending_up</span>
            This Week
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New Users</span>
              <span className="font-medium text-gray-900">+{stats.recentRegistrations}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New Pharmacies</span>
              <span className="font-medium text-gray-900">+{stats.pendingPharmacies}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Approvals</span>
              <span className="font-medium text-gray-900">+{Math.floor(stats.approvedPharmacies * 0.1)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
