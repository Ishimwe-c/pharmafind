import React from 'react';

/**
 * SkeletonLoader Component
 * 
 * Provides skeleton loading states for better perceived performance
 * Shows animated placeholders while content is loading
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - Type of skeleton: 'card', 'list', 'text', 'image'
 * @param {number} props.count - Number of skeleton items to show
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Skeleton loader component
 */
const SkeletonLoader = ({ 
  variant = 'card', 
  count = 1, 
  className = '' 
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const variants = {
    card: 'h-48 w-full',
    list: 'h-16 w-full',
    text: 'h-4 w-full',
    image: 'h-32 w-32 rounded-full',
    button: 'h-10 w-24',
    input: 'h-10 w-full',
  };

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={`${baseClasses} ${variants.card} ${className}`}>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              <div className="flex space-x-2 mt-4">
                <div className="h-6 bg-gray-300 rounded-full w-16"></div>
                <div className="h-6 bg-gray-300 rounded-full w-20"></div>
              </div>
            </div>
          </div>
        );
        
      case 'list':
        return (
          <div className={`${baseClasses} ${variants.list} ${className}`}>
            <div className="p-4 flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
              <div className="h-8 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
        );
        
      case 'text':
        return (
          <div className={`${baseClasses} ${variants.text} ${className}`}></div>
        );
        
      case 'image':
        return (
          <div className={`${baseClasses} ${variants.image} ${className}`}></div>
        );
        
      case 'button':
        return (
          <div className={`${baseClasses} ${variants.button} ${className}`}></div>
        );
        
      case 'input':
        return (
          <div className={`${baseClasses} ${variants.input} ${className}`}></div>
        );
        
      default:
        return (
          <div className={`${baseClasses} h-4 w-full ${className}`}></div>
        );
    }
  };

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

/**
 * PharmacyCardSkeleton Component
 * 
 * Specific skeleton loader for pharmacy cards
 * Matches the structure of PharmacyCard component
 * 
 * @param {Object} props - Component props
 * @param {number} props.count - Number of skeleton cards to show
 * @returns {JSX.Element} Pharmacy card skeleton component
 */
export const PharmacyCardSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="bg-white p-5 rounded-lg shadow-md animate-pulse">
          {/* Pharmacy name skeleton */}
          <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
          
          {/* Location skeleton */}
          <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>
          
          {/* Insurance tags skeleton */}
          <div className="mb-4">
            <div className="h-4 bg-gray-200 rounded mb-2 w-1/3"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              <div className="h-6 bg-gray-200 rounded-full w-18"></div>
            </div>
          </div>
          
          {/* Status badge and button skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-8 bg-gray-200 rounded-full w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * DashboardSkeleton Component
 * 
 * Skeleton loader for dashboard layouts
 * 
 * @param {Object} props - Component props
 * @param {string} props.layout - Layout type: 'patient', 'pharmacy', 'admin'
 * @returns {JSX.Element} Dashboard skeleton component
 */
export const DashboardSkeleton = ({ layout = 'patient' }) => {
  const renderDashboardContent = () => {
    switch (layout) {
      case 'patient':
        return (
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            
            {/* Search section skeleton */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
            
            {/* Map section skeleton */}
            <div className="bg-white rounded-lg shadow-md h-96">
              <div className="p-4 border-b">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-80 bg-gray-200"></div>
            </div>
          </div>
        );
        
      case 'pharmacy':
        return (
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            
            {/* Stats cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
            
            {/* Content skeleton */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        );
        
      case 'admin':
        return (
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            
            {/* Stats grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
            
            {/* Charts skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        );
        
      default:
        return <SkeletonLoader variant="card" count={3} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {renderDashboardContent()}
      </div>
    </div>
  );
};

export default SkeletonLoader;










