import React from 'react';

/**
 * ErrorMessage Component
 * 
 * A reusable error message component that displays errors in a consistent style
 * Includes an error icon and optional close button for better UX
 * 
 * @param {string} error - The error message to display
 * @param {function} onClose - Optional function to call when close button is clicked
 * @returns {JSX.Element} Error message component or null if no error
 */
const ErrorMessage = ({ error, onClose }) => {
  // Don't render anything if there's no error
  if (!error) return null;

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
      <div className="flex items-center">
        {/* Error icon for visual feedback */}
        <span className="material-icons mr-2 text-red-500">error</span>
        
        {/* Error message text */}
        <span className="flex-1">{error}</span>
        
        {/* Optional close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-red-500 hover:text-red-700 transition-colors duration-200"
            aria-label="Close error message"
          >
            <span className="material-icons text-sm">close</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;

