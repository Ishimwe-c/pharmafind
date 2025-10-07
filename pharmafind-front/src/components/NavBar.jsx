import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function NavBar() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section - Enhanced with consistent branding */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white text-xl font-bold">P</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">
                  PharmaFind
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Find Your Nearest Pharmacy</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-teal-600 font-medium transition-colors duration-200 relative group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-700 hover:text-teal-600 font-medium transition-colors duration-200 relative group"
            >
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/" 
              className="text-gray-700 hover:text-teal-600 font-medium transition-colors duration-200 relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-700">
                      Hi, {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.role === 'patient' ? 'Patient' : 'Pharmacy Owner'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="text-red-600 hover:text-red-700 font-semibold px-6 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 border border-red-200 hover:border-red-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="text-teal-600 hover:text-teal-700 font-semibold px-6 py-2 rounded-lg hover:bg-teal-50 transition-all duration-200 border border-teal-200 hover:border-teal-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-2 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              <span className="material-icons text-2xl">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation Links */}
              <nav className="space-y-3">
                <Link 
                  to="/" 
                  className="block text-gray-700 hover:text-teal-600 font-medium py-2 px-3 rounded-lg hover:bg-teal-50 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/about" 
                  className="block text-gray-700 hover:text-teal-600 font-medium py-2 px-3 rounded-lg hover:bg-teal-50 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  className="block text-gray-700 hover:text-teal-600 font-medium py-2 px-3 rounded-lg hover:bg-teal-50 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </nav>

              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-sm">
                          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-700">
                          Hi, {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user?.role === 'patient' ? 'Patient' : 'Pharmacy Owner'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-center text-red-600 hover:text-red-700 font-semibold py-3 px-4 rounded-lg hover:bg-red-50 transition-all duration-200 border border-red-200 hover:border-red-300"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth/login"
                      className="block w-full text-center text-teal-600 hover:text-teal-700 font-semibold py-3 px-4 rounded-lg hover:bg-teal-50 transition-all duration-200 border border-teal-200 hover:border-teal-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/auth/register"
                      className="block w-full text-center bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 px-4 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg font-semibold"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
