import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axiosClient from '../../axios-client';
import MedicineCard from '../../components/MedicineCard';
import MedicineForm from '../../components/MedicineForm';
import StockUpdateModal from '../../components/StockUpdateModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

/**
 * MedicineManagement Component
 * 
 * Main view for pharmacy owners to manage their medicine inventory
 * Includes listing, adding, editing, and stock management
 * 
 * @returns {JSX.Element} Medicine management component
 */
export default function MedicineManagement() {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  console.log('MedicineManagement - Current user:', user);

  // State management
  const [medicines, setMedicines] = useState([]);
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [categories, setCategories] = useState([]);

  // Fetch pharmacy and medicines on component mount
  useEffect(() => {
    fetchPharmacy();
    fetchCategories();
  }, []);

  // Fetch medicines when pharmacy is loaded
  useEffect(() => {
    if (pharmacy?.id) {
      fetchMedicines();
    }
  }, [pharmacy]);

  const fetchPharmacy = async () => {
    try {
      console.log('Fetching pharmacy data...');
      const response = await axiosClient.get('/pharmacy/my-pharmacy');
      console.log('Pharmacy response:', response.data);
      setPharmacy(response.data);
    } catch (err) {
      console.error('Error fetching pharmacy:', err);
      setError('Failed to load pharmacy data');
      addToast('Failed to load pharmacy data', 'error');
    }
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (pharmacy?.id) params.append('pharmacy_id', pharmacy.id);
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      if (stockFilter === 'in_stock') params.append('in_stock', 'true');
      if (stockFilter === 'out_of_stock') params.append('in_stock', 'false');

      console.log('Fetching medicines with params:', params.toString());
      console.log('Pharmacy ID:', pharmacy?.id);
      
      const response = await axiosClient.get(`/medicines?${params.toString()}`);
      console.log('Medicines API response:', response.data);
      
      // Handle paginated response - medicines are in data.data
      const medicinesData = response.data?.data?.data || response.data?.data || response.data || [];
      console.log('Processed medicines data:', medicinesData);
      console.log('Response structure:', {
        success: response.data?.success,
        data: response.data?.data,
        dataData: response.data?.data?.data,
        total: response.data?.data?.total
      });
      
      setMedicines(Array.isArray(medicinesData) ? medicinesData : []);
    } catch (err) {
      console.error('Error fetching medicines:', err);
      setError('Failed to load medicines');
      addToast('Failed to load medicines', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosClient.get('/medicines/categories');
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMedicines();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, categoryFilter, stockFilter]);

  const handleAddMedicine = async (formData) => {
    try {
      setFormLoading(true);
      
      // Include pharmacy_id in the form data
      const medicineData = {
        ...formData,
        pharmacy_id: pharmacy.id
      };
      
      const response = await axiosClient.post('/medicines', medicineData);
      
      setMedicines(prev => [response.data.data, ...prev]);
      setShowForm(false);
      addToast('Medicine added successfully', 'success');
    } catch (err) {
      console.error('Error adding medicine:', err);
      addToast('Failed to add medicine', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditMedicine = async (formData) => {
    try {
      setFormLoading(true);
      
      // Include pharmacy_id in the form data
      const medicineData = {
        ...formData,
        pharmacy_id: pharmacy.id
      };
      
      const response = await axiosClient.put(`/medicines/${editingMedicine.id}`, medicineData);
      
      setMedicines(prev => 
        prev.map(medicine => 
          medicine.id === editingMedicine.id ? response.data.data : medicine
        )
      );
      setEditingMedicine(null);
      setShowForm(false);
      addToast('Medicine updated successfully', 'success');
    } catch (err) {
      console.error('Error updating medicine:', err);
      addToast('Failed to update medicine', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteMedicine = async (medicine) => {
    if (!window.confirm(`Are you sure you want to delete "${medicine.name}"?`)) {
      return;
    }

    try {
      await axiosClient.delete(`/medicines/${medicine.id}`);
      
      setMedicines(prev => prev.filter(m => m.id !== medicine.id));
      addToast('Medicine deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting medicine:', err);
      addToast('Failed to delete medicine', 'error');
    }
  };

  const handleUpdateStock = async (stockData) => {
    try {
      setStockLoading(true);
      
      const response = await axiosClient.post(`/medicines/${selectedMedicine.id}/stock`, stockData);
      
      setMedicines(prev => 
        prev.map(medicine => 
          medicine.id === selectedMedicine.id ? response.data.data : medicine
        )
      );
      setShowStockModal(false);
      setSelectedMedicine(null);
      addToast('Stock updated successfully', 'success');
    } catch (err) {
      console.error('Error updating stock:', err);
      addToast('Failed to update stock', 'error');
    } finally {
      setStockLoading(false);
    }
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setShowForm(true);
  };

  const handleStockUpdate = (medicine) => {
    setSelectedMedicine(medicine);
    setShowStockModal(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingMedicine(null);
  };

  const handleStockModalClose = () => {
    setShowStockModal(false);
    setSelectedMedicine(null);
  };

  // Filter medicines based on current filters
  const filteredMedicines = (medicines || []).filter(medicine => {
    const matchesSearch = !searchTerm || 
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || medicine.category === categoryFilter;
    
    const matchesStock = !stockFilter || 
      (stockFilter === 'in_stock' && medicine.stock_quantity > 0) ||
      (stockFilter === 'out_of_stock' && medicine.stock_quantity === 0) ||
      (stockFilter === 'low_stock' && medicine.stock_quantity > 0 && medicine.stock_quantity <= 10);

    return matchesSearch && matchesCategory && matchesStock;
  });

  if (loading || !pharmacy) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner size="lg" text="Loading medicine management..." />
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
              <h1 className="text-3xl font-bold text-gray-900">Medicine Management</h1>
              <p className="text-gray-600 mt-1">
                Manage your pharmacy's medicine inventory
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center"
            >
              <span className="material-icons mr-2">add</span>
              Add Medicine
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <ErrorMessage error={error} onClose={() => setError(null)} />
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search medicines..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Stock Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Status
              </label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">All Stock</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock (≤10)</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing {filteredMedicines.length} of {medicines?.length || 0} medicines
              </div>
            </div>
          </div>
        </div>

        {/* Medicines Grid */}
        {filteredMedicines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedicines.map(medicine => (
              <MedicineCard
                key={medicine.id}
                medicine={medicine}
                onEdit={handleEdit}
                onDelete={handleDeleteMedicine}
                onUpdateStock={handleStockUpdate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="material-icons text-6xl text-gray-300 mb-4">medication</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No medicines found</h3>
            <p className="text-gray-600 mb-6">
              {(medicines?.length || 0) === 0 
                ? "Start by adding your first medicine to the inventory"
                : "Try adjusting your search filters"
              }
            </p>
            {(medicines?.length || 0) === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Add Your First Medicine
              </button>
            )}
          </div>
        )}

        {/* Medicine Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-4 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <MedicineForm
                medicine={editingMedicine}
                onSubmit={editingMedicine ? handleEditMedicine : handleAddMedicine}
                onCancel={handleFormCancel}
                loading={formLoading}
              />
            </div>
          </div>
        )}

        {/* Stock Update Modal */}
        {showStockModal && selectedMedicine && (
          <StockUpdateModal
            medicine={selectedMedicine}
            isOpen={showStockModal}
            onClose={handleStockModalClose}
            onUpdate={handleUpdateStock}
            loading={stockLoading}
          />
        )}
      </div>
    </div>
  );
}
