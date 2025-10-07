import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';

/**
 * ToastContext
 * 
 * Context for managing toast notifications throughout the application
 * Provides a centralized way to show success, error, warning, and info messages
 * Uses React Context API for state management across components
 */
const ToastContext = createContext();

/**
 * ToastProvider Component
 * 
 * Provider component that wraps the app and manages toast notifications
 * Maintains a list of active toasts and provides methods to add/remove them
 * 
 * @param {Object} children - Child components to wrap
 * @returns {JSX.Element} Provider component with toast management
 */
export const ToastProvider = ({ children }) => {
  // State to store all active toast notifications
  const [toasts, setToasts] = useState([]);

  /**
   * Add a new toast notification
   * 
   * @param {string} message - The message to display
   * @param {string} type - Type of toast: 'success', 'error', 'warning', 'info'
   * @param {number} duration - How long to show the toast (default: 3000ms)
   */
  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    // Generate unique ID for each toast
    const id = Date.now() + Math.random();
    
    // Add new toast to the list
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  /**
   * Remove a toast notification by ID
   * 
   * @param {number} id - The ID of the toast to remove
   */
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Render all active toasts */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};

/**
 * useToast Hook
 * 
 * Custom hook to access toast functionality from any component
 * Provides the addToast function to show notifications
 * 
 * @returns {Object} Object containing addToast function
 * @throws {Error} If used outside of ToastProvider
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  
  // Ensure hook is used within ToastProvider
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

