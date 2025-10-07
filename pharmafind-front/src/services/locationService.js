/**
 * Enhanced Location Service
 * Provides accurate location detection with multiple fallback methods
 */

class LocationService {
  constructor() {
    this.watchId = null;
    this.isWatching = false;
    this.lastKnownLocation = null;
    this.locationCallbacks = new Set();
  }

  /**
   * Get user's current location with high accuracy
   * @param {Object} options - Location options
   * @returns {Promise<Object>} Location object with lat, lng, accuracy
   */
  async getCurrentLocation(options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0, // Force fresh location
      ...options
    };

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      // First attempt: High accuracy with short timeout
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          
          this.lastKnownLocation = location;
          resolve(location);
        },
        (error) => {
          console.warn('High accuracy location failed, trying fallback:', error.message);
          
          // Fallback: Lower accuracy with longer timeout
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp
              };
              
              this.lastKnownLocation = location;
              resolve(location);
            },
            (fallbackError) => {
              console.error('All location attempts failed:', fallbackError.message);
              reject(new Error(this.getErrorMessage(fallbackError)));
            },
            {
              enableHighAccuracy: false,
              timeout: 30000,
              maximumAge: 300000 // 5 minutes
            }
          );
        },
        defaultOptions
      );
    });
  }

  /**
   * Start watching location with high accuracy
   * @param {Function} onLocationUpdate - Callback for location updates
   * @param {Function} onError - Callback for errors
   * @param {Object} options - Watch options
   */
  startWatching(onLocationUpdate, onError, options = {}) {
    if (this.isWatching) {
      this.stopWatching();
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 10000, // 10 seconds
      ...options
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        
        this.lastKnownLocation = location;
        onLocationUpdate(location);
      },
      (error) => {
        console.error('Location watch error:', error.message);
        onError(error);
      },
      defaultOptions
    );

    this.isWatching = true;
  }

  /**
   * Stop watching location
   */
  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isWatching = false;
    }
  }

  /**
   * Get last known location
   * @returns {Object|null} Last known location or null
   */
  getLastKnownLocation() {
    return this.lastKnownLocation;
  }

  /**
   * Check if location is accurate enough
   * @param {Object} location - Location object
   * @param {number} maxAccuracy - Maximum acceptable accuracy in meters
   * @returns {boolean} True if location is accurate enough
   */
  isLocationAccurate(location, maxAccuracy = 50) {
    return location && location.accuracy <= maxAccuracy;
  }

  /**
   * Get user-friendly error message
   * @param {Object} error - Geolocation error
   * @returns {string} Error message
   */
  getErrorMessage(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location access denied. Please enable location permissions and try again.';
      case error.POSITION_UNAVAILABLE:
        return 'Location information is unavailable. Please check your device settings.';
      case error.TIMEOUT:
        return 'Location request timed out. Please try again.';
      default:
        return 'An unknown error occurred while getting your location.';
    }
  }

  /**
   * Request location permission
   * @returns {Promise<boolean>} True if permission granted
   */
  async requestPermission() {
    if (!navigator.permissions) {
      // Fallback for browsers that don't support permissions API
      try {
        await this.getCurrentLocation({ timeout: 1000 });
        return true;
      } catch {
        return false;
      }
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Get location with automatic retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} retryDelay - Delay between retries in ms
   * @returns {Promise<Object>} Location object
   */
  async getLocationWithRetry(maxRetries = 3, retryDelay = 2000) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const location = await this.getCurrentLocation();
        
        // If location is accurate enough, return it
        if (this.isLocationAccurate(location)) {
          return location;
        }
        
        // If this is the last attempt, return the location anyway
        if (i === maxRetries - 1) {
          return location;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } catch (error) {
        lastError = error;
        
        // If this is the last attempt, throw the error
        if (i === maxRetries - 1) {
          throw lastError;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    throw lastError;
  }
}

// Create singleton instance
const locationService = new LocationService();

export default locationService;










