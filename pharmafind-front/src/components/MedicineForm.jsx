import React, { useState, useEffect } from 'react';

/**
 * MedicineForm Component
 * 
 * Form for creating and editing medicines
 * Handles validation and form submission
 * 
 * @param {Object} medicine - Medicine data for editing (null for new medicine)
 * @param {Function} onSubmit - Callback function when form is submitted
 * @param {Function} onCancel - Callback function when form is cancelled
 * @param {Boolean} loading - Whether form is in loading state
 * @returns {JSX.Element} Medicine form component
 */
export default function MedicineForm({ 
  medicine = null, 
  onSubmit, 
  onCancel, 
  loading = false 
}) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock_quantity: '',
    category: '',
    description: '',
    manufacturer: '',
    dosage_form: '',
    strength: '',
    requires_prescription: false
  });

  const [errors, setErrors] = useState({});

  // Populate form with medicine data when editing
  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name || '',
        price: medicine.price || '',
        stock_quantity: medicine.stock_quantity || '',
        category: medicine.category || '',
        description: medicine.description || '',
        manufacturer: medicine.manufacturer || '',
        dosage_form: medicine.dosage_form || '',
        strength: medicine.strength || '',
        requires_prescription: medicine.requires_prescription || false
      });
    }
  }, [medicine]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Medicine name is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.stock_quantity || formData.stock_quantity < 0) {
      newErrors.stock_quantity = 'Stock quantity must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const dosageForms = [
    'Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 
    'Drops', 'Inhaler', 'Patch', 'Suppository', 'Gel', 'Lotion'
  ];

  const categories = [
    'Pain Relief', 'Antibiotic', 'Anti-inflammatory', 'Gastrointestinal',
    'Antihistamine', 'Diabetes', 'Cardiovascular', 'Vitamin', 'Cough & Cold',
    'Dermatology', 'Neurology', 'Psychiatry', 'Oncology', 'Other'
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {medicine ? 'Edit Medicine' : 'Add New Medicine'}
        </h2>
        <p className="text-gray-600 mt-1">
          {medicine ? 'Update medicine information' : 'Add a new medicine to your inventory'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Medicine Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Medicine Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Paracetamol 500mg"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Manufacturer */}
          <div>
            <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-2">
              Manufacturer
            </label>
            <input
              type="text"
              id="manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g., PharmaCorp"
            />
          </div>
        </div>

        {/* Price and Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Price (RWF) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="1"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                errors.price ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="500"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>

          {/* Stock Quantity */}
          <div>
            <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity *
            </label>
            <input
              type="number"
              id="stock_quantity"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleChange}
              min="0"
              step="1"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                errors.stock_quantity ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="100"
            />
            {errors.stock_quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.stock_quantity}</p>
            )}
          </div>
        </div>

        {/* Category and Dosage Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Dosage Form */}
          <div>
            <label htmlFor="dosage_form" className="block text-sm font-medium text-gray-700 mb-2">
              Dosage Form
            </label>
            <select
              id="dosage_form"
              name="dosage_form"
              value={formData.dosage_form}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Select Dosage Form</option>
              {dosageForms.map(form => (
                <option key={form} value={form}>{form}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Strength */}
        <div>
          <label htmlFor="strength" className="block text-sm font-medium text-gray-700 mb-2">
            Strength
          </label>
          <input
            type="text"
            id="strength"
            name="strength"
            value={formData.strength}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="e.g., 500mg, 10ml, 100 units/ml"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="Brief description of the medicine..."
          />
        </div>

        {/* Prescription Required */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="requires_prescription"
            name="requires_prescription"
            checked={formData.requires_prescription}
            onChange={handleChange}
            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
          />
          <label htmlFor="requires_prescription" className="ml-2 block text-sm text-gray-700">
            Requires Prescription
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {medicine ? 'Update Medicine' : 'Add Medicine'}
          </button>
        </div>
      </form>
    </div>
  );
}










