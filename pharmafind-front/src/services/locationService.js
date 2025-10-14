import axiosClient from '../axios-client';

/**
 * Location Service
 * 
 * Handles all API calls related to location-based features
 * Used for insurance match alerts and location-based pharmacy discovery
 */

export const locationService = {
  // Check for insurance matches when user is near pharmacies
  checkInsuranceMatch: async (locationData) => {
    const response = await axiosClient.post('/check-insurance-match', locationData);
    return response.data;
  },

  // Get pharmacies that accept user's insurance within a radius
  getPharmaciesForInsurance: async (userLocation, radiusKm = 5) => {
    const params = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      radius_km: radiusKm
    };
    
    const response = await axiosClient.post('/check-insurance-match', params);
    return response.data;
  },

  // Get nearby pharmacies (existing function from the original service)
  getNearbyPharmacies: async (userLocation, radiusKm = 10) => {
    const params = new URLSearchParams();
    params.append('latitude', userLocation.latitude);
    params.append('longitude', userLocation.longitude);
    params.append('radius', radiusKm);

    const response = await axiosClient.get(`/pharmacies/nearby?${params.toString()}`);
    return response.data;
  },

  // Calculate distance between two points using Haversine formula
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  },

  // Format distance for display
  formatDistance: (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else {
      return `${distance.toFixed(1)}km`;
    }
  },

  // Get user's current location
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  },

  // Get location with retry logic
  getLocationWithRetry: async (maxRetries = 3, retryDelay = 2000) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const location = await locationService.getCurrentLocation();
        return location;
      } catch (error) {
        lastError = error;
        console.warn(`Location attempt ${i + 1} failed:`, error.message);
        
        // If not the last attempt, wait before retrying
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    throw new Error(`Failed to get location after ${maxRetries} attempts: ${lastError.message}`);
  },

  // Check if location is accurate enough
  isLocationAccurate: (location, maxAccuracyMeters = 50) => {
    return location && location.accuracy && location.accuracy <= maxAccuracyMeters;
  },

  // Get last known location (from local storage)
  getLastKnownLocation: () => {
    try {
      const stored = localStorage.getItem('lastKnownLocation');
      if (stored) {
        const location = JSON.parse(stored);
        // Only return if it's less than 1 hour old
        const age = Date.now() - (location.timestamp || 0);
        if (age < 3600000) { // 1 hour
          return {
            lat: location.lat,
            lng: location.lng,
            latitude: location.lat,
            longitude: location.lng,
            accuracy: location.accuracy
          };
        }
      }
    } catch (error) {
      console.warn('Failed to get last known location:', error);
    }
    return null;
  },

  // Save location to local storage
  saveLastKnownLocation: (location) => {
    try {
      localStorage.setItem('lastKnownLocation', JSON.stringify({
        lat: location.lat || location.latitude,
        lng: location.lng || location.longitude,
        accuracy: location.accuracy,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to save last known location:', error);
    }
  },

  // Start watching location
  startWatching: (onSuccess, onError, options = {}) => {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 5000
    };

    const watchOptions = { ...defaultOptions, ...options };

    if (!navigator.geolocation) {
      if (onError) {
        onError(new Error('Geolocation is not supported by this browser'));
      }
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        // Save to local storage
        locationService.saveLastKnownLocation(location);
        
        if (onSuccess) {
          onSuccess(location);
        }
      },
      (error) => {
        console.error('Location watch error:', error);
        if (onError) {
          onError(error);
        }
      },
      watchOptions
    );

    return watchId;
  },

  // Watch user's location for insurance match alerts (legacy method)
  watchLocation: (callback, options = {}) => {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // 1 minute
    };

    const watchOptions = { ...defaultOptions, ...options };

    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        callback(location);
      },
      (error) => {
        console.error('Location watch error:', error);
      },
      watchOptions
    );
  },

  // Stop watching location
  stopWatchingLocation: (watchId) => {
    navigator.geolocation.clearWatch(watchId);
  },

  // Check if location is within radius of a pharmacy
  isWithinRadius: (userLocation, pharmacyLocation, radiusKm) => {
    const distance = locationService.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      pharmacyLocation.latitude,
      pharmacyLocation.longitude
    );
    return distance <= radiusKm;
  },

  // Get pharmacies within radius of user location
  getPharmaciesWithinRadius: (userLocation, pharmacies, radiusKm) => {
    return pharmacies.filter(pharmacy => {
      if (!pharmacy.latitude || !pharmacy.longitude) return false;
      
      return locationService.isWithinRadius(
        userLocation,
        { latitude: pharmacy.latitude, longitude: pharmacy.longitude },
        radiusKm
      );
    });
  }
};