import axiosClient from '../axios-client';

/**
 * Notification Service
 * 
 * Handles all API calls related to notifications
 * Used by patients to manage their notifications
 */

export const notificationService = {
  // Get all notifications for the current user
  getNotifications: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.read) queryParams.append('read', params.read);
    if (params.type) queryParams.append('type', params.type);
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);

    const response = await axiosClient.get(`/notifications?${queryParams.toString()}`);
    return response.data;
  },

  // Mark a notification as read
  markAsRead: async (id) => {
    const response = await axiosClient.post(`/notifications/mark-read/${id}`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await axiosClient.post('/notifications/mark-all-read');
    return response.data;
  },

  // Delete a notification
  deleteNotification: async (id) => {
    const response = await axiosClient.delete(`/notifications/${id}`);
    return response.data;
  },

  // Get unread notifications count
  getUnreadCount: async () => {
    const notifications = await notificationService.getNotifications();
    return notifications.data.filter(notification => notification.read_at === null).length;
  },

  // Get notifications by type
  getNotificationsByType: async (type) => {
    return notificationService.getNotifications({ type });
  },

  // Get unread notifications only
  getUnreadNotifications: async () => {
    return notificationService.getNotifications({ read: false });
  },

  // Get read notifications only
  getReadNotifications: async () => {
    return notificationService.getNotifications({ read: true });
  },

  // Get insurance match alert notifications
  getInsuranceMatchAlerts: async () => {
    return notificationService.getNotificationsByType('insurance_match_alert');
  },

  // Get purchase confirmation notifications
  getPurchaseConfirmations: async () => {
    return notificationService.getNotificationsByType('purchase_confirmation');
  },

  // Get stock alert notifications
  getStockAlerts: async () => {
    return notificationService.getNotificationsByType('stock_alert');
  },

  // Get system notifications
  getSystemNotifications: async () => {
    return notificationService.getNotificationsByType('system');
  }
};




