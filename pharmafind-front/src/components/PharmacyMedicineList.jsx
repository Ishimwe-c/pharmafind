import React, { useState, useEffect } from 'react';
import { medicineService } from '../services/medicineService';

/**
 * PharmacyMedicineList Component
 * 
 * Displays medicines available at a specific pharmacy
 * Includes search, filter by category, and availability indicators
 * 
 * @param {number} pharmacyId - ID of the pharmacy
 * @param {boolean} isOpen - Whether the pharmacy is currently open
 */
const PharmacyMedicineList = ({ pharmacyId, isOpen = true }) => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  // Load medicines
  useEffect(() => {
    if (pharmacyId) {
      loadMedicines();
      loadCategories();
    }
  }, [pharmacyId, selectedCategory, showInStockOnly]);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        pharmacy_id: pharmacyId,
        in_stock: showInStockOnly ? 'true' : undefined,
        category: selectedCategory || undefined
      };
      
      const response = await medicineService.getMedicines(params);
      
      if (response && response.success && response.data) {
        // Handle paginated response
        const medicineData = response.data.data || response.data;
        setMedicines(Array.isArray(medicineData) ? medicineData : []);
      } else {
        setMedicines([]);
      }
    } catch (err) {
      console.error('Error loading medicines:', err);
      setError('Failed to load medicines');
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await medicineService.getCategories();
      if (response && response.success && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  // Filter medicines based on search term
  const filteredMedicines = medicines.filter(medicine => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (medicine.name && medicine.name.toLowerCase().includes(term)) ||
      (medicine.medicine_name && medicine.medicine_name.toLowerCase().includes(term)) ||
      (medicine.description && medicine.description.toLowerCase().includes(term)) ||
      (medicine.manufacturer && medicine.manufacturer.toLowerCase().includes(term))
    );
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setShowInStockOnly(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
        <p className="text-gray-600">Loading medicines...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <span className="material-icons text-red-500 text-4xl mb-2">error_outline</span>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            type="text"
            placeholder="Search medicines by name, description, or manufacturer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* In Stock Filter */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInStockOnly}
              onChange={(e) => setShowInStockOnly(e.target.checked)}
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700">In Stock Only</span>
          </label>

          {/* Clear Filters */}
          {(searchTerm || selectedCategory || showInStockOnly) && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center"
            >
              <span className="material-icons text-sm mr-1">clear</span>
              Clear Filters
            </button>
          )}

          {/* Results Count */}
          <span className="text-sm text-gray-600 ml-auto">
            {filteredMedicines.length} medicine{filteredMedicines.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {/* Pharmacy Status Notice */}
      {!isOpen && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
          <span className="material-icons text-yellow-600 mr-3">info</span>
          <div>
            <p className="text-yellow-800 font-medium">Pharmacy Currently Closed</p>
            <p className="text-yellow-700 text-sm">The pharmacy is currently closed. You can browse available medicines, but purchases can only be made during operating hours.</p>
          </div>
        </div>
      )}

      {/* Medicines Grid */}
      {filteredMedicines.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-icons text-gray-400 text-6xl mb-4">medication</span>
          <p className="text-gray-600 text-lg mb-2">No medicines found</p>
          <p className="text-gray-500 text-sm">
            {searchTerm || selectedCategory || showInStockOnly
              ? 'Try adjusting your filters'
              : 'This pharmacy has not added any medicines yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedicines.map((medicine) => (
            <MedicineCard key={medicine.id} medicine={medicine} />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * MedicineCard Component
 * 
 * Individual medicine card showing details
 */
const MedicineCard = ({ medicine }) => {
  const isInStock = medicine.stock_quantity > 0;
  const isLowStock = medicine.stock_quantity > 0 && medicine.stock_quantity <= 10;
  const medicineName = medicine.name || medicine.medicine_name || 'Unnamed Medicine';
  const price = medicine.price || medicine.unit_price || 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header with name and availability */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-1">
            {medicineName}
          </h3>
          {medicine.category && (
            <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              {medicine.category}
            </span>
          )}
        </div>
        
        {/* Availability Badge */}
        <div className="ml-2">
          {isInStock ? (
            <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
              isLowStock 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-1 ${
                isLowStock ? 'bg-yellow-500' : 'bg-green-500'
              }`}></span>
              {isLowStock ? 'Low Stock' : 'In Stock'}
            </span>
          ) : (
            <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-800">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
              Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Medicine Details */}
      <div className="space-y-2 mb-3">
        {medicine.manufacturer && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="material-icons text-sm mr-2">business</span>
            <span>{medicine.manufacturer}</span>
          </div>
        )}
        
        {(medicine.dosage_form || medicine.strength) && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="material-icons text-sm mr-2">medication</span>
            <span>
              {medicine.dosage_form && medicine.strength 
                ? `${medicine.dosage_form} - ${medicine.strength}`
                : medicine.dosage_form || medicine.strength}
            </span>
          </div>
        )}

        {medicine.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {medicine.description}
          </p>
        )}
      </div>

      {/* Footer with price and stock */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">Price</p>
          <p className="text-lg font-bold text-teal-600">
            {price > 0 ? `$${parseFloat(price).toFixed(2)}` : 'Contact pharmacy'}
          </p>
        </div>
        
        {isInStock && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Available</p>
            <p className={`text-sm font-semibold ${
              isLowStock ? 'text-yellow-600' : 'text-gray-900'
            }`}>
              {medicine.stock_quantity} units
            </p>
          </div>
        )}
      </div>

      {/* Prescription Required Badge */}
      {medicine.requires_prescription && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="inline-flex items-center text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded">
            <span className="material-icons text-xs mr-1">assignment</span>
            Prescription Required
          </span>
        </div>
      )}
    </div>
  );
};

export default PharmacyMedicineList;





