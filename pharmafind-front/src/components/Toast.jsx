import React, { useState, useEffect } from 'react';

/**
 * Toast Component
 * 
 * A toast notification component that appears in the top-right corner
 * Automatically disappears after a specified duration
 * Supports different types: success, error, warning, info
 * 
 * @param {string} message - The message to display in the toast
 * @param {string} type - Type of toast: 'success', 'error', 'warning', 'info'
 * @param {number} duration - How long to show the toast in milliseconds
 * @param {function} onClose - Function to call when toast is closed
 * @returns {JSX.Element} Toast notification component
 */
const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  // State to control toast visibility with animation
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Set up auto-dismiss timer
    const timer = setTimeout(() => {
      setVisible(false);
      // Wait for animation to complete before calling onClose
      setTimeout(onClose, 300);
    }, duration);

    // Cleanup timer on component unmount
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Define styling based on toast type
  const typeClasses = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  // Define icons for each toast type
  const icons = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`${typeClasses[type]} px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-80`}>
        {/* Toast icon */}
        <span className="material-icons">{icons[type]}</span>
        
        {/* Toast message */}
        <span className="flex-1">{message}</span>
        
        {/* Close button */}
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-auto text-white hover:text-gray-200 transition-colors duration-200"
          aria-label="Close notification"
        >
          <span className="material-icons text-sm">close</span>
        </button>
      </div>
    </div>
  );
};

export default Toast;

