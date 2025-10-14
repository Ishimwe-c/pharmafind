import React, { useState, useEffect } from 'react';
import { purchaseService } from '../../services/purchaseService';
import PurchaseCard from '../../components/PurchaseCard';
import PurchaseForm from '../../components/PurchaseForm';

/**
 * PurchaseHistory Component
 * 
 * Displays purchase history for pharmacy staff
 * Shows all purchases made at the pharmacy with filtering and search capabilities
 * Allows creating new purchases and viewing detailed reports
 * 
 * @returns {JSX.Element} Purchase history view component
 */
export default function PurchaseHistory() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    payment_status: '',
    date_from: '',
    date_to: '',
    patient_id: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });

  useEffect(() => {
    loadPurchases();
  }, [filters, pagination.current_page]);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...filters,
        page: pagination.current_page,
        per_page: pagination.per_page
      };

      const response = await purchaseService.getPurchases(params);
      
      if (response.success) {
        setPurchases(response.data.data);
        setPagination(prev => ({
          ...prev,
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          total: response.data.total
        }));
      } else {
        setError(response.message || 'Failed to load purchases');
      }
    } catch (error) {
      console.error('Error loading purchases:', error);
      setError('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({
      ...prev,
      current_page: 1 // Reset to first page when filters change
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      payment_status: '',
      date_from: '',
      date_to: '',
      patient_id: ''
    });
    setPagination(prev => ({
      ...prev,
      current_page: 1
    }));
  };

  const handleCreatePurchase = () => {
    setEditingPurchase(null);
    setShowForm(true);
  };

  const handleEditPurchase = (purchase) => {
    setEditingPurchase(purchase);
    setShowForm(true);
  };

  const handleViewPurchase = (purchase) => {
    // For now, we'll just show an alert with purchase details
    // In a real app, this would open a detailed modal or navigate to a detail page
    alert(`Purchase Details:\n\nNumber: ${purchase.purchase_number}\nPatient: ${purchase.user?.name}\nTotal: RWF ${purchase.total_amount.toLocaleString()}\nStatus: ${purchase.payment_status}`);
  };

  const handleDeletePurchase = async (purchase) => {
    if (!window.confirm(`Are you sure you want to delete purchase ${purchase.purchase_number}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await purchaseService.deletePurchase(purchase.id);
      
      if (response.success) {
        // Reload purchases
        loadPurchases();
      } else {
        alert('Failed to delete purchase: ' + response.message);
      }
    } catch (error) {
      console.error('Error deleting purchase:', error);
      alert('Failed to delete purchase');
    }
  };

  const handleFormSuccess = (purchase) => {
    setShowForm(false);
    setEditingPurchase(null);
    loadPurchases(); // Reload the list
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingPurchase(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'partially_paid':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (showForm) {
    return (
      <PurchaseForm
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
        initialData={editingPurchase}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Purchase History</h1>
            <p className="text-gray-600 mt-1">
              Track and manage all patient purchases at your pharmacy
            </p>
          </div>
          <button
            onClick={handleCreatePurchase}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <span className="material-icons text-sm mr-2">add</span>
            New Purchase
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by purchase number, patient name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <select
              value={filters.payment_status}
              onChange={(e) => handleFilterChange('payment_status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {purchases.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="material-icons text-blue-600 text-sm">receipt</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Purchases</p>
                <p className="text-lg font-semibold text-gray-900">{pagination.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="material-icons text-green-600 text-sm">paid</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Paid</p>
                <p className="text-lg font-semibold text-gray-900">
                  {purchases.filter(p => p.payment_status === 'paid').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="material-icons text-yellow-600 text-sm">pending</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-lg font-semibold text-gray-900">
                  {purchases.filter(p => p.payment_status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="material-icons text-purple-600 text-sm">attach_money</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-lg font-semibold text-gray-900">
                  RWF {purchases.reduce((sum, p) => sum + parseFloat(p.total_amount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purchases List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-icons text-gray-400 text-2xl">receipt_long</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases found</h3>
          <p className="text-gray-500 mb-4">
            {Object.values(filters).some(f => f) 
              ? 'Try adjusting your filters to see more results.'
              : 'Start by creating your first purchase.'
            }
          </p>
          {!Object.values(filters).some(f => f) && (
            <button
              onClick={handleCreatePurchase}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create First Purchase
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {purchases.map(purchase => (
              <PurchaseCard
                key={purchase.id}
                purchase={purchase}
                onView={handleViewPurchase}
                onEdit={handleEditPurchase}
                onDelete={handleDeletePurchase}
                showActions={true}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                  disabled={pagination.current_page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setPagination(prev => ({ ...prev, current_page: page }))}
                    className={`px-3 py-2 border rounded-md text-sm font-medium ${
                      page === pagination.current_page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                  disabled={pagination.current_page === pagination.last_page}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}

