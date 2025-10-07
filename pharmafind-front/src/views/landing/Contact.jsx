import React, { useState } from "react";
import { useToast } from "../../context/ToastContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import SuccessMessage from "../../components/SuccessMessage";

/**
 * Enhanced Contact Component
 * 
 * Professional contact page with improved UX:
 * - Toast notifications instead of alerts
 * - Loading states with spinner
 * - Enhanced form validation
 * - Better error handling
 * - Success feedback
 * - Consistent styling with teal theme
 * - Better responsive design
 * 
 * @returns {JSX.Element} Enhanced contact page component
 */
const Contact = () => {
  const { addToast } = useToast();
  
  // Form state management
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  /**
   * Handle form input changes with validation
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear specific validation error
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }
    
    // Clear general error
    if (error) setError("");
  };

  /**
   * Validate form fields
   */
  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Subject validation
    if (!formData.subject.trim()) {
      errors.subject = "Subject is required";
    } else if (formData.subject.trim().length < 5) {
      errors.subject = "Subject must be at least 5 characters";
    }

    // Message validation
    if (!formData.message.trim()) {
      errors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission with enhanced validation and error handling
   */
  const handleSubmit = async (e) => {
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
      // Send message to API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        // Success feedback
        setSuccess(data.message || "Message sent successfully! We'll get back to you soon.");
        addToast("Message sent successfully!", 'success');
        
        // Reset form
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
      
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage = err.message || "Failed to send message. Please try again.";
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Contact Us Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're here to help! If you have any questions, feedback, or need assistance, 
            please don't hesitate to reach out to us. Our team is dedicated to providing 
            the best possible support for all your PharmaFind needs.
          </p>
        </div>

        {/* Content Cards */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Send Us a Message Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="material-icons text-teal-600 mr-3">email</span>
              Send Us a Message
            </h2>
            
            {/* Messages */}
            <ErrorMessage error={error} onClose={() => setError("")} />
            <SuccessMessage message={success} onClose={() => setSuccess("")} />
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                  required
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                  required
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>

               <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                    validationErrors.subject ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="What is this about?"
                  required
                />
                {validationErrors.subject && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.subject}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors resize-none ${
                    validationErrors.message ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Tell us how we can help you..."
                  required
                ></textarea>
                {validationErrors.message && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 text-white font-medium py-4 px-6 rounded-lg hover:bg-teal-700 transition-colors duration-200 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" text="" />
                    <span className="ml-2">Sending Message...</span>
                  </>
                ) : (
                  <>
                    <span className="material-icons mr-2">send</span>
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="material-icons text-teal-600 mr-3">contact_phone</span>
              Get in Touch
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Reach out to us directly using the information below. We're here to help!
            </p>

            <div className="space-y-8">
              {/* Phone */}
              <div className="flex items-center space-x-4 p-4 bg-teal-50 rounded-lg">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="material-icons text-teal-600">phone</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Phone</h3>
                  <p className="text-lg font-medium text-gray-700">
                    +250 788 888 888
                  </p>
                  <p className="text-sm text-gray-500">Mon-Fri 8AM-6PM</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-4 p-4 bg-teal-50 rounded-lg">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="material-icons text-teal-600">email</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Email</h3>
                  <p className="text-lg font-medium text-gray-700">
                    pharmafind@gmail.com
                  </p>
                  <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center space-x-4 p-4 bg-teal-50 rounded-lg">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="material-icons text-teal-600">location_on</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Office</h3>
                  <p className="text-lg font-medium text-gray-700">
                    Kigali, Rwanda
                  </p>
                  <p className="text-sm text-gray-500">Central Business District</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Response Time</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We typically respond to all inquiries within 24 hours during business days. 
                For urgent matters, please call us directly. We're committed to providing 
                excellent customer support for all PharmaFind users.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
