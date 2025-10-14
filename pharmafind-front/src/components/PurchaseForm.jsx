import React, { useState, useEffect } from 'react';
import { purchaseService } from '../services/purchaseService';
import { medicineService } from '../services/medicineService';
import { userService } from '../services/userService';
import { insuranceService } from '../services/insuranceService';

/**
 * PurchaseForm Component
 * 
 * A comprehensive form for pharmacy staff to record patient purchases
 * Handles medicine selection, quantity, pricing, insurance coverage, and payment
 * 
 * @param {Function} onSuccess - Callback when purchase is created successfully
 * @param {Function} onCancel - Callback when form is cancelled
 * @param {Object} initialData - Initial data for editing existing purchase
 * @returns {JSX.Element} Purchase form component
 */
export default function PurchaseForm({ onSuccess, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({
    pharmacy_id: '',
    user_id: '',
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    insurance_id: '',
    payment_method: 'cash',
    payment_status: 'paid',
    notes: '',
    purchase_items: []
  });

  const [medicines, setMedicines] = useState([]);
  const [insurances, setInsurances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Get current user to determine pharmacy
      const userResponse = await userService.getCurrentUser();
      console.log('User response:', userResponse); // Debug log
      
      if (userResponse) {
        setCurrentUser(userResponse);
        console.log('User role:', userResponse.role); // Debug log
        
        if (userResponse.role === 'pharmacy' || userResponse.role === 'pharmacy_owner') {
          console.log('User pharmacy:', userResponse.pharmacy); // Debug log
          console.log('User pharmacy ID:', userResponse.pharmacy?.id); // Debug log
          
          // Set pharmacy_id from current user's pharmacy
          if (userResponse.pharmacy) {
            setFormData(prev => ({
              ...prev,
              pharmacy_id: userResponse.pharmacy.id
            }));
            
            // Load pharmacy's medicines
            try {
              const medicinesResponse = await medicineService.getMedicines({ pharmacy_id: userResponse.pharmacy.id });
              console.log('Medicines response:', medicinesResponse); // Debug log
              console.log('Medicines response.data:', medicinesResponse.data); // Debug log
              console.log('Medicines response.data.data:', medicinesResponse.data?.data); // Debug log
              
              if (medicinesResponse && medicinesResponse.success && medicinesResponse.data) {
                // Handle paginated response - medicines are in data.data
                if (medicinesResponse.data.data && Array.isArray(medicinesResponse.data.data)) {
                  console.log('Setting medicines from paginated response:', medicinesResponse.data.data.length);
                  setMedicines(medicinesResponse.data.data);
                } else if (Array.isArray(medicinesResponse.data)) {
                  console.log('Setting medicines from direct array:', medicinesResponse.data.length);
                  setMedicines(medicinesResponse.data);
                } else {
                  console.warn('Unexpected medicines data structure:', medicinesResponse.data);
                  setMedicines([]);
                }
              } else {
                console.warn('Unexpected medicines response structure:', medicinesResponse);
                setMedicines([]);
              }
            } catch (error) {
              console.error('Error loading medicines:', error);
              setMedicines([]);
            }
          } else {
            console.warn('User does not have a pharmacy associated');
            setErrors({ general: 'No pharmacy associated with this user. Please contact admin.' });
          }
        }
      } else {
        console.error('Invalid user response structure:', userResponse);
        setErrors({ general: 'Failed to load user information' });
      }

      // Skip patient loading - we'll use manual entry instead

      // Load insurances
      try {
        const insurancesResponse = await insuranceService.getInsurances();
        console.log('Insurances response:', insurancesResponse); // Debug log
        if (insurancesResponse && Array.isArray(insurancesResponse)) {
          setInsurances(insurancesResponse);
        } else if (insurancesResponse && insurancesResponse.data && Array.isArray(insurancesResponse.data)) {
          setInsurances(insurancesResponse.data);
        } else {
          console.warn('Unexpected insurance response structure:', insurancesResponse);
          setInsurances([]);
        }
      } catch (error) {
        console.error('Error loading insurances:', error);
        setInsurances([]);
      }

      // If editing existing purchase, load its data
      if (initialData) {
        setFormData({
          pharmacy_id: initialData.pharmacy_id,
          user_id: initialData.user_id,
          patient_name: initialData.user?.name || '',
          patient_email: initialData.user?.email || '',
          patient_phone: initialData.user?.phone_number || '',
          insurance_id: initialData.insurance_id || '',
          payment_method: initialData.payment_method,
          payment_status: initialData.payment_status,
          notes: initialData.notes || '',
          purchase_items: initialData.purchase_items || []
        });
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
      setErrors({ general: 'Failed to load form data' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const addPurchaseItem = () => {
    setFormData(prev => ({
      ...prev,
      purchase_items: [
        ...prev.purchase_items,
        {
          medicine_id: '',
          quantity: 1,
          unit_price: 0,
          notes: ''
        }
      ]
    }));
  };

  const removePurchaseItem = (index) => {
    setFormData(prev => ({
      ...prev,
      purchase_items: prev.purchase_items.filter((_, i) => i !== index)
    }));
  };

  const updatePurchaseItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      purchase_items: prev.purchase_items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateItemTotal = (item) => {
    return (item.quantity || 0) * (item.unit_price || 0);
  };

  const calculateTotalAmount = () => {
    return formData.purchase_items.reduce((total, item) => {
      return total + calculateItemTotal(item);
    }, 0);
  };

  const calculateInsuranceCoverage = () => {
    if (!formData.insurance_id) return 0;
    
    const selectedInsurance = insurances.find(ins => ins.id == formData.insurance_id);
    if (!selectedInsurance) return 0;
    
    // This would need to be calculated based on the pharmacy-insurance relationship
    // For now, we'll use a default coverage percentage
    const coveragePercentage = 80; // This should come from the insurance-pharmacy relationship
    return calculateTotalAmount() * (coveragePercentage / 100);
  };

  const calculatePatientPayment = () => {
    return calculateTotalAmount() - calculateInsuranceCoverage();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.pharmacy_id) {
      newErrors.pharmacy_id = 'Pharmacy is required';
    }

    if (!formData.patient_name) {
      newErrors.patient_name = 'Patient name is required';
    }

    if (formData.purchase_items.length === 0) {
      newErrors.purchase_items = 'At least one medicine is required';
    }

    formData.purchase_items.forEach((item, index) => {
      if (!item.medicine_id) {
        newErrors[`purchase_items.${index}.medicine_id`] = 'Medicine is required';
      }
      if (!item.quantity || item.quantity < 1) {
        newErrors[`purchase_items.${index}.quantity`] = 'Quantity must be at least 1';
      }
      if (!item.unit_price || item.unit_price < 0) {
        newErrors[`purchase_items.${index}.unit_price`] = 'Unit price must be 0 or greater';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const purchaseData = {
        pharmacy_id: formData.pharmacy_id,
        patient_name: formData.patient_name,
        patient_email: formData.patient_email,
        patient_phone: formData.patient_phone,
        insurance_id: formData.insurance_id || null,
        payment_method: formData.payment_method,
        payment_status: formData.payment_status,
        notes: formData.notes,
        purchase_items: formData.purchase_items.map(item => ({
          ...item,
          quantity: parseInt(item.quantity),
          unit_price: parseFloat(item.unit_price)
        }))
      };

      let response;
      if (initialData) {
        response = await purchaseService.updatePurchase(initialData.id, purchaseData);
      } else {
        response = await purchaseService.createPurchase(purchaseData);
      }

      if (response.success) {
        onSuccess(response.data);
      } else {
        setErrors({ general: response.message || 'Failed to save purchase' });
      }

    } catch (error) {
      console.error('Error saving purchase:', error);
      setErrors({ 
        general: error.response?.data?.message || 'Failed to save purchase' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !initialData) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {initialData ? 'Edit Purchase' : 'New Purchase'}
        </h2>
        <p className="text-gray-600 mt-1">
          {initialData ? 'Update purchase details' : 'Record a new patient purchase'}
        </p>
      </div>

      {errors.general && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient Name *
            </label>
            <input
              type="text"
              value={formData.patient_name}
              onChange={(e) => handleInputChange('patient_name', e.target.value)}
              placeholder="Enter patient name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.patient_name && (
              <p className="text-red-500 text-sm mt-1">{errors.patient_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient Email
            </label>
            <input
              type="email"
              value={formData.patient_email}
              onChange={(e) => handleInputChange('patient_email', e.target.value)}
              placeholder="Enter patient email (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient Phone
            </label>
            <input
              type="tel"
              value={formData.patient_phone}
              onChange={(e) => handleInputChange('patient_phone', e.target.value)}
              placeholder="Enter patient phone (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Insurance
            </label>
            <select
              value={formData.insurance_id}
              onChange={(e) => handleInputChange('insurance_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No Insurance</option>
              {insurances.map(insurance => (
                <option key={insurance.id} value={insurance.id}>
                  {insurance.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payment Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) => handleInputChange('payment_method', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="insurance">Insurance</option>
              <option value="mixed">Mixed (Cash + Insurance)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status *
            </label>
            <select
              value={formData.payment_status}
              onChange={(e) => handleInputChange('payment_status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Purchase Items */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Medicines</h3>
            <button
              type="button"
              onClick={addPurchaseItem}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Medicine
            </button>
          </div>

          {formData.purchase_items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No medicines added yet. Click "Add Medicine" to start.</p>
              {medicines.length === 0 && (
                <p className="text-sm text-red-500 mt-2">
                  No medicines are available. Please add medicines to your pharmacy first.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {formData.purchase_items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium text-gray-900">Medicine #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removePurchaseItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medicine *
                      </label>
                      <select
                        value={item.medicine_id}
                        onChange={(e) => updatePurchaseItem(index, 'medicine_id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={medicines.length === 0}
                      >
                        <option value="">
                          {medicines.length === 0 ? 'No medicines available' : 'Select Medicine'}
                        </option>
                        {medicines.map(medicine => (
                          <option key={medicine.id} value={medicine.id}>
                            {medicine.name} - {medicine.strength} ({medicine.stock_quantity} in stock)
                          </option>
                        ))}
                      </select>
                      {errors[`purchase_items.${index}.medicine_id`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors[`purchase_items.${index}.medicine_id`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updatePurchaseItem(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors[`purchase_items.${index}.quantity`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors[`purchase_items.${index}.quantity`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit Price (RWF) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updatePurchaseItem(index, 'unit_price', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors[`purchase_items.${index}.unit_price`] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors[`purchase_items.${index}.unit_price`]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => updatePurchaseItem(index, 'notes', e.target.value)}
                      placeholder="Optional notes for this medicine"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mt-2 text-right">
                    <span className="text-sm font-medium text-gray-700">
                      Total: RWF {calculateItemTotal(item).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {errors.purchase_items && (
            <p className="text-red-500 text-sm mt-2">{errors.purchase_items}</p>
          )}
        </div>

        {/* Purchase Summary */}
        {formData.purchase_items.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Purchase Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium">RWF {calculateTotalAmount().toLocaleString()}</span>
              </div>
              {formData.insurance_id && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Insurance Coverage:</span>
                    <span className="text-green-600">-RWF {calculateInsuranceCoverage().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <span className="font-medium">Patient Payment:</span>
                    <span className="font-medium">RWF {calculatePatientPayment().toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purchase Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            placeholder="Additional notes about this purchase..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving...' : (initialData ? 'Update Purchase' : 'Create Purchase')}
          </button>
        </div>
      </form>
    </div>
  );
}
