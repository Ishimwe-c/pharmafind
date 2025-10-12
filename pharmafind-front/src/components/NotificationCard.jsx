import React from 'react';

/**
 * NotificationCard Component
 * 
 * Displays individual notification information in a card format
 * Used in notification listings and management interfaces
 * 
 * @param {Object} notification - Notification data object
 * @param {Function} onMarkAsRead - Callback function when mark as read is clicked
 * @param {Function} onDelete - Callback function when delete is clicked
 * @param {Function} onAction - Callback function when action button is clicked
 * @returns {JSX.Element} Notification card component
 */
export default function NotificationCard({ 
  notification, 
  onMarkAsRead, 
  onDelete, 
  onAction 
}) {
  if (!notification) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'insurance_match_alert':
        return 'local_pharmacy';
      case 'purchase_confirmation':
        return 'receipt';
      case 'stock_alert':
        return 'inventory';
      case 'system':
        return 'info';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type, read) => {
    if (read) {
      return 'bg-gray-50 border-gray-200';
    }
    
    switch (type) {
      case 'insurance_match_alert':
        return 'bg-green-50 border-green-200';
      case 'purchase_confirmation':
        return 'bg-blue-50 border-blue-200';
      case 'stock_alert':
        return 'bg-yellow-50 border-yellow-200';
      case 'system':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case 'insurance_match_alert':
        return 'Insurance Match Found';
      case 'purchase_confirmation':
        return 'Purchase Confirmed';
      case 'stock_alert':
        return 'Stock Alert';
      case 'system':
        return 'System Notification';
      default:
        return 'Notification';
    }
  };

  const isRead = notification.read_at !== null;
  const notificationType = notification.data?.type || 'system';
  const colorClass = getNotificationColor(notificationType, isRead);

  return (
    <div className={`rounded-lg border p-4 transition-all duration-200 hover:shadow-md ${colorClass}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-full ${
            isRead ? 'bg-gray-200' : 'bg-teal-100'
          }`}>
            <span className={`material-icons text-lg ${
              isRead ? 'text-gray-600' : 'text-teal-600'
            }`}>
              {getNotificationIcon(notificationType)}
            </span>
          </div>
          
          <div className="flex-1">
            <h3 className={`font-semibold ${
              isRead ? 'text-gray-700' : 'text-gray-900'
            }`}>
              {getNotificationTitle(notificationType)}
            </h3>
            <p className="text-sm text-gray-500">
              {formatDate(notification.created_at)}
            </p>
          </div>
        </div>

        {/* Unread indicator */}
        {!isRead && (
          <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
        )}
      </div>

      {/* Content */}
      <div className="ml-11">
        <p className={`text-sm mb-3 ${
          isRead ? 'text-gray-600' : 'text-gray-800'
        }`}>
          {notification.data?.message || notification.message || 'No message available'}
        </p>

        {/* Additional data for insurance match alerts */}
        {notificationType === 'insurance_match_alert' && notification.data && (
          <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {notification.data.pharmacy_name}
                </p>
                <p className="text-xs text-gray-600">
                  {notification.data.pharmacy_location}
                </p>
                {notification.data.distance && (
                  <p className="text-xs text-teal-600 font-medium">
                    {notification.data.distance} km away
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Accepts</p>
                <p className="text-sm font-medium text-purple-600">
                  {notification.data.insurance_name}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {!isRead && (
              <button
                onClick={() => onMarkAsRead && onMarkAsRead(notification)}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                Mark as read
              </button>
            )}
            
            {notification.data?.action_url && (
              <button
                onClick={() => onAction && onAction(notification)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View Details
              </button>
            )}
          </div>

          <button
            onClick={() => onDelete && onDelete(notification)}
            className="text-xs text-red-600 hover:text-red-700 font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}




