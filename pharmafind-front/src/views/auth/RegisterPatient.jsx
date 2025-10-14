import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import Input from "../../components/Input";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import SuccessMessage from "../../components/SuccessMessage";
import axiosClient from "../../axios-client";

/**
 * Enhanced RegisterPatient Component
 * 
 * Professional patient registration form with improved UX:
 * - Toast notifications instead of alerts
 * - Loading states with spinner
 * - Enhanced form validation
 * - Better error handling
 * - Success feedback
 * - Consistent styling with teal theme
 * - Better responsive design
 * 
 * @returns {JSX.Element} Enhanced patient registration component
 */
export default function RegisterPatient() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  // Form state management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Local state for patient form
  const [form, setForm] = useState({
    name: "",
    date_of_birth: "",
    phone_number: "",
    gender: "",
    marital_status: "",
    email: "",
    password: "",
    confirmPassword: "",
    insurances: [], // Array of selected insurance IDs
  });

  // Form validation errors
  const [validationErrors, setValidationErrors] = useState({});
  
  // Available insurances
  const [availableInsurances, setAvailableInsurances] = useState([]);
  const [loadingInsurances, setLoadingInsurances] = useState(true);
  
  // Fetch available insurances on mount
  useEffect(() => {
    const fetchInsurances = async () => {
      try {
        const response = await axiosClient.get('/insurances');
        setAvailableInsurances(response.data || []);
      } catch (error) {
        console.error('Error fetching insurances:', error);
        addToast('Failed to load insurance options', 'error');
      } finally {
        setLoadingInsurances(false);
      }
    };
    
    fetchInsurances();
  }, []);

  /**
   * Handle form input changes with validation
   * Clears errors when user starts typing
   */
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear specific validation error
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }
    
    // Clear general error
    if (error) setError("");
  };
  
  /**
   * Handle insurance checkbox change
   */
  const handleInsuranceChange = (insuranceId) => {
    const currentInsurances = form.insurances || [];
    const isSelected = currentInsurances.includes(insuranceId);
    
    if (isSelected) {
      // Remove insurance
      setForm({
        ...form,
        insurances: currentInsurances.filter(id => id !== insuranceId)
      });
    } else {
      // Add insurance
      setForm({
        ...form,
        insurances: [...currentInsurances, insuranceId]
      });
    }
  };

  /**
   * Validate form fields
   * Returns true if valid, false otherwise
   */
  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!form.name.trim()) {
      errors.name = "Full name is required";
    } else if (form.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!form.phone_number) {
      errors.phone_number = "Phone number is required";
    } else if (!/^\+?[\d\s-()]+$/.test(form.phone_number)) {
      errors.phone_number = "Please enter a valid phone number";
    }

    // Date of birth validation
    if (!form.date_of_birth) {
      errors.date_of_birth = "Date of birth is required";
    } else {
      const birthDate = new Date(form.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 0 || age > 120) {
        errors.date_of_birth = "Please enter a valid date of birth";
      }
    }

    // Gender validation
    if (!form.gender) {
      errors.gender = "Please select your gender";
    }

    // Password validation
    if (!form.password) {
      errors.password = "Password is required";
    } else if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!form.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission with enhanced validation and error handling
   */
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate form
    if (!validateForm()) {
      setLoading(false);
      addToast("Please fix the errors below", 'error');
      return;
    }

    try {
      await register(
        {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          password_confirmation: form.confirmPassword,
          date_of_birth: form.date_of_birth,
          phone_number: form.phone_number,
          gender: form.gender,
          marital_status: form.marital_status || null,
          insurances: form.insurances.length > 0 ? form.insurances : null,
        },
        "patient"
      );
      
      // Success feedback
      setSuccess("Account created successfully! Redirecting to login...");
      addToast("Patient account created successfully!", 'success');
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
      
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to create account. Please try again.";
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Create Patient Account</h1>
          <p className="text-gray-600">Join PharmaFind and find pharmacies that accept your insurance</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Messages */}
          <ErrorMessage error={error} onClose={() => setError("")} />
          <SuccessMessage message={success} onClose={() => setSuccess("")} />

          {/* Registration Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="material-icons text-teal-600 mr-2">person</span>
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="md:col-span-2">
                  <Input
                    label="Full Name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Enter your full name"
                    required
                    error={validationErrors.name}
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <Input
                    label="Date of Birth"
                    type="date"
                    name="date_of_birth"
                    value={form.date_of_birth}
                    onChange={onChange}
                    required
                    error={validationErrors.date_of_birth}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={onChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                      validationErrors.gender ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select your gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {validationErrors.gender && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.gender}</p>
                  )}
                </div>

                {/* Marital Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marital Status
                  </label>
                  <select
                    name="marital_status"
                    value={form.marital_status}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select marital status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Insurance Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <span className="material-icons text-teal-600 mr-2">local_hospital</span>
                Insurance Information
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Select the insurance(s) you have (optional - you can add this later)
              </p>
              
              {loadingInsurances ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="sm" text="Loading insurances..." />
                </div>
              ) : availableInsurances.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableInsurances.map((insurance) => (
                    <label
                      key={insurance.id}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        form.insurances.includes(insurance.id)
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-teal-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.insurances.includes(insurance.id)}
                        onChange={() => handleInsuranceChange(insurance.id)}
                        className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        {insurance.name}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No insurances available at the moment</p>
              )}
              
              {form.insurances.length > 0 && (
                <p className="text-sm text-teal-600 mt-3">
                  {form.insurances.length} insurance(s) selected
                </p>
              )}
            </div>

            {/* Contact Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="material-icons text-teal-600 mr-2">contact_phone</span>
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="Enter your email address"
                    required
                    autoComplete="email"
                    error={validationErrors.email}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone_number"
                    value={form.phone_number}
                    onChange={onChange}
                    placeholder="e.g., +250 788 123 456"
                    required
                    autoComplete="tel"
                    error={validationErrors.phone_number}
                  />
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="material-icons text-teal-600 mr-2">lock</span>
                Security
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password */}
                <div>
                  <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    placeholder="Create a strong password"
                    required
                    autoComplete="new-password"
                    error={validationErrors.password}
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <Input
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={onChange}
                    placeholder="Confirm your password"
                    required
                    autoComplete="new-password"
                    error={validationErrors.confirmPassword}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" text="" />
                    <span className="ml-2">Creating Account...</span>
                  </div>
                ) : (
                  "Create Patient Account"
                )}
              </Button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center space-y-4">
            <div className="text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/auth/login" className="text-teal-600 hover:text-teal-700 font-medium">
                Sign in here
              </a>
            </div>
            
            <div className="text-sm text-gray-500">
              <a href="/" className="flex items-center justify-center text-gray-500 hover:text-gray-700">
                <span className="material-icons text-sm mr-1">arrow_back</span>
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
