import React from 'react';
import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { useSidebar } from '../context/SidebarContext.jsx';
import { useContext } from 'react';
// import { Home, User, LogOut, History } from 'lucide-react';

// PatientLayout.jsx - Only allows patients
export default function PatientLayout() {
  const { token, user, loading, logout } = useContext(AuthContext);
  const { toggleSidebar, isCollapsed } = useSidebar();
  const navigate = useNavigate();
  
  // SHOWING LOADING WHILE AUTHENTICATION IS BEING INITIALIZED
  if(loading){
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading PharmaFind...</p>
        </div>
      </div>
    );
  }
  
  if (!token) return <Navigate to="/auth/login" />;
  if (user?.role !== 'patient') return <Navigate to="/pharmacy/dashboard" />;
  
  const navigationItems = [
    { 
      icon: "home", 
      label: "Dashboard", 
      path: "/patient/dashboard",
      description: "Find pharmacies near you"
    },
    { 
      icon: "local_hospital", 
      label: "Insurance", 
      path: "/patient/insurance",
      description: "Manage your insurance"
    },
    { 
      icon: "notifications", 
      label: "Notifications", 
      path: "/patient/notifications",
      description: "View your notifications"
    },
    { 
      icon: "history", 
      label: "Search History", 
      path: "/patient/search-history",
      description: "View your search history"
    },
    { 
      icon: "person", 
      label: "Profile", 
      path: "/patient/profile",
      description: "Manage your profile"
    },
  ];

  const location = useLocation();
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Patient Sidebar */}
      <aside className={`${isCollapsed ? 'w-16' : 'w-72'} bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 text-white flex flex-col shadow-2xl h-screen transition-all duration-300 ease-in-out`}>
        {/* Logo Section */}
        <div className={`${isCollapsed ? 'px-4' : 'px-8'} py-8 border-b border-purple-700 flex-shrink-0`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-purple-600 text-xl font-bold">P</span>
            </div>
            {!isCollapsed && (
              <div className="transition-opacity duration-300">
                <h1 className="text-2xl font-bold text-white">PharmaFind</h1>
                <p className="text-purple-200 text-sm">Patient Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {navigationItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={index}
                  to={item.path}
                  className={`group relative flex items-center ${isCollapsed ? 'px-4 py-4 justify-center' : 'px-4 py-4'} rounded-xl transition-all duration-200 ${
                    isActive 
                      ? isCollapsed 
                        ? 'bg-purple-600 text-white shadow-lg transform scale-105' 
                        : 'bg-white text-purple-900 shadow-lg transform scale-105'
                      : isCollapsed 
                        ? 'text-white hover:bg-purple-700 hover:shadow-md bg-purple-800/50' 
                        : 'text-purple-100 hover:bg-purple-700 hover:text-white hover:shadow-md'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  {/* Active indicator */}
                  {isActive && !isCollapsed && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-purple-600 rounded-r-full"></div>
                  )}
                  
                  {/* Icon */}
                  <span className={`material-icons ${isCollapsed ? 'text-2xl' : 'text-xl'} transition-colors duration-200 ${
                    isActive 
                      ? isCollapsed 
                        ? 'text-white' 
                        : 'text-purple-600'
                      : isCollapsed 
                        ? 'text-white' 
                        : 'text-purple-300 group-hover:text-white'
                  }`}>
                    {item.icon}
                  </span>
                  
                  {/* Label and Description - Only show when not collapsed */}
                  {!isCollapsed && (
                    <div className="ml-4 flex-1 transition-opacity duration-300">
                      <span className={`font-semibold text-sm transition-colors duration-200 ${
                        isActive ? 'text-purple-900' : 'text-purple-100 group-hover:text-white'
                      }`}>
                        {item.label}
                      </span>
                      <p className={`text-xs transition-colors duration-200 ${
                        isActive ? 'text-purple-600' : 'text-purple-400 group-hover:text-purple-200'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  )}

                  {/* Hover arrow - Only show when not collapsed */}
                  {!isCollapsed && (
                    <span className={`material-icons text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                      isActive ? 'text-purple-600' : 'text-purple-300 group-hover:text-white'
                    }`}>
                      arrow_forward
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Section */}
        <div className={`${isCollapsed ? 'px-4' : 'px-4'} py-6 border-t border-purple-700 flex-shrink-0`}>
          <button
            onClick={logout}
            className={`w-full flex items-center ${isCollapsed ? 'px-4 py-4 justify-center' : 'px-4 py-3'} text-white hover:bg-white hover:text-purple-900 rounded-xl transition-all duration-200 group border border-white/30 hover:border-white`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <span className={`material-icons ${isCollapsed ? 'text-2xl' : 'text-xl'} text-white group-hover:text-purple-900 transition-colors duration-200`}>
              logout
            </span>
            {!isCollapsed && (
              <>
                <span className="ml-4 font-medium">Logout</span>
                <span className="ml-auto material-icons text-sm opacity-0 group-hover:opacity-100 transition-all duration-200">
                  exit_to_app
                </span>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="px-6 py-4 border-t border-purple-700 flex-shrink-0">
            <div className="text-center">
              <p className="text-purple-300 text-xs">
                © 2025 PharmaFind
              </p>
              <p className="text-purple-400 text-xs mt-1">
                Find Your Nearest Pharmacy
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-8 py-4">
            {/* Left side - Menu button and breadcrumb */}
            <div className="flex items-center space-x-4">
              {/* Hamburger Menu Button */}
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <span className="material-icons text-xl">
                  {isCollapsed ? 'menu' : 'menu_open'}
                </span>
              </button>
              
              {/* Breadcrumb and Page Info */}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Patient Portal</span>
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
                
                <Link to="/about" className="text-gray-600 hover:text-purple-600 font-medium transition-colors">
                  About
                </Link>
                <Link to="/contact" className="text-gray-600 hover:text-purple-600 font-medium transition-colors">
                  Contact
                </Link>
              </nav>

              {/* User Profile Display */}
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <div className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm">
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold text-gray-700 truncate max-w-32">
                        {user?.name || 'Patient'}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-32">
                        {user?.email || 'patient@pharmafind.com'}
                      </p>
                    </div>
                    <span className="material-icons text-gray-400 text-sm transition-transform group-hover:rotate-180">
                      expand_more
                    </span>
                  </div>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link
                        to="/patient/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                      >
                        <span className="material-icons text-gray-500 mr-3 text-base">person</span>
                        Profile
                      </Link>
                                             <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={logout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <span className="material-icons text-red-500 mr-3 text-base">logout</span>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50 overflow-y-auto">
          <div className="min-h-full p-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}