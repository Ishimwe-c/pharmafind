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
      case 'purchase_created':
      case 'purchase_confirmation':
        return 'receipt';
      case 'purchase_updated':
        return 'edit_note';
      case 'purchase_cancelled':
        return 'cancel';
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
      case 'purchase_created':
      case 'purchase_confirmation':
        return 'bg-blue-50 border-blue-200';
      case 'purchase_updated':
        return 'bg-purple-50 border-purple-200';
      case 'purchase_cancelled':
        return 'bg-red-50 border-red-200';
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
      case 'purchase_created':
        return '💊 New Purchase Receipt';
      case 'purchase_confirmation':
        return 'Purchase Confirmed';
      case 'purchase_updated':
        return 'Purchase Updated';
      case 'purchase_cancelled':
        return 'Purchase Cancelled';
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

        {/* Additional data for purchase notifications */}
        {(notificationType === 'purchase_created' || notificationType === 'purchase_updated' || notificationType === 'purchase_confirmation') && notification.data && (
          <div className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
            {/* Pharmacy & Date */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {notification.data.pharmacy_name}
                </p>
                {notification.data.pharmacy_location && (
                  <p className="text-xs text-gray-600">
                    📍 {notification.data.pharmacy_location}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {notification.data.purchase_date}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Purchase #</p>
                <p className="text-sm font-mono font-medium text-gray-700">
                  {notification.data.purchase_number}
                </p>
              </div>
            </div>

            {/* Medicines List */}
            {notification.data.items && notification.data.items.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Medicines:</p>
                <div className="space-y-1">
                  {notification.data.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="text-gray-700">
                        {item.medicine_name} × {item.quantity}
                      </span>
                      <span className="text-gray-600">
                        RWF {Number(item.total_price).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amount Summary */}
            <div className="space-y-1 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold text-gray-900">
                  RWF {Number(notification.data.total_amount).toLocaleString()}
                </span>
              </div>
              
              {/* Always show payment breakdown if insurance is involved */}
              {notification.data.insurance_name && (
                <>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{notification.data.insurance_name} Coverage:</span>
                    <span className={`font-medium ${Number(notification.data.insurance_coverage || 0) > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      {Number(notification.data.insurance_coverage || 0) > 0 ? '-' : ''}RWF {Number(notification.data.insurance_coverage || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-1 mt-1">
                    <span className="text-gray-700 font-medium">You Pay:</span>
                    <span className="font-semibold text-teal-600">
                      RWF {Number(notification.data.patient_payment).toLocaleString()}
                    </span>
                  </div>
                </>
              )}

              {/* Payment Status */}
              <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-gray-100">
                <span className="text-gray-600">Payment Status:</span>
                <span className={`px-2 py-1 rounded-full font-medium ${
                  notification.data.payment_status === 'paid' 
                    ? 'bg-green-100 text-green-700'
                    : notification.data.payment_status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {notification.data.payment_status?.toUpperCase()}
                </span>
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





