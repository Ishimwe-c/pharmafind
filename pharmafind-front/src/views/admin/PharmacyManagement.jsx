import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import SuccessMessage from '../../components/SuccessMessage';

/**
 * PharmacyManagement Component
 * 
 * Admin interface for managing pharmacies:
 * - View all pharmacies (approved and pending)
 * - Approve/reject pending pharmacies
 * - Edit pharmacy information
 * - View pharmacy details
 * - Bulk actions for multiple pharmacies
 * 
 * @returns {JSX.Element} Pharmacy management component
 */
export default function PharmacyManagement() {
  const { addToast } = useToast();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pharmacies, setPharmacies] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPharmacies, setSelectedPharmacies] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  /**
   * Fetch pharmacies data
   */
  useEffect(() => {
    fetchPharmacies();
  }, [filter, searchTerm]);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await fetch(`/api/admin/pharmacies?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pharmacies');
      }

      const data = await response.json();
      
      if (data.success) {
        // Transform the data to match the expected format
        const transformedPharmacies = data.data.data.map(pharmacy => ({
          id: pharmacy.id,
          name: pharmacy.pharmacy_name,
          owner: pharmacy.user ? pharmacy.user.name : 'Unknown',
          email: pharmacy.email,
          phone: pharmacy.phone_number || 'N/A',
          location: pharmacy.location || 'Rwanda',
          status: pharmacy.status, // Now using real status field
          verificationStatus: pharmacy.verification_status,
          verifiedAt: pharmacy.verified_at,
          verifiedBy: pharmacy.verifier ? pharmacy.verifier.name : null,
          registeredAt: pharmacy.created_at,
          insurances: pharmacy.insurances ? pharmacy.insurances.map(ins => ins.name) : [],
          workingHours: 'Mon-Fri: 8AM-6PM' // Default since we don't have this field
        }));
        
        setPharmacies(transformedPharmacies);
      } else {
        throw new Error(data.message || 'Failed to load pharmacies');
      }
      
    } catch (err) {
      console.error('Error fetching pharmacies:', err);
      setError('Failed to load pharmacies: ' + err.message);
      addToast('Failed to load pharmacies', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle pharmacy approval
   */
  const handleApprove = async (pharmacyId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/pharmacies/${pharmacyId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to approve pharmacy');
      }

      const data = await response.json();
      
      if (data.success) {
        setPharmacies(prev => prev.map(pharmacy => 
          pharmacy.id === pharmacyId 
            ? { ...pharmacy, status: 'approved' }
            : pharmacy
        ));
        
        setSuccess('Pharmacy approved successfully');
        addToast('Pharmacy approved successfully', 'success');
      } else {
        throw new Error(data.message || 'Failed to approve pharmacy');
      }
      
    } catch (err) {
      console.error('Error approving pharmacy:', err);
      addToast('Failed to approve pharmacy: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle pharmacy rejection
   */
  const handleReject = async (pharmacyId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/pharmacies/${pharmacyId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reject pharmacy');
      }

      const data = await response.json();
      
      if (data.success) {
        setPharmacies(prev => prev.filter(pharmacy => pharmacy.id !== pharmacyId));
        
        setSuccess('Pharmacy rejected');
        addToast('Pharmacy rejected', 'success');
      } else {
        throw new Error(data.message || 'Failed to reject pharmacy');
      }
      
    } catch (err) {
      console.error('Error rejecting pharmacy:', err);
      addToast('Failed to reject pharmacy: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle bulk approval
   */
  const handleBulkApprove = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPharmacies(prev => prev.map(pharmacy => 
        selectedPharmacies.includes(pharmacy.id)
          ? { ...pharmacy, status: 'approved' }
          : pharmacy
      ));
      
      setSelectedPharmacies([]);
      setShowBulkActions(false);
      setSuccess(`${selectedPharmacies.length} pharmacies approved successfully`);
      addToast(`${selectedPharmacies.length} pharmacies approved successfully`, 'success');
      
    } catch (err) {
      addToast('Failed to approve pharmacies', 'error');
    }
  };

  /**
   * Handle pharmacy verification
   */
  const handleVerify = async (pharmacyId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/pharmacies/${pharmacyId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to verify pharmacy');
      }

      const data = await response.json();
      
      if (data.success) {
        setPharmacies(prev => prev.map(pharmacy => 
          pharmacy.id === pharmacyId 
            ? { ...pharmacy, verificationStatus: 'verified', verifiedBy: data.data.verifier?.name }
            : pharmacy
        ));
        
        setSuccess('Pharmacy verified successfully');
        addToast('Pharmacy verified successfully', 'success');
      } else {
        throw new Error(data.message || 'Failed to verify pharmacy');
      }
      
    } catch (err) {
      console.error('Error verifying pharmacy:', err);
      addToast('Failed to verify pharmacy: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle pharmacy suspension/activation
   */
  const handleSuspend = async (pharmacyId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/pharmacies/${pharmacyId}/toggle-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update pharmacy status');
      }

      const data = await response.json();
      
      if (data.success) {
        setPharmacies(prev => prev.map(pharmacy => 
          pharmacy.id === pharmacyId 
            ? { ...pharmacy, status: 'suspended' }
            : pharmacy
        ));
        
        setSuccess('Pharmacy suspended successfully');
        addToast('Pharmacy suspended successfully', 'success');
      } else {
        throw new Error(data.message || 'Failed to update pharmacy status');
      }
      
    } catch (err) {
      console.error('Error updating pharmacy status:', err);
      addToast('Failed to update pharmacy status: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (pharmacyId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/pharmacies/${pharmacyId}/toggle-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update pharmacy status');
      }

      const data = await response.json();
      
      if (data.success) {
        setPharmacies(prev => prev.map(pharmacy => 
          pharmacy.id === pharmacyId 
            ? { ...pharmacy, status: 'active' }
            : pharmacy
        ));
        
        setSuccess('Pharmacy activated successfully');
        addToast('Pharmacy activated successfully', 'success');
      } else {
        throw new Error(data.message || 'Failed to update pharmacy status');
      }
      
    } catch (err) {
      console.error('Error updating pharmacy status:', err);
      addToast('Failed to update pharmacy status: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle pharmacy selection
   */
  const handleSelectPharmacy = (pharmacyId) => {
    setSelectedPharmacies(prev => 
      prev.includes(pharmacyId)
        ? prev.filter(id => id !== pharmacyId)
        : [...prev, pharmacyId]
    );
  };

  /**
   * Handle select all
   */
  const handleSelectAll = () => {
    const pendingPharmacies = filteredPharmacies
      .filter(pharmacy => pharmacy.status === 'pending')
      .map(pharmacy => pharmacy.id);
    
    setSelectedPharmacies(pendingPharmacies);
  };

  /**
   * Filter pharmacies based on status
   */
  const filteredPharmacies = pharmacies.filter(pharmacy => {
    if (filter === 'all') return true;
    return pharmacy.status === filter;
  });

  /**
   * Get status badge styling
   */
  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    
    return `px-2 py-1 text-xs rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`;
  };

  /**
   * Get verification badge styling
   */
  const getVerificationBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return `px-2 py-1 text-xs rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading pharmacies..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Pharmacy Management</h1>
          <p className="text-gray-600 mt-1">Manage and approve pharmacy registrations</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchPharmacies}
            className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="material-icons text-sm mr-1">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Messages */}
      <ErrorMessage error={error} onClose={() => setError('')} />
      <SuccessMessage message={success} onClose={() => setSuccess('')} />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Filter Pharmacies</h2>
          <div className="flex items-center space-x-2">
            {selectedPharmacies.length > 0 && (
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Bulk Actions ({selectedPharmacies.length})
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' 
                ? 'bg-teal-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({pharmacies.length})
          </button>
          <button
            onClick={() => setFilter('pending_verification')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'pending_verification' 
                ? 'bg-teal-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending Verification ({pharmacies.filter(p => p.verificationStatus === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'verified' 
                ? 'bg-teal-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Verified ({pharmacies.filter(p => p.verificationStatus === 'verified').length})
          </button>
          <button
            onClick={() => setFilter('suspended')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'suspended' 
                ? 'bg-teal-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Suspended ({pharmacies.filter(p => p.status === 'suspended').length})
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">Bulk Actions</h3>
              <p className="text-sm text-blue-700">
                {selectedPharmacies.length} pharmacies selected
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Approve All
              </button>
              <button
                onClick={() => setSelectedPharmacies([])}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pharmacies Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Pharmacies ({filteredPharmacies.length})
            </h2>
            {filter === 'pending' && (
              <button
                onClick={handleSelectAll}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Select All Pending
              </button>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedPharmacies.length === filteredPharmacies.filter(p => p.status === 'pending').length && filteredPharmacies.filter(p => p.status === 'pending').length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pharmacy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPharmacies.map((pharmacy) => (
                <tr key={pharmacy.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {pharmacy.status === 'pending' && (
                      <input
                        type="checkbox"
                        checked={selectedPharmacies.includes(pharmacy.id)}
                        onChange={() => handleSelectPharmacy(pharmacy.id)}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pharmacy.name}</div>
                      <div className="text-sm text-gray-500">{pharmacy.location}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{pharmacy.owner}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{pharmacy.email}</div>
                    <div className="text-sm text-gray-500">{pharmacy.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(pharmacy.status)}>
                      {pharmacy.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getVerificationBadge(pharmacy.verificationStatus)}>
                      {pharmacy.verificationStatus}
                    </span>
                    {pharmacy.verifiedBy && (
                      <div className="text-xs text-gray-500 mt-1">
                        by {pharmacy.verifiedBy}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(pharmacy.registeredAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {pharmacy.verificationStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleVerify(pharmacy.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Verify pharmacy"
                          >
                            <span className="material-icons text-sm">verified</span>
                          </button>
                          <button
                            onClick={() => handleReject(pharmacy.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Reject verification"
                          >
                            <span className="material-icons text-sm">close</span>
                          </button>
                        </>
                      )}
                      {pharmacy.status === 'active' ? (
                        <button
                          onClick={() => handleSuspend(pharmacy.id)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Suspend pharmacy"
                        >
                          <span className="material-icons text-sm">pause</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(pharmacy.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Activate pharmacy"
                        >
                          <span className="material-icons text-sm">play_arrow</span>
                        </button>
                      )}
                      <button className="text-blue-600 hover:text-blue-900" title="View details">
                        <span className="material-icons text-sm">visibility</span>
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <span className="material-icons text-sm">edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredPharmacies.length === 0 && (
        <div className="text-center py-12">
          <span className="material-icons text-6xl text-gray-300 mb-4">local_pharmacy</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pharmacies found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'No pharmacies have been registered yet.'
              : `No ${filter} pharmacies found.`
            }
          </p>
        </div>
      )}
    </div>
  );
}
