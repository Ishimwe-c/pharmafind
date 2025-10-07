import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import SuccessMessage from '../../components/SuccessMessage';

/**
 * Contact Messages Management Component
 * 
 * Admin interface for managing contact messages:
 * - View all contact messages with pagination
 * - Filter by status and priority
 * - Search through messages
 * - Mark messages as read/replied/closed
 * - Add admin notes
 * - Delete messages
 * - Priority-based color coding
 * 
 * @returns {JSX.Element} Contact messages management component
 */
const ContactMessages = () => {
  const { addToast } = useToast();
  
  // State management
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [pagination, setPagination] = useState({});
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  /**
   * Fetch contact messages from API
   */
  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.current_page || 1,
        per_page: 15,
        search: searchTerm,
        status: statusFilter,
        priority: priorityFilter
      });

      const response = await fetch(`/api/admin/contact-messages?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages(data.data.data);
        setPagination({
          current_page: data.data.current_page,
          last_page: data.data.last_page,
          per_page: data.data.per_page,
          total: data.data.total
        });
      } else {
        throw new Error(data.message || 'Failed to fetch messages');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message || 'Failed to fetch contact messages');
      addToast('Failed to fetch contact messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark message as read
   */
  const handleMarkAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/contact-messages/${messageId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        addToast('Message marked as read', 'success');
        fetchMessages(); // Refresh the list
      } else {
        throw new Error(data.message || 'Failed to mark as read');
      }
    } catch (err) {
      console.error('Error marking as read:', err);
      addToast('Failed to mark message as read', 'error');
    }
  };

  /**
   * Update message status
   */
  const handleUpdateStatus = async (messageId, newStatus) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          admin_notes: adminNotes 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        addToast(`Message ${newStatus} successfully`, 'success');
        setShowModal(false);
        setAdminNotes('');
        fetchMessages(); // Refresh the list
      } else {
        throw new Error(data.message || 'Failed to update message');
      }
    } catch (err) {
      console.error('Error updating message:', err);
      addToast('Failed to update message', 'error');
    } finally {
      setUpdating(false);
    }
  };

  /**
   * Delete message
   */
  const handleDelete = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        addToast('Message deleted successfully', 'success');
        fetchMessages(); // Refresh the list
      } else {
        throw new Error(data.message || 'Failed to delete message');
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      addToast('Failed to delete message', 'error');
    }
  };

  /**
   * Get priority badge styling
   */
  const getPriorityBadge = (priority) => {
    const styles = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return styles[priority] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Get status badge styling
   */
  const getStatusBadge = (status) => {
    const styles = {
      new: 'bg-blue-100 text-blue-800',
      read: 'bg-purple-100 text-purple-800',
      replied: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch messages on component mount and when filters change
  useEffect(() => {
    fetchMessages();
  }, [searchTerm, statusFilter, priorityFilter]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Messages</h1>
        <p className="text-gray-600">Manage and respond to user inquiries and feedback</p>
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
              placeholder="Search messages..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Refresh Button */}
          <div className="flex items-end">
            <button
              onClick={fetchMessages}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? <LoadingSpinner size="sm" text="" /> : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <LoadingSpinner text="Loading messages..." />
          </div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <span className="material-icons text-6xl mb-4 block">inbox</span>
            <p className="text-lg">No contact messages found</p>
            <p className="text-sm">Messages will appear here when users contact you</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                <div className="col-span-3">Contact Info</div>
                <div className="col-span-2">Subject</div>
                <div className="col-span-2">Priority</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {messages.map((message) => (
                <div key={message.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Contact Info */}
                    <div className="col-span-3">
                      <div className="font-medium text-gray-900">{message.name}</div>
                      <div className="text-sm text-gray-500">{message.email}</div>
                      {message.phone && (
                        <div className="text-sm text-gray-500">{message.phone}</div>
                      )}
                    </div>

                    {/* Subject */}
                    <div className="col-span-2">
                      <div className="font-medium text-gray-900 truncate" title={message.subject}>
                        {message.subject}
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="col-span-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(message.priority)}`}>
                        {message.priority.charAt(0).toUpperCase() + message.priority.slice(1)}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(message.status)}`}>
                        {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="col-span-2">
                      <div className="text-sm text-gray-900">{formatDate(message.created_at)}</div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2">
                      <div className="flex space-x-2">
                        {/* View/Edit Button */}
                        <button
                          onClick={() => {
                            setSelectedMessage(message);
                            setAdminNotes(message.admin_notes || '');
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View/Edit Message"
                        >
                          <span className="material-icons text-sm">visibility</span>
                        </button>

                        {/* Mark as Read Button */}
                        {message.status === 'new' && (
                          <button
                            onClick={() => handleMarkAsRead(message.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Mark as Read"
                          >
                            <span className="material-icons text-sm">mark_email_read</span>
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(message.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Message"
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
                    {pagination.total} messages
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setPagination({...pagination, current_page: pagination.current_page - 1});
                        fetchMessages();
                      }}
                      disabled={pagination.current_page === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => {
                        setPagination({...pagination, current_page: pagination.current_page + 1});
                        fetchMessages();
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

      {/* Message Detail Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Message Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>

              {/* Message Content */}
              <div className="space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedMessage.email}</p>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">{selectedMessage.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="text-gray-900">{formatDate(selectedMessage.created_at)}</p>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <p className="text-gray-900">{selectedMessage.subject}</p>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <div className="mt-1 p-4 bg-gray-50 rounded-md">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add internal notes about this message..."
                  />
                </div>

                {/* Status Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'replied')}
                    disabled={updating}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {updating ? <LoadingSpinner size="sm" text="" /> : 'Mark as Replied'}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'closed')}
                    disabled={updating}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    {updating ? <LoadingSpinner size="sm" text="" /> : 'Close'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;




















