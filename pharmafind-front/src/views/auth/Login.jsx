import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import Input from "../../components/Input";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";

/**
 * Enhanced Login Component
 * 
 * Professional login page with improved UX features:
 * - Better error handling with toast notifications
 * - Loading states with spinner
 * - Removed external image dependency
 * - Enhanced form validation
 * - Better responsive design
 * - Consistent styling with teal theme
 * 
 * @returns {JSX.Element} Enhanced login component
 */
export default function Login() {
  const { login } = useContext(AuthContext);
  const { addToast } = useToast(); // Initialize toast notifications
  const navigate = useNavigate();
  
  // Form state management
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  /**
   * Handle form input changes
   * Clears error when user starts typing
   */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError("");
  };

  /**
   * Handle form submission with enhanced error handling
   * Includes proper loading states and user feedback
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic form validation
    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const loggedInUser = await login(form.email, form.password);
      if (loggedInUser) {
        // Show success message
        addToast("Login successful! Welcome back!", 'success');
        
        // Navigate based on user role
        switch (loggedInUser.role) {
          case "patient":
            navigate("/patient/dashboard");
            break;
          case "pharmacy_owner":
            navigate("/pharmacy/dashboard");
            break;
          case "super_admin":
          case "admin":
            navigate("/admin/dashboard");
            break;
          default:
            navigate("/");
        }
      } else {
        setError("Invalid email or password");
        addToast("Login failed. Please check your credentials.", 'error');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed. Please try again.";
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden">
      {/* Enhanced Image Side - Using gradient instead of external image */}
      <div className="md:w-1/2 p-4">
        <div className="w-full h-full bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          {/* Content */}
          <div className="text-center text-white z-10 p-8">
            <div className="mb-6">
              <span className="material-icons text-6xl mb-4 block">local_pharmacy</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">Welcome to PharmaFind</h2>
            <p className="text-teal-100 text-lg">
              Your trusted partner in finding the right pharmacy for your healthcare needs
            </p>
            
            {/* Trust Indicators */}
            <div className="mt-8 space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2">
                <span className="material-icons text-green-300">verified</span>
                <span>Secure & Reliable</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="material-icons text-green-300">speed</span>
                <span>Fast & Easy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Form Side */}
      <div className="md:w-1/2 p-8 flex flex-col justify-center">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-500">Sign in to your PharmaFind account</p>
        </div>

        {/* Error Message */}
        <ErrorMessage error={error} onClose={() => setError("")} />

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            required
            autoComplete="email"
          />
          
          {/* Password Input */}
          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-sm text-teal-500 hover:text-teal-600 font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" text="" />
                <span className="ml-2">Signing in...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">New to PharmaFind?</span>
            </div>
          </div>
        </div>

        {/* Registration Link */}
        <div className="text-center">
          <Link
            to="/auth/register"
            className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium"
          >
            <span className="material-icons text-sm mr-1">person_add</span>
            Create an account
          </Link>
        </div>

        {/* Additional Links */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center"
          >
            <span className="material-icons text-sm mr-1">arrow_back</span>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}