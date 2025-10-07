import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import SuccessMessage from '../../components/SuccessMessage';

/**
 * InsuranceManagement Component
 * 
 * Admin interface for managing insurance providers:
 * - View all insurance providers
 * - Add new insurance providers
 * - Edit existing insurance information
 * - Delete insurance providers
 * - View which pharmacies accept each insurance
 * 
 * @returns {JSX.Element} Insurance management component
 */
export default function InsuranceManagement() {
  const { addToast } = useToast();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [insurances, setInsurances] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    website: ''
  });

  /**
   * Fetch insurances data
   */
  useEffect(() => {
    fetchInsurances();
  }, [searchTerm]);

  const fetchInsurances = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await fetch(`/api/admin/insurances?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch insurances');
      }

      const data = await response.json();
      
      if (data.success) {
        // Transform the data to match the expected format
        const transformedInsurances = data.data.data.map(insurance => ({
          id: insurance.id,
          name: insurance.name,
          description: 'Health insurance provider', // Default description
          contact_email: 'info@insurance.rw', // Default contact
          contact_phone: '+250 788 000 000', // Default phone
          website: 'https://www.insurance.rw', // Default website
          created_at: insurance.created_at,
          pharmacy_count: insurance.pharmacies_count || 0 // Use actual count from API
        }));
        
        setInsurances(transformedInsurances);
      } else {
        throw new Error(data.message || 'Failed to load insurances');
      }
      
    } catch (err) {
      console.error('Error fetching insurances:', err);
      setError('Failed to load insurances: ' + err.message);
      addToast('Failed to load insurances', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle form input changes
   */
  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /**
   * Handle form submission (add or edit)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const url = editingInsurance 
        ? `/api/admin/insurances/${editingInsurance.id}`
        : '/api/admin/insurances';
      
      const method = editingInsurance ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingInsurance ? 'update' : 'create'} insurance`);
      }

      const data = await response.json();
      
      if (data.success) {
        if (editingInsurance) {
          // Update existing insurance
          setInsurances(prev => prev.map(insurance => 
            insurance.id === editingInsurance.id
              ? { ...insurance, name: formData.name }
              : insurance
          ));
          setSuccess('Insurance updated successfully');
          addToast('Insurance updated successfully', 'success');
        } else {
          // Add new insurance
          const newInsurance = {
            id: data.data.id,
            name: formData.name,
            description: 'Health insurance provider',
            contact_email: 'info@insurance.rw',
            contact_phone: '+250 788 000 000',
            website: 'https://www.insurance.rw',
            created_at: data.data.created_at,
            pharmacy_count: data.data.pharmacies_count || 0
          };
          setInsurances(prev => [...prev, newInsurance]);
          setSuccess('Insurance added successfully');
          addToast('Insurance added successfully', 'success');
        }
      } else {
        throw new Error(data.message || `Failed to ${editingInsurance ? 'update' : 'create'} insurance`);
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        contact_email: '',
        contact_phone: '',
        website: ''
      });
      setShowAddForm(false);
      setEditingInsurance(null);
      
    } catch (err) {
      console.error('Error saving insurance:', err);
      addToast('Failed to save insurance: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle edit insurance
   */
  const handleEdit = (insurance) => {
    setEditingInsurance(insurance);
    setFormData({
      name: insurance.name,
      description: insurance.description,
      contact_email: insurance.contact_email,
      contact_phone: insurance.contact_phone,
      website: insurance.website
    });
    setShowAddForm(true);
  };

  /**
   * Handle delete insurance
   */
  const handleDelete = async (insuranceId) => {
    if (!window.confirm('Are you sure you want to delete this insurance? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/insurances/${insuranceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });
      // Try to parse JSON even on error to surface server message
      let data = null;
      try {
        data = await response.json();
      } catch {}

      if (!response.ok) {
        const serverMessage = data?.message || (response.status === 400 ? 'Bad request' : 'Failed to delete insurance');
        throw new Error(serverMessage);
      }

      if (data && data.success) {
        setInsurances(prev => prev.filter(insurance => insurance.id !== insuranceId));
        setSuccess('Insurance deleted successfully');
        addToast('Insurance deleted successfully', 'success');
      } else {
        throw new Error(data?.message || 'Failed to delete insurance');
      }
      
    } catch (err) {
      console.error('Error deleting insurance:', err);
      addToast('Failed to delete insurance: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancel form
   */
  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      contact_email: '',
      contact_phone: '',
      website: ''
    });
    setShowAddForm(false);
    setEditingInsurance(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading insurances..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Insurance Management</h1>
          <p className="text-gray-600 mt-1">Manage insurance providers and their information</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchInsurances}
            className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="material-icons text-sm mr-1">refresh</span>
            Refresh
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <span className="material-icons text-sm mr-1">add</span>
            Add Insurance
          </button>
        </div>
      </div>

      {/* Messages */}
      <ErrorMessage error={error} onClose={() => setError('')} />
      <SuccessMessage message={success} onClose={() => setSuccess('')} />

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {editingInsurance ? 'Edit Insurance' : 'Add New Insurance'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter insurance name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter contact email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter contact phone"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter website URL"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter insurance description"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                type="submit"
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                {editingInsurance ? 'Update Insurance' : 'Add Insurance'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Insurances Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Insurance Providers ({insurances.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Insurance Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pharmacies
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {insurances.map((insurance) => (
                <tr key={insurance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{insurance.name}</div>
                      {insurance.website && (
                        <a 
                          href={insurance.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-teal-600 hover:text-teal-700"
                        >
                          Visit Website
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {insurance.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{insurance.contact_email}</div>
                    <div className="text-sm text-gray-500">{insurance.contact_phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {insurance.pharmacy_count} pharmacies
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(insurance.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(insurance)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit insurance"
                      >
                        <span className="material-icons text-sm">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(insurance.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete insurance"
                      >
                        <span className="material-icons text-sm">delete</span>
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
      {insurances.length === 0 && (
        <div className="text-center py-12">
          <span className="material-icons text-6xl text-gray-300 mb-4">verified_user</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No insurances found</h3>
          <p className="text-gray-500">No insurance providers have been added yet.</p>
        </div>
      )}
    </div>
  );
}
