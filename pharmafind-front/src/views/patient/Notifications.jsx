import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axiosClient from '../../axios-client';
import NotificationCard from '../../components/NotificationCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

/**
 * Notifications Component
 * 
 * Main view for patients to view and manage their notifications
 * Includes listing, marking as read, and deleting notifications
 * 
 * @returns {JSX.Element} Notifications component
 */
export default function Notifications() {
  const { user } = useAuth();
  const { addToast } = useToast();

  // State management
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [filter, setFilter] = useState('all'); // all, unread, read

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosClient.get('/notifications');
      setNotifications(response.data.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
      addToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notification) => {
    try {
      setActionLoading(true);
      
      await axiosClient.post(`/notifications/mark-read/${notification.id}`);
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notification.id 
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        )
      );
      
      addToast('Notification marked as read', 'success');
    } catch (err) {
      console.error('Error marking notification as read:', err);
      addToast('Failed to mark notification as read', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      
      await axiosClient.post('/notifications/mark-all-read');
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read_at: new Date().toISOString() }))
      );
      
      addToast('All notifications marked as read', 'success');
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      addToast('Failed to mark all notifications as read', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (notification) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      setActionLoading(true);
      
      await axiosClient.delete(`/notifications/${notification.id}`);
      
      setNotifications(prev => prev.filter(notif => notif.id !== notification.id));
      addToast('Notification deleted', 'success');
    } catch (err) {
      console.error('Error deleting notification:', err);
      addToast('Failed to delete notification', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = (notification) => {
    if (notification.data?.action_url) {
      // For insurance match alerts, navigate to pharmacy details
      if (notification.data.type === 'insurance_match_alert') {
        // You can implement navigation logic here
        addToast('Redirecting to pharmacy details...', 'info');
        // Example: navigate(`/pharmacy/${notification.data.pharmacy_id}`);
      }
    }
  };

  // Filter notifications based on current filter
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return notification.read_at === null;
    if (filter === 'read') return notification.read_at !== null;
    return true;
  });

  // Count unread notifications
  const unreadCount = notifications.filter(notif => notif.read_at === null).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <LoadingSpinner size="lg" text="Loading notifications..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-1">
                Stay updated with your pharmacy and insurance information
              </p>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={actionLoading}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center disabled:opacity-50"
              >
                {actionLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                <span className="material-icons mr-2">done_all</span>
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <ErrorMessage error={error} onClose={() => setError(null)} />
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Filter Notifications</h3>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="all"
                    checked={filter === 'all'}
                    onChange={(e) => setFilter(e.target.value)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">All</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="unread"
                    checked={filter === 'unread'}
                    onChange={(e) => setFilter(e.target.value)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Unread ({unreadCount})</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="read"
                    checked={filter === 'read'}
                    onChange={(e) => setFilter(e.target.value)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Read</span>
                </label>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map(notification => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                onAction={handleAction}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="material-icons text-6xl text-gray-300 mb-4">notifications_none</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You don't have any notifications yet"
                : filter === 'unread'
                  ? "You have no unread notifications"
                  : "You have no read notifications"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}








