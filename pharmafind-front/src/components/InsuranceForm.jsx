import React, { useState, useEffect } from 'react';

/**
 * InsuranceForm Component
 * 
 * Form for adding and editing patient insurance information
 * Handles validation and form submission
 * 
 * @param {Object} insurance - Insurance data for editing (null for new insurance)
 * @param {Array} availableInsurances - List of available insurance providers
 * @param {Function} onSubmit - Callback function when form is submitted
 * @param {Function} onCancel - Callback function when form is cancelled
 * @param {Boolean} loading - Whether form is in loading state
 * @returns {JSX.Element} Insurance form component
 */
export default function InsuranceForm({ 
  insurance = null, 
  availableInsurances = [],
  onSubmit, 
  onCancel, 
  loading = false 
}) {
  const [formData, setFormData] = useState({
    insurance_id: '',
    policy_number: '',
    member_id: '',
    coverage_start_date: '',
    coverage_end_date: '',
    is_active: true,
    notes: ''
  });

  const [errors, setErrors] = useState({});

  // Populate form with insurance data when editing
  useEffect(() => {
    if (insurance) {
      setFormData({
        insurance_id: insurance.id || '',
        policy_number: insurance.pivot?.policy_number || '',
        member_id: insurance.pivot?.member_id || '',
        coverage_start_date: insurance.pivot?.coverage_start_date || '',
        coverage_end_date: insurance.pivot?.coverage_end_date || '',
        is_active: insurance.pivot?.is_active !== undefined ? insurance.pivot.is_active : true,
        notes: insurance.pivot?.notes || ''
      });
    }
  }, [insurance]);

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

    if (!formData.insurance_id) {
      newErrors.insurance_id = 'Please select an insurance provider';
    }

    if (formData.coverage_start_date && formData.coverage_end_date) {
      const startDate = new Date(formData.coverage_start_date);
      const endDate = new Date(formData.coverage_end_date);
      
      if (endDate <= startDate) {
        newErrors.coverage_end_date = 'End date must be after start date';
      }
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {insurance ? 'Edit Insurance' : 'Add Insurance'}
        </h2>
        <p className="text-gray-600 mt-1">
          {insurance ? 'Update your insurance information' : 'Add a new insurance provider to your profile'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Insurance Provider */}
        <div>
          <label htmlFor="insurance_id" className="block text-sm font-medium text-gray-700 mb-2">
            Insurance Provider *
          </label>
          <select
            id="insurance_id"
            name="insurance_id"
            value={formData.insurance_id}
            onChange={handleChange}
            disabled={!!insurance} // Disable when editing
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
              errors.insurance_id ? 'border-red-300' : 'border-gray-300'
            } ${insurance ? 'bg-gray-100' : ''}`}
          >
            <option value="">Select Insurance Provider</option>
            {availableInsurances.map(ins => (
              <option key={ins.id} value={ins.id}>{ins.name}</option>
            ))}
          </select>
          {errors.insurance_id && (
            <p className="mt-1 text-sm text-red-600">{errors.insurance_id}</p>
          )}
          {insurance && (
            <p className="mt-1 text-sm text-gray-500">
              Insurance provider cannot be changed after registration
            </p>
          )}
        </div>

        {/* Policy Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Policy Number */}
          <div>
            <label htmlFor="policy_number" className="block text-sm font-medium text-gray-700 mb-2">
              Policy Number
            </label>
            <input
              type="text"
              id="policy_number"
              name="policy_number"
              value={formData.policy_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Enter policy number"
            />
          </div>

          {/* Member ID */}
          <div>
            <label htmlFor="member_id" className="block text-sm font-medium text-gray-700 mb-2">
              Member ID
            </label>
            <input
              type="text"
              id="member_id"
              name="member_id"
              value={formData.member_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Enter member ID"
            />
          </div>
        </div>

        {/* Coverage Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coverage Start Date */}
          <div>
            <label htmlFor="coverage_start_date" className="block text-sm font-medium text-gray-700 mb-2">
              Coverage Start Date
            </label>
            <input
              type="date"
              id="coverage_start_date"
              name="coverage_start_date"
              value={formData.coverage_start_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Coverage End Date */}
          <div>
            <label htmlFor="coverage_end_date" className="block text-sm font-medium text-gray-700 mb-2">
              Coverage End Date
            </label>
            <input
              type="date"
              id="coverage_end_date"
              name="coverage_end_date"
              value={formData.coverage_end_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                errors.coverage_end_date ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.coverage_end_date && (
              <p className="mt-1 text-sm text-red-600">{errors.coverage_end_date}</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="Additional notes about this insurance..."
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
            This insurance is currently active
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
            {insurance ? 'Update Insurance' : 'Add Insurance'}
          </button>
        </div>
      </form>
    </div>
  );
}









