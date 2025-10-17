import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axiosClient from '../../axios-client';
import InsuranceCard from '../../components/InsuranceCard';
import InsuranceForm from '../../components/InsuranceForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

/**
 * InsuranceManagement Component
 * 
 * Main view for patients to manage their insurance information
 * Includes listing, adding, editing, and removing insurances
 * 
 * @returns {JSX.Element} Insurance management component
 */
export default function InsuranceManagement() {
  const { user } = useAuth();
  const { addToast } = useToast();

  // State management
  const [insurances, setInsurances] = useState([]);
  const [availableInsurances, setAvailableInsurances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Filters
  const [activeFilter, setActiveFilter] = useState('all');

  // Fetch data on component mount
  useEffect(() => {
    fetchInsurances();
    fetchAvailableInsurances();
  }, []);

  const fetchInsurances = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (activeFilter !== 'all') {
        params.append('active_only', activeFilter === 'active');
      }

      const response = await axiosClient.get(`/patient-insurances?${params.toString()}`);
      setInsurances(response.data.data || []);
    } catch (err) {
      console.error('Error fetching insurances:', err);
      setError('Failed to load insurance information');
      addToast('Failed to load insurance information', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableInsurances = async () => {
    try {
      const response = await axiosClient.get('/patient-insurances/available');
      setAvailableInsurances(response.data.data || []);
    } catch (err) {
      console.error('Error fetching available insurances:', err);
    }
  };

  // Refetch when filter changes
  useEffect(() => {
    fetchInsurances();
  }, [activeFilter]);

  const handleAddInsurance = async (formData) => {
    try {
      setFormLoading(true);
      
      const response = await axiosClient.post('/patient-insurances', formData);
      
      setInsurances(prev => [response.data.data, ...prev]);
      setShowForm(false);
      addToast('Insurance added successfully', 'success');
      
      // Refresh available insurances
      fetchAvailableInsurances();
    } catch (err) {
      console.error('Error adding insurance:', err);
      if (err.response?.data?.message) {
        addToast(err.response.data.message, 'error');
      } else {
        addToast('Failed to add insurance', 'error');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditInsurance = async (formData) => {
    try {
      setFormLoading(true);
      
      const response = await axiosClient.put(`/patient-insurances/${editingInsurance.id}`, formData);
      
      setInsurances(prev => 
        prev.map(insurance => 
          insurance.id === editingInsurance.id ? response.data.data : insurance
        )
      );
      setEditingInsurance(null);
      setShowForm(false);
      addToast('Insurance updated successfully', 'success');
    } catch (err) {
      console.error('Error updating insurance:', err);
      addToast('Failed to update insurance', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteInsurance = async (insurance) => {
    if (!window.confirm(`Are you sure you want to remove "${insurance.name}" from your profile?`)) {
      return;
    }

    try {
      await axiosClient.delete(`/patient-insurances/${insurance.id}`);
      
      setInsurances(prev => prev.filter(ins => ins.id !== insurance.id));
      addToast('Insurance removed successfully', 'success');
      
      // Refresh available insurances
      fetchAvailableInsurances();
    } catch (err) {
      console.error('Error deleting insurance:', err);
      addToast('Failed to remove insurance', 'error');
    }
  };

  const handleEdit = (insurance) => {
    setEditingInsurance(insurance);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingInsurance(null);
  };

  // Filter insurances based on current filter
  const filteredInsurances = insurances.filter(insurance => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return insurance.pivot?.is_active;
    if (activeFilter === 'inactive') return !insurance.pivot?.is_active;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner size="lg" text="Loading insurance information..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Insurance Management</h1>
              <p className="text-gray-600 mt-1">
                Manage your insurance providers and coverage information
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              disabled={availableInsurances.length === 0}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-icons mr-2">add</span>
              Add Insurance
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <ErrorMessage error={error} onClose={() => setError(null)} />
        )}

        {/* Available Insurances Info */}
        {availableInsurances.length === 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <span className="material-icons text-blue-600 mr-3 mt-1">info</span>
              <div>
                <h3 className="text-blue-800 font-semibold mb-1">All Insurances Added</h3>
                <p className="text-blue-700 text-sm">
                  You have already added all available insurance providers to your profile.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Filter Insurances</h3>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="all"
                    checked={activeFilter === 'all'}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">All</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="active"
                    checked={activeFilter === 'active'}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active Only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="inactive"
                    checked={activeFilter === 'inactive'}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Inactive Only</span>
                </label>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Showing {filteredInsurances.length} of {insurances.length} insurances
            </div>
          </div>
        </div>

        {/* Insurances Grid */}
        {filteredInsurances.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInsurances.map(insurance => (
              <InsuranceCard
                key={insurance.id}
                insurance={insurance}
                onEdit={handleEdit}
                onDelete={handleDeleteInsurance}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="material-icons text-6xl text-gray-300 mb-4">local_hospital</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No insurance information found</h3>
            <p className="text-gray-600 mb-6">
              {insurances.length === 0 
                ? "Start by adding your first insurance provider to your profile"
                : "No insurances match your current filter"
              }
            </p>
            {insurances.length === 0 && availableInsurances.length > 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Add Your First Insurance
              </button>
            )}
          </div>
        )}

        {/* Insurance Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-4 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <InsuranceForm
                insurance={editingInsurance}
                availableInsurances={availableInsurances}
                onSubmit={editingInsurance ? handleEditInsurance : handleAddInsurance}
                onCancel={handleFormCancel}
                loading={formLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}










