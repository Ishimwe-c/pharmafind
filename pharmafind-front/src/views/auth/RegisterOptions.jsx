// src/pages/auth/RegisterOptions.jsx

import React from "react";
import { Link } from "react-router-dom";

/**
 * Enhanced RegisterOptions Component
 * 
 * Professional registration options page with improved UX:
 * - Better visual design with consistent teal theme
 * - Enhanced card layouts with hover effects
 * - Clear role descriptions and benefits
 * - Better responsive design
 * - Trust indicators and statistics
 * - Improved navigation and branding
 * 
 * @returns {JSX.Element} Enhanced registration options component
 */
export default function RegisterOptions() {
  return (
    <div className="w-full">
      {/* Main Content */}
      <div className="flex flex-col justify-center items-center px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 max-w-4xl">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Join PharmaFind Today
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose your role and start your journey with the most comprehensive pharmacy finder in Rwanda
          </p>
          
          {/* Trust Indicators */}
          <div className="flex justify-center items-center gap-8 text-sm text-gray-500">
            {/* <div className="flex items-center gap-2">
              <span className="material-icons text-green-500">verified</span>
              <span>1000+ Active Users</span>
            </div> */}
            {/* <div className="flex items-center gap-2">
              <span className="material-icons text-green-500">local_pharmacy</span>
              <span>500+ Partner Pharmacies</span>
            </div> */}
            <div className="flex items-center gap-2">
              <span className="material-icons text-green-500">security</span>
              <span>Secure & Reliable</span>
            </div>
          </div>
        </div>

        {/* Registration Options */}
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Choose Your Account Type
            </h2>
            <p className="text-gray-600">
              Select the option that best describes your role in the healthcare ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Patient Option */}
            <Link
              to="/auth/register-patient"
              className="group block bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-teal-300"
            >
              <div className="text-center">
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-teal-200 transition-colors">
                    <span className="material-icons text-teal-600 text-4xl">
                      person
                    </span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Register as Patient
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Find pharmacies that accept your insurance, get directions, and manage your healthcare needs with ease.
                </p>

                {/* Benefits */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="material-icons text-green-500 text-sm mr-2">check_circle</span>
                    <span>Find pharmacies by insurance</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="material-icons text-green-500 text-sm mr-2">check_circle</span>
                    <span>Get directions and contact info</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="material-icons text-green-500 text-sm mr-2">check_circle</span>
                    <span>Save your favorite pharmacies</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="material-icons text-green-500 text-sm mr-2">check_circle</span>
                    <span>Access from any device</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-8">
                  <div className="bg-teal-50 text-teal-700 px-4 py-2 rounded-lg font-medium group-hover:bg-teal-100 transition-colors">
                    Get Started as Patient
                    <span className="material-icons text-sm ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Pharmacy Option */}
            <Link
              to="/auth/register-pharmacy"
              className="group block bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-teal-300"
            >
              <div className="text-center">
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-teal-200 transition-colors">
                    <span className="material-icons text-teal-600 text-4xl">
                      local_pharmacy
                    </span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Register as Pharmacy
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Add your pharmacy to our network, manage your information, and reach more patients in your area.
                </p>

                {/* Benefits */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="material-icons text-green-500 text-sm mr-2">check_circle</span>
                    <span>Reach more patients</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="material-icons text-green-500 text-sm mr-2">check_circle</span>
                    <span>Manage pharmacy information</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="material-icons text-green-500 text-sm mr-2">check_circle</span>
                    <span>Update working hours</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="material-icons text-green-500 text-sm mr-2">check_circle</span>
                    <span>Manage accepted insurances</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-8">
                  <div className="bg-teal-50 text-teal-700 px-4 py-2 rounded-lg font-medium group-hover:bg-teal-100 transition-colors">
                    Register Your Pharmacy
                    <span className="material-icons text-sm ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 text-center max-w-2xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Why Choose PharmaFind?
          </h3>
          <p className="text-gray-600 mb-8">
            We're committed to making healthcare more accessible by connecting patients with the right pharmacies for their needs.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="material-icons text-teal-600">speed</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Fast & Easy</h4>
              <p className="text-sm text-gray-600">Find what you need in seconds</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="material-icons text-teal-600">verified</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Trusted Data</h4>
              <p className="text-sm text-gray-600">Accurate and up-to-date information</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="material-icons text-teal-600">support_agent</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">24/7 Support</h4>
              <p className="text-sm text-gray-600">We're always here to help</p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-teal-600 hover:text-teal-700 font-medium">
              Sign in here
            </Link>
          </p>
          <Link
            to="/"
            className="text-gray-400 hover:text-gray-600 text-sm flex items-center justify-center"
          >
            <span className="material-icons text-sm mr-1">arrow_back</span>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
