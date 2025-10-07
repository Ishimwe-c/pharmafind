import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for calculating driving distances using Google Maps Directions API
 * Provides consistent driving distance calculations across the application
 */
export const useDrivingDistance = () => {
  const [distances, setDistances] = useState(new Map());
  const [loadingDistances, setLoadingDistances] = useState(new Set());
  const directionsServiceRef = useRef(null);

  // Initialize directions service
  const initializeService = useCallback(() => {
    if (!directionsServiceRef.current && window.google && window.google.maps) {
      directionsServiceRef.current = new window.google.maps.DirectionsService();
    }
  }, []);

  // Calculate driving distance for a single pharmacy
  const calculateDrivingDistance = useCallback(async (userLocation, pharmacy) => {
    if (!userLocation || !pharmacy || !pharmacy.latitude || !pharmacy.longitude) {
      return null;
    }

    const pharmacyId = pharmacy.id || `${pharmacy.latitude}_${pharmacy.longitude}`;
    
    // Return cached distance if available
    if (distances.has(pharmacyId)) {
      return distances.get(pharmacyId);
    }

    // Initialize service if needed
    initializeService();
    
    if (!directionsServiceRef.current) {
      return null;
    }

    const pharmacyCoords = {
      lat: parseFloat(pharmacy.latitude),
      lng: parseFloat(pharmacy.longitude)
    };

    const request = {
      origin: userLocation,
      destination: pharmacyCoords,
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.IMPERIAL,
      avoidHighways: false,
      avoidTolls: false
    };

    try {
      // Mark as loading
      setLoadingDistances(prev => new Set(prev).add(pharmacyId));

      const result = await new Promise((resolve, reject) => {
        directionsServiceRef.current.route(request, (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            resolve(result);
          } else {
            reject(new Error(`Directions failed: ${status}`));
          }
        });
      });

      const distance = result.routes[0]?.legs[0]?.distance?.value; // Distance in meters
      const distanceText = result.routes[0]?.legs[0]?.distance?.text; // Formatted distance
      
      if (distance && distanceText) {
        const distanceData = {
          meters: distance,
          text: distanceText,
          miles: distance * 0.000621371 // Convert meters to miles
        };
        
        // Cache the result
        setDistances(prev => new Map(prev).set(pharmacyId, distanceData));
        return distanceData;
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to calculate driving distance:', error);
      return null;
    } finally {
      // Remove from loading set
      setLoadingDistances(prev => {
        const newSet = new Set(prev);
        newSet.delete(pharmacyId);
        return newSet;
      });
    }
  }, [distances, initializeService]);

  // Calculate driving distances for multiple pharmacies
  const calculateMultipleDistances = useCallback(async (userLocation, pharmacies) => {
    if (!userLocation || !pharmacies || pharmacies.length === 0) {
      return;
    }

    // Initialize service if needed
    initializeService();
    
    if (!directionsServiceRef.current) {
      return;
    }

    // Calculate distances for all pharmacies
    const promises = pharmacies.map(pharmacy => 
      calculateDrivingDistance(userLocation, pharmacy)
    );

    await Promise.allSettled(promises);
  }, [calculateDrivingDistance, initializeService]);

  // Get cached distance for a pharmacy
  const getCachedDistance = useCallback((pharmacy) => {
    if (!pharmacy) return null;
    const pharmacyId = pharmacy.id || `${pharmacy.latitude}_${pharmacy.longitude}`;
    return distances.get(pharmacyId) || null;
  }, [distances]);

  // Check if distance is being calculated for a pharmacy
  const isCalculatingDistance = useCallback((pharmacy) => {
    if (!pharmacy) return false;
    const pharmacyId = pharmacy.id || `${pharmacy.latitude}_${pharmacy.longitude}`;
    return loadingDistances.has(pharmacyId);
  }, [loadingDistances]);

  // Clear all cached distances
  const clearDistances = useCallback(() => {
    setDistances(new Map());
    setLoadingDistances(new Set());
  }, []);

  // Format distance for display
  const formatDistance = useCallback((distanceData) => {
    if (!distanceData) return 'Calculating...';
    return distanceData.text || `${distanceData.miles.toFixed(1)} mi`;
  }, []);

  return {
    calculateDrivingDistance,
    calculateMultipleDistances,
    getCachedDistance,
    isCalculatingDistance,
    clearDistances,
    formatDistance,
    distances,
    loadingDistances
  };
};










