import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

/**
 * AdminLayout Component
 * 
 * Professional admin dashboard layout with:
 * - Responsive sidebar navigation
 * - Top navigation bar with user info
 * - Breadcrumb navigation
 * - Mobile-friendly design
 * - Admin-specific navigation items
 * 
 * @returns {JSX.Element} Admin layout component
 */
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      await logout();
      addToast('Logged out successfully', 'success');
      navigate('/auth/login');
    } catch (error) {
      addToast('Logout failed', 'error');
    }
  };

  /**
   * Navigation items for admin sidebar
   */
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: 'dashboard',
      current: location.pathname === '/admin/dashboard'
    },
    {
      name: 'Pharmacies',
      href: '/admin/pharmacies',
      icon: 'local_pharmacy',
      current: location.pathname.startsWith('/admin/pharmacies')
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: 'people',
      current: location.pathname.startsWith('/admin/users')
    },
    {
      name: 'Insurances',
      href: '/admin/insurances',
      icon: 'verified',
      current: location.pathname.startsWith('/admin/insurances')
    },
    {
      name: 'Messages',
      href: '/admin/messages',
      icon: 'message',
      current: location.pathname.startsWith('/admin/messages')
    },
    // {
    //   name: 'Analytics',
    //   href: '/admin/',
    //   icon: 'analytics',
    //   current: location.pathname.startsWith('/admin/analytics')
    // },
    // {
    //   name: 'Settings',
    //   href: '/admin/settings',
    //   icon: 'settings',
    //   current: location.pathname.startsWith('/admin/settings')
    // }
  ];

  /**
   * Get breadcrumb path
   */
  const getBreadcrumb = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length <= 2) return 'Dashboard';
    
    const page = pathSegments[2];
    return page.charAt(0).toUpperCase() + page.slice(1);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-teal-600 to-teal-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <span className="text-teal-600 text-xl font-bold">P</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">PharmaFind</h1>
              <p className="text-xs text-teal-100 -mt-1">Admin Portal</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-teal-200 transition-colors"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  item.current
                    ? 'bg-teal-50 text-teal-700 border-r-4 border-teal-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className={`material-icons mr-4 text-xl ${
                  item.current ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-600'
                }`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* User info at bottom */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
              <span className="material-icons text-white text-sm">admin_panel_settings</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200 h-16">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mr-3"
              >
                <span className="material-icons">menu</span>
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {getBreadcrumb()}
                </h2>
                <p className="text-sm text-gray-500">Admin Panel</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="material-icons">notifications</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User menu */}
              <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                  <span className="material-icons text-white text-sm">admin_panel_settings</span>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <span className="material-icons text-sm mr-1">logout</span>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
