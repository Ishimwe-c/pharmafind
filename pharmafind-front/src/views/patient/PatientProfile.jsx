import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosClient from "../../axios-client";
import ChangePasswordModal from "../../components/ChangePasswordModal";

export default function PatientProfile() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [initialLoading, setInitialLoading] = useState(true);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone_number || "",
        address: user.address || ""
      });
      setInitialLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      setMessage({ type: "error", text: "Name and email are required fields" });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      // Update user profile - use correct endpoint
      const response = await axiosClient.put('/user/profile', {
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone,
        address: formData.address
      });
      
      if (response.data.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        // Update user context with new data
        updateUser(response.data.user);
      } else {
        setMessage({ type: "error", text: response.data.message || "Failed to update profile" });
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Failed to update profile. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone_number || "",
        address: user.address || ""
      });
    }
    setMessage({ type: "", text: "" });
  };

  if (initialLoading) {
    return (
      <div className="p-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Patient Profile
            </h1>
            <p className="text-gray-600 text-lg">
              Manage your personal information
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 flex items-center transition-colors"
              onClick={() => setShowChangePasswordModal(true)}
            >
              <span className="material-icons mr-2">lock</span>
              Change Password
            </button>
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
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        {/* Form header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Personal Information
          </h2>
          <p className="text-gray-600">
            Keep your profile information up to date
          </p>
        </div>

        {/* Success/Error Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              <span className={`material-icons mr-2 ${
                message.type === 'success' ? 'check_circle' : 'error'
              }`}>
                {message.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <p className="font-medium">{message.text}</p>
            </div>
          </div>
        )}

        {/* Main form for editing patient profile */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                placeholder="Enter your address"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                  <span className="ml-2">Updating...</span>
                </>
              ) : (
                "Update Profile"
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="flex-1 bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Reset Changes
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </div>
  );
}
