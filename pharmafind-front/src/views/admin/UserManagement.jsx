import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import SuccessMessage from '../../components/SuccessMessage';

/**
 * UserManagement Component
 * 
 * Admin interface for managing users:
 * - View all users (patients and pharmacy owners)
 * - Filter users by role and status
 * - View user details and activity
 * - Suspend/activate user accounts (reversible)
 * - Delete user accounts (permanent)
 * - Bulk operations
 * 
 * @returns {JSX.Element} User management component
 */
export default function UserManagement() {
  const { addToast } = useToast();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all'); // all, patients, pharmacy_owners, active, suspended
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [pagination, setPagination] = useState({});

  /**
   * Fetch users data
   */
  useEffect(() => {
    fetchUsers();
  }, [filter, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filter !== 'all') {
        if (['patient', 'pharmacy_owner', 'admin', 'super_admin'].includes(filter)) {
          params.append('role', filter);
        } else if (['active', 'suspended'].includes(filter)) {
          params.append('status', filter);
        }
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.data);
        setPagination({
          current_page: data.data.current_page,
          last_page: data.data.last_page,
          per_page: data.data.per_page,
          total: data.data.total
        });
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
      addToast('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user status change (suspend/activate)
   */
  const handleStatusChange = async (userId, newStatus) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      
      if (data.success) {
        addToast(data.message, 'success');
        fetchUsers(); // Refresh the list
      } else {
        throw new Error(data.message || 'Failed to update user status');
      }
    } catch (err) {
      console.error('Error updating user status:', err);
      addToast('Failed to update user status', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user deletion (permanent)
   */
  const handleDeleteUser = async (userId, userName, userRole) => {
    const confirmMessage = userRole === 'pharmacy_owner' 
      ? `Are you sure you want to PERMANENTLY DELETE "${userName}"? This will also permanently delete all pharmacies owned by this user. This action CANNOT be undone.`
      : `Are you sure you want to PERMANENTLY DELETE "${userName}"? This action CANNOT be undone.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        addToast(data.message, 'success');
        fetchUsers(); // Refresh the list
      } else {
        throw new Error(data.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      addToast('Failed to delete user', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle bulk actions
   */
  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      addToast('Please select users first', 'warning');
      return;
    }

    let confirmMessage = '';
    switch (action) {
      case 'activate':
        confirmMessage = `Are you sure you want to activate ${selectedUsers.length} user(s)?`;
        break;
      case 'suspend':
        confirmMessage = `Are you sure you want to suspend ${selectedUsers.length} user(s)? They will not be able to login but their data will be preserved.`;
        break;
      case 'delete':
        confirmMessage = `Are you sure you want to PERMANENTLY DELETE ${selectedUsers.length} user(s)? This action CANNOT be undone.`;
        break;
    }

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/admin/users/bulk-action', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          action: action,
          user_ids: selectedUsers
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        addToast(data.message, 'success');
        setSelectedUsers([]);
        setShowBulkActions(false);
        fetchUsers(); // Refresh the list
      } else {
        throw new Error(data.message || 'Failed to perform bulk action');
      }
    } catch (err) {
      console.error('Error performing bulk action:', err);
      addToast('Failed to perform bulk action', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user selection for bulk actions
   */
  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  /**
   * Handle select all users
   */
  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  /**
   * Get status badge styling
   */
  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Get role badge styling
   */
  const getRoleBadge = (role) => {
    const styles = {
      patient: 'bg-blue-100 text-blue-800',
      pharmacy_owner: 'bg-purple-100 text-purple-800',
      admin: 'bg-orange-100 text-orange-800',
      super_admin: 'bg-red-100 text-red-800'
    };
    return styles[role] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage user accounts, suspend/activate users, and handle user data</p>
      </div>

      {/* Messages */}
      <ErrorMessage error={error} onClose={() => setError('')} />
      <SuccessMessage message={success} onClose={() => setSuccess('')} />

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="patient">Patients</option>
              <option value="pharmacy_owner">Pharmacy Owners</option>
              <option value="admin">Admins</option>
              <option value="super_admin">Super Admins</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Refresh Button */}
          <div className="flex items-end">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? <LoadingSpinner size="sm" text="" /> : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-blue-800">
                {selectedUsers.length} user(s) selected
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('suspend')}
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors"
              >
                Suspend
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <LoadingSpinner text="Loading users..." />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <span className="material-icons text-6xl mb-4 block">people</span>
            <p className="text-lg">No users found</p>
            <p className="text-sm">Users will appear here when they register</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-3">User Info</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2">Joined</div>
                <div className="col-span-3">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Checkbox */}
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserSelect(user.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    {/* User Info */}
                    <div className="col-span-3">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.phone_number && (
                        <div className="text-sm text-gray-500">{user.phone_number}</div>
                      )}
                    </div>

                    {/* Role */}
                    <div className="col-span-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(user.role)}`}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(user.status)}`}>
                        {user.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Joined Date */}
                    <div className="col-span-2">
                      <div className="text-sm text-gray-900">{formatDate(user.created_at)}</div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-3">
                      <div className="flex space-x-2">
                        {/* Suspend/Activate Button */}
                        {user.status === 'active' ? (
                          <button
                            onClick={() => handleStatusChange(user.id, 'suspended')}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Suspend User"
                          >
                            <span className="material-icons text-sm">block</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(user.id, 'active')}
                            className="text-green-600 hover:text-green-900"
                            title="Activate User"
                          >
                            <span className="material-icons text-sm">check_circle</span>
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name, user.role)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete User (Permanent)"
                        >
                          <span className="material-icons text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                    {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                    {pagination.total} users
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setPagination({...pagination, current_page: pagination.current_page - 1});
                        fetchUsers();
                      }}
                      disabled={pagination.current_page === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => {
                        setPagination({...pagination, current_page: pagination.current_page + 1});
                        fetchUsers();
                      }}
                      disabled={pagination.current_page === pagination.last_page}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="material-icons text-blue-600 mr-3">info</span>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">User Management Actions:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Suspend:</strong> Temporarily disable user account. User cannot login but all data is preserved. Can be restored.</li>
              <li><strong>Activate:</strong> Restore suspended user account. User can login again.</li>
              <li><strong>Delete:</strong> Permanently remove user and all associated data. This action cannot be undone.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}