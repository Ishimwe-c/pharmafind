import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import SidebarFooter from "./SidebarFooter";

const SideBar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isCollapsed } = useSidebar();

  // Add custom scrollbar styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .sidebar-scroll::-webkit-scrollbar {
        width: 6px;
      }
      .sidebar-scroll::-webkit-scrollbar-track {
        background: #1e3a8a;
      }
      .sidebar-scroll::-webkit-scrollbar-thumb {
        background: #1d4ed8;
        border-radius: 3px;
      }
      .sidebar-scroll::-webkit-scrollbar-thumb:hover {
        background: #2563eb;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const navigationItems = [
    { 
      icon: "dashboard", 
      label: "Dashboard", 
      path: "/pharmacy/dashboard",
      description: "Overview of your pharmacy"
    },
    { 
      icon: "medication", 
      label: "Medicines", 
      path: "/pharmacy/medicines",
      description: "Manage medicine inventory"
    },
    { 
      icon: "edit", 
      label: "Edit Details", 
      path: "/pharmacy/edit-details",
      description: "Update pharmacy information"
    },
    { 
      icon: "verified", 
      label: "Insurances", 
      path: "/pharmacy/insurances",
      description: "Manage accepted insurances"
    },
    { 
      icon: "schedule", 
      label: "Working Hours", 
      path: "/pharmacy/working-hours",
      description: "Set operating hours"
    },
    { 
      icon: "location_on", 
      label: "Location", 
      path: "/pharmacy/location-settings",
      description: "Manage pharmacy location"
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-72'} bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white flex flex-col shadow-2xl h-screen transition-all duration-300 ease-in-out`}>
      {/* Logo Section */}
      <div className={`${isCollapsed ? 'px-4' : 'px-8'} py-8 border-b border-blue-700 flex-shrink-0`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-blue-600 text-xl font-bold">P</span>
          </div>
          {!isCollapsed && (
            <div className="transition-opacity duration-300">
              <h1 className="text-2xl font-bold text-white">PharmaFind</h1>
              <p className="text-blue-200 text-sm">Pharmacy Portal</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto sidebar-scroll">
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
                        ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                        : 'bg-white text-blue-900 shadow-lg transform scale-105'
                      : isCollapsed 
                        ? 'text-white hover:bg-blue-700 hover:shadow-md bg-blue-800/50' 
                        : 'text-blue-100 hover:bg-blue-700 hover:text-white hover:shadow-md'
                  }`}
                title={isCollapsed ? item.label : ''}
              >
                {/* Active indicator */}
                {isActive && !isCollapsed && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full"></div>
                )}
                
                {/* Icon */}
                <span className={`material-icons ${isCollapsed ? 'text-2xl' : 'text-xl'} transition-colors duration-200 ${
                  isActive 
                    ? isCollapsed 
                      ? 'text-white' 
                      : 'text-blue-600'
                    : isCollapsed 
                      ? 'text-white' 
                      : 'text-blue-300 group-hover:text-white'
                }`}>
                  {item.icon}
                </span>
                
                {/* Label and Description - Only show when not collapsed */}
                {!isCollapsed && (
                  <div className="ml-4 flex-1 transition-opacity duration-300">
                    <span className={`font-semibold text-sm transition-colors duration-200 ${
                      isActive ? 'text-blue-900' : 'text-blue-100 group-hover:text-white'
                    }`}>
                      {item.label}
                    </span>
                    <p className={`text-xs transition-colors duration-200 ${
                      isActive ? 'text-blue-600' : 'text-blue-400 group-hover:text-blue-200'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                )}

                {/* Hover arrow - Only show when not collapsed */}
                {!isCollapsed && (
                  <span className={`material-icons text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                    isActive ? 'text-blue-600' : 'text-blue-300 group-hover:text-white'
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
      <div className={`${isCollapsed ? 'px-4' : 'px-4'} py-6 border-t border-blue-700 flex-shrink-0`}>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${isCollapsed ? 'px-4 py-4 justify-center' : 'px-4 py-3'} text-white hover:bg-white hover:text-blue-900 rounded-xl transition-all duration-200 group border border-white/30 hover:border-white`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <span className={`material-icons ${isCollapsed ? 'text-2xl' : 'text-xl'} text-white group-hover:text-blue-900 transition-colors duration-200`}>
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
      {!isCollapsed && <div className="flex-shrink-0">
        <SidebarFooter />
      </div>}
    </aside>
  );
};

export default SideBar;
