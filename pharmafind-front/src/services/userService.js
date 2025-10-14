import axiosClient from '../axios-client';

/**
 * User Service
 * 
 * Handles all API calls related to user management
 * Used for user authentication, profile management, and user data retrieval
 */

export const userService = {
  // Get current authenticated user
  getCurrentUser: async () => {
    const response = await axiosClient.get('/user');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await axiosClient.put('/user/profile', profileData);
    return response.data;
  },

  // Change user password
  changePassword: async (passwordData) => {
    const response = await axiosClient.put('/user/change-password', passwordData);
    return response.data;
  },

  // Get users with optional filters (admin only)
  getUsers: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.role) queryParams.append('role', params.role);
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);

    // Check if user is admin, if not, return empty array for non-admin users
    try {
      const response = await axiosClient.get(`/admin/users?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      // If not admin, return empty data structure
      if (error.response?.status === 403) {
        return {
          success: true,
          data: [],
          message: 'Access denied - admin only'
        };
      }
      throw error;
    }
  },

  // Get a specific user by ID (admin only)
  getUser: async (id) => {
    const response = await axiosClient.get(`/admin/users/${id}`);
    return response.data;
  },

  // Update user status (admin only)
  updateUserStatus: async (id, status) => {
    const response = await axiosClient.put(`/admin/users/${id}/status`, { status });
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (id) => {
    const response = await axiosClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Bulk action on users (admin only)
  bulkActionUsers: async (action, userIds) => {
    const response = await axiosClient.post('/admin/users/bulk-action', {
      action,
      user_ids: userIds
    });
    return response.data;
  },

  // Get user statistics (admin only)
  getUserStats: async () => {
    const response = await axiosClient.get('/admin/users/stats');
    return response.data;
  },

  // Search users
  searchUsers: async (searchTerm, filters = {}) => {
    const params = { search: searchTerm, ...filters };
    return userService.getUsers(params);
  },

  // Get users by role
  getUsersByRole: async (role, filters = {}) => {
    const params = { role, ...filters };
    return userService.getUsers(params);
  },

  // Get active users
  getActiveUsers: async (filters = {}) => {
    const params = { status: 'active', ...filters };
    return userService.getUsers(params);
  },

  // Get inactive users
  getInactiveUsers: async (filters = {}) => {
    const params = { status: 'inactive', ...filters };
    return userService.getUsers(params);
  },

  // Get patients for pharmacy (patients who have made purchases at this pharmacy)
  getPharmacyPatients: async () => {
    const response = await axiosClient.get('/purchases/pharmacy/patients');
    return response.data;
  }
};
