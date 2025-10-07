// src/pages/pharmacy/AcceptedInsurances.jsx
// This component allows pharmacy owners to manage their accepted insurance providers
// It loads current insurances, allows adding/removing, and saves changes to the backend

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext"; // For authentication token
import axiosClient from "../../axios-client"; // For API calls with automatic token handling

export default function AcceptedInsurances() {
  // Get authentication token from context
  const { token } = useAuth();

  // State management for insurances and UI
  const [insurances, setInsurances] = useState([]);           // Current accepted insurances
  const [availableInsurances, setAvailableInsurances] = useState([]); // All available insurances from DB
  const [selectedInsurances, setSelectedInsurances] = useState([]);   // Newly selected insurances to add
  const [showCustomInput, setShowCustomInput] = useState(false);      // Toggle for custom insurance input
  const [customInsurance, setCustomInsurance] = useState("");        // Custom insurance name input
  const [loading, setLoading] = useState(false);              // Loading state during save
  const [initialLoading, setInitialLoading] = useState(true); // Loading state while fetching data
  const [message, setMessage] = useState(null);               // Success message
  const [error, setError] = useState(null);                   // Error message

  // Load current pharmacy insurances and available insurances when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current pharmacy data which includes insurances
        const pharmacyRes = await axiosClient.get("/pharmacy/my-pharmacy");
        const pharmacy = pharmacyRes.data;
        
        // Extract insurances from pharmacy data
        setInsurances(pharmacy.insurances || []);
        
        // Fetch all available insurances from database
        const insurancesRes = await axiosClient.get("/insurances");
        const allInsurances = insurancesRes.data;
        
        // Filter out insurances that are already accepted by this pharmacy
        const availableOptions = allInsurances.filter(
          insurance => !pharmacy.insurances?.includes(insurance.name)
        );
        
        setAvailableInsurances(availableOptions);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load insurance data");
      } finally {
        setInitialLoading(false);
      }
    };

    // Only fetch data if we have a valid authentication token
    if (token) {
      fetchData();
    } else {
      setInitialLoading(false);
    }
  }, [token]);

  // Handle adding selected insurances to the accepted list
  const handleAdd = () => {
    // Validation: check if any insurances are selected
    if (selectedInsurances.length === 0) {
      setError("Please select at least one insurance to add");
      return;
    }
    
    // Add selected insurances to accepted list
    const newInsurances = selectedInsurances.map(id => {
      const insurance = availableInsurances.find(ins => ins.id === id);
      return insurance.name;
    });
    
    // Add to local state
    setInsurances([...insurances, ...newInsurances]);
    
    // Remove added insurances from available options
    setAvailableInsurances(availableInsurances.filter(
      insurance => !selectedInsurances.includes(insurance.id)
    ));
    
    // Clear selection and any errors
    setSelectedInsurances([]);
    setError(null);
    
    // Show success message
    setMessage(`${newInsurances.length} insurance${newInsurances.length === 1 ? '' : 's'} added successfully!`);
    setTimeout(() => setMessage(null), 3000);
  };

  // Handle removing insurance from the accepted list
  const handleRemove = (insurance) => {
    // Confirm deletion with user
    if (window.confirm(`Are you sure you want to remove "${insurance}" from your accepted insurances?`)) {
      // Remove from accepted list
      setInsurances(insurances.filter((i) => i !== insurance));
      
      // Add back to available options (find the insurance object)
      const insuranceObj = availableInsurances.find(ins => ins.name === insurance) || { id: Date.now(), name: insurance };
      setAvailableInsurances([...availableInsurances, insuranceObj]);
      
      setMessage(`"${insurance}" removed from accepted insurances`);
      setError(null); // Clear any previous errors
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Handle multi-select changes for available insurances
  const handleSelectionChange = (event) => {
    const values = Array.from(event.target.selectedOptions, option => parseInt(option.value));
    setSelectedInsurances(values);
  };

  // Handle adding custom insurance
  const handleAddCustom = () => {
    const trimmedInsurance = customInsurance.trim();
    
    // Validation: check if insurance name is provided
    if (!trimmedInsurance) {
      setError("Please enter an insurance name");
      return;
    }
    
    // Validation: check if insurance already exists (case-insensitive)
    if (insurances.some(ins => ins.toLowerCase() === trimmedInsurance.toLowerCase())) {
      setError("This insurance is already in your list");
      return;
    }
    
    // Validation: check if insurance name is too long
    if (trimmedInsurance.length > 50) {
      setError("Insurance name is too long (max 50 characters)");
      return;
    }
    
    // Add to local state and clear input
    setInsurances([...insurances, trimmedInsurance]);
    setCustomInsurance("");
    setShowCustomInput(false);
    setError(null);
    
    // Show success message
    setMessage(`"${trimmedInsurance}" added successfully!`);
    setTimeout(() => setMessage(null), 3000);
  };

  // Save insurance changes to the backend
  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Get the current pharmacy ID first
      const pharmacyRes = await axiosClient.get("/pharmacy/my-pharmacy");
      const pharmacyId = pharmacyRes.data.id;
      
      // Update the pharmacy with new insurance list
      // The backend expects the field name 'insurances'
      const res = await axiosClient.put(`/pharmacy/${pharmacyId}`, {
        insurances: insurances
      });
      
      setMessage("Insurance list updated successfully!");
      console.log("Updated insurances:", res.data);
      
      // Refresh available insurances after successful save
      await refreshAvailableInsurances();
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      console.error("Error saving insurances:", err);
      setError(err.response?.data?.message || "Failed to save insurance changes");
    } finally {
      setLoading(false);
    }
  };

  // Refresh available insurances list
  const refreshAvailableInsurances = async () => {
    try {
      const insurancesRes = await axiosClient.get("/insurances");
      const allInsurances = insurancesRes.data;
      
      // Filter out insurances that are already accepted by this pharmacy
      const availableOptions = allInsurances.filter(
        insurance => !insurances.includes(insurance.name)
      );
      
      setAvailableInsurances(availableOptions);
    } catch (err) {
      console.error("Error refreshing available insurances:", err);
    }
  };

  // Show loading skeleton while fetching initial data
  if (initialLoading) {
    return (
      <div className="p-10 flex-1">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 flex-1">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Accepted Insurances
            </h2>
            <p className="text-gray-600 mt-1">
              {insurances.length === 0 
                ? "No insurance providers added yet" 
                : `${insurances.length} insurance provider${insurances.length === 1 ? '' : 's'} accepted`
              }
            </p>
          </div>
          
          {/* Quick stats */}
          {insurances.length > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{insurances.length}</div>
              <div className="text-sm text-gray-500">Total Accepted</div>
            </div>
          )}
        </div>

        {/* List of accepted insurances */}
        <div className="space-y-4">
          {insurances.length > 0 ? (
            insurances.map((insurance, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-blue-50 border border-blue-200 p-4 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <span className="material-icons text-blue-600">verified</span>
                  <span className="text-lg font-medium text-gray-700">
                    {insurance}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(insurance)}
                  className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                  title={`Remove ${insurance}`}
                >
                  <span className="material-icons">delete</span>
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <span className="material-icons text-4xl text-gray-300 mb-2 block">shield</span>
              <p className="text-lg">No insurances added yet.</p>
              <p className="text-sm mt-1">Add insurance providers that your pharmacy accepts</p>
            </div>
          )}
        </div>

        {/* Add new insurance section */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Add New Insurance</h3>
              <p className="text-sm text-gray-600 mt-1">
                {availableInsurances.length} insurance{availableInsurances.length === 1 ? '' : 's'} available to add
              </p>
            </div>
            <button
              type="button"
              onClick={refreshAvailableInsurances}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Refresh available insurance list"
            >
              <span className="material-icons text-sm mr-1">refresh</span>
              Refresh List
            </button>
          </div>
          
          {availableInsurances.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <span className="material-icons text-blue-600 mr-2 mt-0.5">info</span>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">How to select multiple insurances:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Windows:</strong> Hold Ctrl and click each insurance</li>
                      <li><strong>Mac:</strong> Hold Cmd and click each insurance</li>
                      <li><strong>All:</strong> Click and drag to select a range</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex-grow">
                  <label htmlFor="insurance-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Insurance Providers
                  </label>
                  <select
                    id="insurance-select"
                    multiple
                    value={selectedInsurances}
                    onChange={handleSelectionChange}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition min-h-[120px]"
                    size="5"
                  >
                    {availableInsurances.map((insurance) => (
                      <option key={insurance.id} value={insurance.id} className="py-2">
                        {insurance.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedInsurances.length} insurance{selectedInsurances.length === 1 ? '' : 's'} selected
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={selectedInsurances.length === 0}
                  className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed self-end"
                >
                  <span className="material-icons mr-2">add</span>
                  Add Selected
                </button>
              </div>
              
              {/* Custom insurance input option */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Need to add a custom insurance?</h4>
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(!showCustomInput)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {showCustomInput ? 'Cancel' : 'Add Custom'}
                  </button>
                </div>
                
                {showCustomInput && (
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={customInsurance}
                      onChange={(e) => setCustomInsurance(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
                      placeholder="Enter custom insurance name"
                      className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      maxLength={50}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustom}
                      disabled={!customInsurance.trim()}
                      className="px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Custom
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <span className="material-icons text-3xl text-gray-300 mb-3 block">check_circle</span>
              <p className="text-lg font-medium mb-2">All insurance providers added!</p>
              <p className="text-sm">You've already added all available insurance providers to your accepted list.</p>
              <p className="text-xs mt-2 text-gray-400">New insurance providers may be added by administrators.</p>
            </div>
          )}
        </div>

        {/* Save button - only show if there are changes */}
        {insurances.length > 0 && (
          <div className="mt-12 flex justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={handleSave}
              className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-icons mr-2">save</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}

        {/* Success Message Display */}
        {message && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <span className="material-icons text-green-600 mr-2">check_circle</span>
              <p className="text-green-800 font-medium">{message}</p>
            </div>
          </div>
        )}

        {/* Error Message Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="material-icons text-red-600 mr-2">error</span>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
