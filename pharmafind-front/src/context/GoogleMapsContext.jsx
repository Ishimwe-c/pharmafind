import React, { createContext, useContext, useState, useEffect } from 'react';
import { LoadScript } from '@react-google-maps/api';

// Static libraries array to prevent LoadScript reloading
const libraries = ['places', 'geometry'];

const GoogleMapsContext = createContext();

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
};

export const GoogleMapsProvider = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="w-full h-96 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
        <div className="text-center text-red-600">
          <span className="material-icons text-4xl mb-2">error</span>
          <p className="font-medium">Google Maps API key is missing</p>
          <p className="text-sm mt-1">Please add VITE_GOOGLE_MAPS_API_KEY to your .env file</p>
        </div>
      </div>
    );
  }

  // Debug: Log API key info (first 10 characters only for security)
  console.log('Google Maps API Key loaded:', apiKey.substring(0, 10) + '...');
  console.log('API Key length:', apiKey.length);
  console.log('API Key starts with:', apiKey.startsWith('AIza') ? 'AIza (valid format)' : 'Invalid format');

  const handleLoad = () => {
    setIsLoaded(true);
    setLoadError(null);
    
    // Suppress the deprecation warning for google.maps.Marker
    if (window.google && window.google.maps) {
      const originalWarn = console.warn;
      console.warn = function(...args) {
        if (args[0] && typeof args[0] === 'string' && args[0].includes('google.maps.Marker is deprecated')) {
          // Suppress this specific warning
          return;
        }
        originalWarn.apply(console, args);
      };
    }
  };

  const handleError = (error) => {
    console.error('Google Maps LoadScript Error:', error);
    setLoadError(error);
    setIsLoaded(false);
  };

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError, apiKey }}>
      <LoadScript
        googleMapsApiKey={apiKey}
        libraries={libraries}
        onLoad={handleLoad}
        onError={handleError}
        loadingElement={
          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading Google Maps...</p>
            </div>
          </div>
        }
        errorElement={
          <div className="w-full h-full bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
            <div className="text-center text-red-600">
              <span className="material-icons text-4xl mb-2">error</span>
              <p className="font-medium">Failed to load Google Maps</p>
              <p className="text-sm mt-1">Please check your API key and internet connection</p>
              <div className="mt-4 p-3 bg-red-100 rounded text-xs">
                <p className="font-medium">Common issues:</p>
                <ul className="text-left mt-1 space-y-1">
                  <li>• API key is invalid or expired</li>
                  <li>• Required APIs not enabled (Maps JavaScript API, Places API)</li>
                  <li>• API key restrictions (HTTP referrers, IP addresses)</li>
                  <li>• Billing not enabled on Google Cloud Console</li>
                </ul>
              </div>
            </div>
          </div>
        }
      >
        {children}
      </LoadScript>
    </GoogleMapsContext.Provider>
  );
};

export default GoogleMapsProvider;
