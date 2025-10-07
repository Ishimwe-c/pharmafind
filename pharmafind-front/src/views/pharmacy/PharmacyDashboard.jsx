// src/pages/pharmacy/PharmacyDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PharmacyCard from "../../components/PharmacyCard";
import WorkingHoursTable from "../../components/WorkingHoursTable";
import { useAuth } from "../../context/AuthContext";
import axiosClient from "../../axios-client";

// Import new UX components for better user experience
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import SuccessMessage from "../../components/SuccessMessage";
import { useToast } from "../../context/ToastContext";

/**
 * PharmacyDashboard Component
 * 
 * Main dashboard for pharmacy owners to view and manage their pharmacy
 * Enhanced with better UX including loading states, error handling, and toast notifications
 * 
 * @returns {JSX.Element} Pharmacy dashboard component
 */
export default function PharmacyDashboard() {
  // Authentication hook
  const { token, user } = useAuth();
  
  // Navigation hook for navigating to different pages
  const navigate = useNavigate();
  
  // Toast notification hook for user feedback
  const { addToast } = useToast();
  
  // State management for component data
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);


  // Fetch pharmacy data on component mount
  useEffect(() => {
    if (token) {
      fetchPharmacy();
    } else {
      setLoading(false);
    }
  }, [token, user?.id]);

  /**
   * Fetch pharmacy data from API with enhanced error handling
   * Includes user feedback and better error messages
   */
  const fetchPharmacy = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching pharmacy data for user:", user?.id);
      console.log("Token available:", !!token);
      
      const res = await axiosClient.get("/pharmacy/my-pharmacy");
      
      console.log("Pharmacy fetch response:", res);
      console.log("Pharmacy data received", res.data);
      
      setPharmacy(res.data);
      
      // // Show success message
      // setSuccess("Pharmacy data loaded successfully");
      // addToast("Pharmacy data loaded successfully", 'success');
      
    } catch (err) {
      console.error("Pharmacy fetch error:", err);
      console.error("Error response:", err.response);
      console.error("Error request:", err.request);
      
      let errorMessage = "Failed to fetch pharmacy data";
      
      if (err.response) {
        // Server responded with error status
        errorMessage = `Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`;
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = "No response from server. Please check if the backend is running.";
      } else {
        // Something else happened
        errorMessage = err.message || "Failed to fetch pharmacy data";
      }
      
      setError(errorMessage);
      addToast(errorMessage, 'error');
      
    } finally {
      setLoading(false);
    }
  };

  /**
   * Retry function for failed requests
   */
  const handleRetry = () => {
    fetchPharmacy();
  };
  // Show loading screen if data is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner size="lg" text="Loading your pharmacy dashboard..." />
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center">
              <span className="material-icons text-6xl text-red-300 mb-4">error</span>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Dashboard</h3>
              <ErrorMessage error={error} />
              <button
                onClick={handleRetry}
                className="mt-6 bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors flex items-center mx-auto"
              >
                <span className="material-icons mr-2">refresh</span>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no pharmacy found
  if (!pharmacy) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center">
              <span className="material-icons text-6xl text-yellow-300 mb-4">local_pharmacy</span>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Pharmacy Found</h3>
              <p className="text-gray-600 mb-6">
                Please complete your pharmacy registration to view the dashboard.
              </p>
              <button
                onClick={() => addToast('Redirecting to registration...', 'info')}
                className="bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors"
              >
                Complete Registration
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header with enhanced styling */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Welcome, {pharmacy?.pharmacy_name || 'Pharmacy Owner'}!
              </h1>
              <p className="text-gray-600 text-lg">
                Here's an overview of your pharmacy operations
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Today</div>
              <div className="text-lg font-semibold text-gray-700">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Messages Section */}
        <ErrorMessage error={error} onClose={() => setError(null)} />
        <SuccessMessage message={success} onClose={() => setSuccess(null)} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pharmacy Information Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Pharmacy Information</h2>
              <button 
                onClick={() => navigate('/pharmacy/edit-details')}
                className="text-teal-500 hover:text-teal-700 font-medium text-sm flex items-center"
              >
                <span className="material-icons text-sm mr-1">edit</span>
                Edit
              </button>
            </div>
            
            <PharmacyCard
              name={pharmacy.pharmacy_name || pharmacy.name}
              location={pharmacy.location || pharmacy.address}
              insurances={pharmacy.insurances || []}
              isOpen={pharmacy.is_open}
            />
          </div>

          {/* Working Hours Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Working Hours</h2>
              <button 
                onClick={() => navigate('/pharmacy/working-hours')}
                className="text-teal-500 hover:text-teal-700 font-medium text-sm flex items-center"
              >
                <span className="material-icons text-sm mr-1">edit</span>
                Edit
              </button>
            </div>
            
            <WorkingHoursTable hours={pharmacy.working_hours || []} />
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/pharmacy/edit-details')}
              className="p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors text-left"
            >
              <span className="material-icons text-teal-500 mb-2">edit</span>
              <h3 className="font-medium text-gray-900">Edit Details</h3>
              <p className="text-sm text-gray-600">Update pharmacy information</p>
            </button>
            
            <button 
              onClick={() => navigate('/pharmacy/working-hours')}
              className="p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors text-left"
            >
              <span className="material-icons text-teal-500 mb-2">schedule</span>
              <h3 className="font-medium text-gray-900">Working Hours</h3>
              <p className="text-sm text-gray-600">Set operating hours</p>
            </button>
            
            <button 
              onClick={() => navigate('/pharmacy/insurances')}
              className="p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors text-left"
            >
              <span className="material-icons text-teal-500 mb-2">verified</span>
              <h3 className="font-medium text-gray-900">Insurances</h3>
              <p className="text-sm text-gray-600">Manage accepted insurances</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
