import React from 'react';

/**
 * LoadingSpinner Component
 * 
 * A reusable loading spinner component with different sizes and optional text
 * Used throughout the app to show loading states during API calls
 * 
 * @param {string} size - Size of the spinner: 'sm', 'md', 'lg', 'xl'
 * @param {string} text - Optional text to display below the spinner
 * @returns {JSX.Element} Loading spinner component
 */
const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  // Define size classes for different spinner sizes
  // This makes the component flexible for different use cases
  const sizeClasses = {
    sm: 'h-4 w-4',    // Small - for buttons or inline loading
    md: 'h-8 w-8',    // Medium - for cards or sections
    lg: 'h-12 w-12',  // Large - for full page loading
    xl: 'h-16 w-16'   // Extra large - for major loading states
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Spinner with CSS animation */}
      <div className={`animate-spin rounded-full border-b-2 border-teal-500 ${sizeClasses[size]}`}></div>
      
      {/* Optional text below spinner */}
      {text && (
        <p className="mt-2 text-sm text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;

