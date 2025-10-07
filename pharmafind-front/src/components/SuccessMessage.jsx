import React from 'react';

/**
 * SuccessMessage Component
 * 
 * A reusable success message component that displays success messages in a consistent style
 * Includes a success icon and optional close button for better UX
 * 
 * @param {string} message - The success message to display
 * @param {function} onClose - Optional function to call when close button is clicked
 * @returns {JSX.Element} Success message component or null if no message
 */
const SuccessMessage = ({ message, onClose }) => {
  // Don't render anything if there's no message
  if (!message) return null;

  return (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 relative">
      <div className="flex items-center">
        {/* Success icon for visual feedback */}
        <span className="material-icons mr-2 text-green-500">check_circle</span>
        
        {/* Success message text */}
        <span className="flex-1">{message}</span>
        
        {/* Optional close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-green-500 hover:text-green-700 transition-colors duration-200"
            aria-label="Close success message"
          >
            <span className="material-icons text-sm">close</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SuccessMessage;

