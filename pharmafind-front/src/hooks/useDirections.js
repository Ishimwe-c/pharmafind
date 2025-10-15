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
  const lastPositionRef = useRef(null);
  const isMovingRef = useRef(false);

  /**
   * Calculate distance between two points in kilometers
   */
  const calculateDistance = useCallback((lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

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
      
      // Start continuous tracking for real-time updates like Google Maps
      startLocationWatching();
      
    } catch (error) {
      console.error('Location error:', error);
      setLocationError(error.message);
    } finally {
      setIsGettingLocation(false);
    }
  }, [isGettingLocation]);

  /**
   * Start watching location for continuous tracking (like Google Maps)
   */
  const startLocationWatching = useCallback(() => {
    if (watchIdRef.current) return;

    const watchId = locationService.startWatching(
      (location) => {
        const newLocation = { lat: location.lat, lng: location.lng };
        
        // Calculate movement distance
        if (lastPositionRef.current) {
          const distance = calculateDistance(
            lastPositionRef.current.lat,
            lastPositionRef.current.lng,
            newLocation.lat,
            newLocation.lng
          );
          
          // Consider user moving if they've moved more than 10 meters
          isMovingRef.current = distance > 0.01; // 0.01 km = 10 meters
        }
        
        lastPositionRef.current = newLocation;
        setUserLocation(newLocation);
        setLocationAccuracy(Math.round(location.accuracy));
        
        // Keep watching continuously - don't stop for accuracy
        // This provides real-time location updates like Google Maps
      },
      (error) => {
        console.warn('Location watch error:', error.message);
        // Don't set error for watch failures, just log them
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: isMovingRef.current ? 1000 : 3000 // More frequent updates when moving
      }
    );
    
    watchIdRef.current = watchId;

    // No auto-stop timeout - keep tracking continuously like Google Maps
    // Users can manually stop tracking by toggling directions off
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
      const newShowDirections = !showDirections;
      setShowDirections(newShowDirections);
      
      // If turning off directions, stop continuous tracking
      if (!newShowDirections) {
        stopLocationWatching();
      } else {
        // If turning on directions, start continuous tracking
        startLocationWatching();
      }
    }
  }, [userLocation, showDirections, getUserLocation, startLocationWatching, stopLocationWatching]);

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
        startLocationWatching(); // Start continuous tracking
      });
    } else {
      setShowDirections(true);
      startLocationWatching(); // Start continuous tracking
    }
  }, [userLocation, getUserLocation, startLocationWatching]);

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










