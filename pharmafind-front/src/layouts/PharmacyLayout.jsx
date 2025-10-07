import React from "react";
import SideBar from "../components/SideBar.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { useSidebar } from "../context/SidebarContext.jsx";
import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { useContext } from "react";


const PharmacyLayout = () => {
  const {token, user, loading, logout} = useContext(AuthContext);
  const { toggleSidebar, isCollapsed } = useSidebar();
  const location = useLocation();
  
  // SHOWING LOADING WHILE AUTHENTICATION IS BEING INITIALIZED
  if(loading){
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading PharmaFind...</p>
        </div>
      </div>
    );
  }
  
  if(!token) return <Navigate to="/auth/login" />;
  if(user?.role !== 'pharmacy_owner') return <Navigate to="/patient/dashboard" />;
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Enhanced Sidebar - Full Height */}
      <div className="flex-shrink-0">
        <SideBar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Enhanced Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-8 py-4">
            {/* Left side - Menu button and breadcrumb */}
            <div className="flex items-center space-x-4">
              {/* Hamburger Menu Button */}
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <span className="material-icons text-xl">
                  {isCollapsed ? 'menu' : 'menu_open'}
                </span>
              </button>
              
              {/* Breadcrumb and Page Info */}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Pharmacy Portal</span>
                <span>/</span>
                <span className="text-gray-700 font-medium">
                  {location.pathname.split('/').pop().replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {/* Navigation Links */}
              <nav className="hidden md:flex items-center space-x-6">
                
                <Link to="/about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  About
                </Link>
                <Link to="/contact" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Contact
                </Link>
              </nav>

              {/* User Profile Display */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3 p-2 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-700 truncate max-w-32">
                      {user?.name || 'Pharmacy Owner'}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-32">
                      {user?.email || 'owner@pharmacy.com'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content with Enhanced Background */}
        <main className="flex-1 bg-gray-50 overflow-y-auto">
          <div className="min-h-full p-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PharmacyLayout;
