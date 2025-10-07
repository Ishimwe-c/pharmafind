// src/pages/pharmacy/PharmacyEditDetails.jsx
// This component allows pharmacy owners to edit their pharmacy details
// It loads current data, validates input, and submits updates to the backend

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext"; // For authentication and user data
import axiosClient from "../../axios-client"; // For API calls with automatic token handling
import ChangePasswordModal from "../../components/ChangePasswordModal";

export default function EditPharmacyDetails() {
  // Get authentication token and user data from context
  const { token, user } = useAuth();

  // Form state - stores the pharmacy details being edited
  // Field names match the backend API expectations
  const [formData, setFormData] = useState({
    pharmacy_name: "",    // Pharmacy business name
    phone_number: "",     // Contact phone number
    location: "",         // Physical address/location
    email: "",            // Business email address
  });

  // UI state management
  const [loading, setLoading] = useState(false);        // Shows loading state during form submission
  const [initialLoading, setInitialLoading] = useState(true); // Shows loading state while fetching initial data
  const [message, setMessage] = useState(null);         // Success message display
  const [error, setError] = useState(null);             // Error message display
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Load current pharmacy data when component mounts
  // This ensures the form is pre-populated with existing data
  useEffect(() => {
    const fetchPharmacyData = async () => {
      try {
        // Fetch current pharmacy details from the API
        const res = await axiosClient.get("/pharmacy/my-pharmacy");
        const pharmacy = res.data;
        
        // Map API response fields to form fields
        // Note: API returns 'name' but form expects 'pharmacy_name'
        // API returns 'address' but form expects 'location'
        setFormData({
          pharmacy_name: pharmacy.name || "",           // Map 'name' to 'pharmacy_name'
          phone_number: pharmacy.phone_number || "",   // Direct mapping
          location: pharmacy.address || "",            // Map 'address' to 'location'
          email: pharmacy.email || "",                 // Direct mapping
        });
      } catch (err) {
        console.error("Error fetching pharmacy data:", err);
        setError("Failed to load pharmacy data");
      } finally {
        // Always stop loading, even if there's an error
        setInitialLoading(false);
      }
    };

    // Only fetch data if we have a valid authentication token
    if (token) {
      fetchPharmacyData();
    } else {
      setInitialLoading(false);
    }
  }, [token]); // Re-run effect if token changes

  // Handle input field changes - updates form state as user types
  const handleChange = (e) => {
    // Use the input's 'name' attribute to dynamically update the correct form field
    // This allows us to use a single handler for all form inputs
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission - validates and sends data to backend
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    
    // Client-side validation: ensure required fields are filled
    if (!formData.pharmacy_name.trim() || !formData.location.trim()) {
      setError("Pharmacy name and location are required");
      return; // Stop submission if validation fails
    }
    
    // Set loading state and clear previous messages
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Step 1: Get the current pharmacy ID from the API
      // We need this because the update endpoint requires the pharmacy ID
      const pharmacyRes = await axiosClient.get("/pharmacy/my-pharmacy");
      const pharmacyId = pharmacyRes.data.id;
      
      // Step 2: Send the updated data to the backend
      // Using PUT method to update existing pharmacy record
      const res = await axiosClient.put(`/pharmacy/${pharmacyId}`, formData);
      
      // Show success message and log the response
      setMessage("Pharmacy details updated successfully!");
      console.log("Updated pharmacy:", res.data);
    } catch (err) {
      // Handle any errors that occur during the update process
      console.error("Error updating pharmacy:", err);
      // Try to get error message from backend response, fallback to generic message
      setError(err.response?.data?.message || "Failed to update pharmacy details");
    } finally {
      // Always stop loading state, regardless of success or failure
      setLoading(false);
    }
  };

  // Show loading skeleton while fetching initial pharmacy data
  // This provides better UX by showing the user that something is happening
  if (initialLoading) {
    return (
      <div className="flex-1 p-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          {/* Animated loading skeleton using Tailwind's animate-pulse */}
          <div className="animate-pulse space-y-6">
            {/* Title skeleton */}
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            {/* Form fields skeleton - 2x2 grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  {/* Label skeleton */}
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  {/* Input field skeleton */}
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main component render - shows the edit form
  return (
    <div className="p-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Edit Pharmacy Details
            </h1>
            <p className="text-gray-600 text-lg">
              Update your pharmacy information and contact details
            </p>
          </div>
          <button
            type="button"
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 flex items-center transition-colors"
            onClick={() => setShowChangePasswordModal(true)}
          >
            <span className="material-icons mr-2">lock</span>
            Change Password
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        {/* Form header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Pharmacy Information
          </h2>
          <p className="text-gray-600">
            Keep your pharmacy details up to date for better customer experience
          </p>
        </div>

        {/* Main form for editing pharmacy details */}
        <form onSubmit={handleSubmit}>
          {/* Form fields arranged in a responsive 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pharmacy Name Field - Required */}
            <div>
              <label
                htmlFor="pharmacy_name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Pharmacy Name
              </label>
              <input
                type="text"
                id="pharmacy_name"
                name="pharmacy_name" // Must match the state field name
                value={formData.pharmacy_name} // Controlled input - value from state
                onChange={handleChange} // Update state when user types
                placeholder="Enter pharmacy name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required // HTML5 validation - prevents submission if empty
              />
            </div>

            {/* Phone Number Field - Required */}
            <div>
              <label
                htmlFor="phone_number"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number
              </label>
              <input
                type="tel" // HTML5 telephone input type for better mobile UX
                id="phone_number"
                name="phone_number" // Must match the state field name
                value={formData.phone_number} // Controlled input - value from state
                onChange={handleChange} // Update state when user types
                placeholder="Enter phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required // HTML5 validation - prevents submission if empty
              />
            </div>

            {/* Location Field - Required */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location" // Must match the state field name
                value={formData.location} // Controlled input - value from state
                onChange={handleChange} // Update state when user types
                placeholder="Enter location"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                // Note: Not required in HTML but validated in handleSubmit
              />
            </div>

            {/* Email Field - Optional */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="email" // HTML5 email input type with built-in validation
                id="email"
                name="email" // Must match the state field name
                value={formData.email} // Controlled input - value from state
                onChange={handleChange} // Update state when user types
                placeholder="Enter email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                // Note: Optional field - user can leave empty
              />
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="mt-12 flex justify-end space-x-4">
            {/* Cancel Button - Goes back to previous page */}
            <button
              type="button" // Prevents form submission
              onClick={() => window.history.back()} // Navigate back in browser history
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200"
            >
              Cancel
            </button>
            
            {/* Submit Button - Sends form data to backend */}
            <button
              type="submit" // Triggers form submission
              disabled={loading} // Disable button while submitting to prevent double-clicks
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-bold py-3 px-8 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center transition-colors duration-200"
            >
              {loading ? (
                // Show loading spinner and "Saving..." text while submitting
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                // Show save icon and "Save Changes" text when not loading
                <>
                  <span className="material-icons mr-2">save</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>

        {/* Success Message Display */}
        {/* Shows when pharmacy details are successfully updated */}
        {message && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <span className="material-icons text-green-600 mr-2">check_circle</span>
              <p className="text-green-800 font-medium">{message}</p>
            </div>
          </div>
        )}

        {/* Error Message Display */}
        {/* Shows when there's an error during update or data loading */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="material-icons text-red-600 mr-2">error</span>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </div>
  );
}
