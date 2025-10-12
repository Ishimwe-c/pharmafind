import { useState, useCallback, useRef, useEffect } from 'react';
import { locationService } from '../services/locationService';

/**
 * Custom hook for managing directions functionality
 * Provides clean, accurate location detection and directions calculation
 */
export const useDirections = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  
  const watchIdRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  /**
   * Get user's current location with high accuracy
   */
  const getUserLocation = useCallback(async () => {
    if (isGettingLocation) return;
    
    setIsGettingLocation(true);
    setLocationError(null);

    try {
      // First try to get high accuracy location
      const location = await locationService.getLocationWithRetry(3, 2000);
      
      setUserLocation({ lat: location.lat, lng: location.lng });
      setLocationAccuracy(Math.round(location.accuracy));
      setShowDirections(true);
      
      // If location is not accurate enough, start watching for better accuracy
      if (!locationService.isLocationAccurate(location, 50)) {
        startLocationWatching();
      }
      
    } catch (error) {
      console.error('Location error:', error);
      setLocationError(error.message);
    } finally {
      setIsGettingLocation(false);
    }
  }, [isGettingLocation]);

  /**
   * Start watching location for better accuracy
   */
  const startLocationWatching = useCallback(() => {
    if (watchIdRef.current) return;

    locationService.startWatching(
      (location) => {
        setUserLocation({ lat: location.lat, lng: location.lng });
        setLocationAccuracy(Math.round(location.accuracy));
        
        // Stop watching if we get accurate enough location
        if (locationService.isLocationAccurate(location, 50)) {
          stopLocationWatching();
        }
      },
      (error) => {
        console.warn('Location watch error:', error.message);
        // Don't set error for watch failures, just log them
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 5000
      }
    );

    // Auto-stop watching after 30 seconds to save battery
    retryTimeoutRef.current = setTimeout(() => {
      stopLocationWatching();
    }, 30000);
  }, []);

  /**
   * Stop watching location
   */
  const stopLocationWatching = useCallback(() => {
    if (watchIdRef.current) {
      locationService.stopWatchingLocation(watchIdRef.current);
    }
    watchIdRef.current = null;
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  /**
   * Toggle directions on/off
   */
  const toggleDirections = useCallback(() => {
    if (!userLocation) {
      getUserLocation();
    } else {
      setShowDirections(!showDirections);
    }
  }, [userLocation, showDirections, getUserLocation]);

  /**
   * Clear location and directions
   */
  const clearLocation = useCallback(() => {
    stopLocationWatching();
    setUserLocation(null);
    setLocationError(null);
    setLocationAccuracy(null);
    setShowDirections(false);
  }, [stopLocationWatching]);

  /**
   * Get directions for a specific pharmacy
   */
  const getDirectionsToPharmacy = useCallback((pharmacy) => {
    if (!userLocation) {
      getUserLocation().then(() => {
        setShowDirections(true);
      });
    } else {
      setShowDirections(true);
    }
  }, [userLocation, getUserLocation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocationWatching();
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [stopLocationWatching]);

  return {
    // State
    userLocation,
    locationError,
    locationAccuracy,
    isGettingLocation,
    showDirections,
    
    // Actions
    getUserLocation,
    toggleDirections,
    clearLocation,
    getDirectionsToPharmacy,
    setShowDirections,
    
    // Utilities
    isLocationAccurate: locationService.isLocationAccurate,
    getLastKnownLocation: locationService.getLastKnownLocation
  };
};










