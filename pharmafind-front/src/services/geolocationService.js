import axiosClient from '../axios-client';

/**
 * Geolocation Service
 * 
 * Handles browser geolocation tracking and proximity detection
 * Used to detect when patients are near pharmacies that accept their insurance
 */

class GeolocationService {
  constructor() {
    this.watchId = null;
    this.lastPosition = null;
    this.lastCheck = null;
    this.checkInterval = 30000; // Check every 30 seconds
    this.minDistance = 50; // Minimum distance in meters before checking again (reduced for better detection)
    this.notificationRadius = 0.5; // Notify when within 500 meters (0.5km) - increased for better detection
    this.isTracking = false;
    this.notifiedPharmacies = new Set(); // Track which pharmacies we've already notified about
  }

  /**
   * Check if geolocation is supported
   */
  isSupported() {
    return 'geolocation' in navigator;
  }

  /**
   * Request permission for geolocation
   */
  async requestPermission() {
    if (!this.isSupported()) {
      throw new Error('Geolocation is not supported by your browser');
    }

    try {
      // Try to get position to trigger permission request
      await this.getCurrentPosition();
      return true;
    } catch (error) {
      if (error.code === 1) {
        throw new Error('Location permission denied. Please enable location access in your browser settings.');
      }
      throw error;
    }
  }

  /**
   * Get current position (one-time) with retry logic
   */
  getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 30000, // Increased to 30 seconds
        maximumAge: 30000, // Allow cached position up to 30 seconds old
        ...options
      };

      // Try with high accuracy first
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.lastPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          resolve(this.lastPosition);
        },
        (error) => {
          // If timeout or position unavailable, retry with lower accuracy
          if (error.code === 3 || error.code === 2) {
            console.log('Retrying with lower accuracy...');
            navigator.geolocation.getCurrentPosition(
              (position) => {
                this.lastPosition = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                  timestamp: position.timestamp
                };
                resolve(this.lastPosition);
              },
              (retryError) => reject(retryError),
              {
                enableHighAccuracy: false,
                timeout: 15000,
                maximumAge: 60000
              }
            );
          } else {
            reject(error);
          }
        },
        defaultOptions
      );
    });
  }

  /**
   * Get high-precision position by taking multiple samples
   * Takes 3 readings and uses the most accurate one
   */
  async getHighPrecisionPosition(onProgress = null) {
    if (!this.isSupported()) {
      throw new Error('Geolocation not supported');
    }

    const samples = [];
    const sampleCount = 3;

    for (let i = 0; i < sampleCount; i++) {
      if (onProgress) {
        onProgress(i + 1, sampleCount);
      }

      try {
        const position = await this.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        });
        samples.push(position);
        
        // Small delay between samples
        if (i < sampleCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.warn(`Sample ${i + 1} failed:`, error);
        // Continue with other samples
      }
    }

    if (samples.length === 0) {
      throw new Error('Could not get any position samples');
    }

    // Return the most accurate sample (lowest accuracy value = more precise)
    const bestSample = samples.reduce((best, current) => 
      current.accuracy < best.accuracy ? current : best
    );

    this.lastPosition = bestSample;
    return bestSample;
  }

  /**
   * Start watching user position
   */
  startTracking(onPositionChange = null, onError = null) {
    if (!this.isSupported()) {
      console.error('Geolocation not supported');
      return false;
    }

    if (this.isTracking) {
      console.log('Already tracking location');
      return true;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 30000, // Increased to 30 seconds
      maximumAge: 30000 // Allow cached position up to 30 seconds old
    };

    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const newPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };

        // Calculate distance from last position
        const distance = this.lastPosition 
          ? this.calculateDistance(
              this.lastPosition.latitude,
              this.lastPosition.longitude,
              newPosition.latitude,
              newPosition.longitude
            )
          : Infinity;

        // Update position
        this.lastPosition = newPosition;

        // Call callback if provided
        if (onPositionChange) {
          onPositionChange(newPosition);
        }

        // Check for nearby pharmacies if moved significantly or enough time passed
        const timeSinceLastCheck = Date.now() - (this.lastCheck || 0);
        if (distance > this.minDistance || timeSinceLastCheck > this.checkInterval) {
          this.lastCheck = Date.now();
          await this.checkNearbyPharmacies(newPosition);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        
        // Provide user-friendly error messages
        let userMessage = 'Location tracking error: ';
        switch(error.code) {
          case 1:
            userMessage += 'Permission denied. Please allow location access in your browser settings.';
            break;
          case 2:
            userMessage += 'Position unavailable. Please check your device GPS settings.';
            break;
          case 3:
            userMessage += 'Request timed out. Your GPS may be weak. Trying again...';
            // Don't stop tracking on timeout, let it retry automatically
            return;
          default:
            userMessage += error.message;
        }
        
        if (onError) {
          onError(new Error(userMessage));
        }
      },
      options
    );

    this.isTracking = true;
    console.log('Started location tracking');
    return true;
  }

  /**
   * Stop watching user position
   */
  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
      this.notifiedPharmacies.clear();
      console.log('Stopped location tracking');
    }
  }

  /**
   * Calculate distance between two coordinates (in meters)
   * Uses Haversine formula
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  /**
   * Check for nearby pharmacies that accept patient's insurance
   */
  async checkNearbyPharmacies(position) {
    console.log('🔍 Checking nearby pharmacies...', {
      latitude: position.latitude,
      longitude: position.longitude,
      radius_km: this.notificationRadius,
      timestamp: new Date().toISOString()
    });
    
    try {
      const response = await axiosClient.post('/check-insurance-match', {
        latitude: position.latitude,
        longitude: position.longitude,
        radius_km: this.notificationRadius,
        notify: false // Don't send database notifications, only browser notifications
      });

      console.log('✅ API Response:', {
        success: response.data.success,
        matchCount: response.data.count,
        message: response.data.message,
        matches: response.data.matches
      });

      if (response.data && response.data.matches && response.data.matches.length > 0) {
        console.log(`📍 Found ${response.data.matches.length} matching pharmacies`);
        // Process matches
        this.handlePharmacyMatches(response.data.matches, position);
      } else {
        console.log('ℹ️ No matching pharmacies found nearby');
      }
    } catch (error) {
      console.error('❌ Error checking nearby pharmacies:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // If 401, user session might have expired
      if (error.response?.status === 401) {
        console.error('🔒 Authentication expired - stopping tracking');
        this.stopTracking();
      }
    }
  }

  /**
   * Handle pharmacy matches - send notifications for new matches
   */
  handlePharmacyMatches(matches, position) {
    console.log('🎯 Processing pharmacy matches:', matches);
    console.log('📝 Previously notified pharmacies:', Array.from(this.notifiedPharmacies));
    
    matches.forEach(match => {
      const pharmacyKey = `${match.pharmacy_id}_${match.insurance_id}`;
      console.log(`Checking pharmacy: ${match.pharmacy_name} (${pharmacyKey})`);
      
      // Only notify if we haven't notified about this pharmacy yet
      if (!this.notifiedPharmacies.has(pharmacyKey)) {
        console.log(`✅ NEW MATCH! Sending notification for ${match.pharmacy_name}`);
        this.notifiedPharmacies.add(pharmacyKey);
        
        // Send browser notification
        this.sendBrowserNotification(match);
      } else {
        console.log(`⏭️ Already notified about ${match.pharmacy_name}, skipping...`);
      }
    });
  }

  /**
   * Send browser notification
   */
  async sendBrowserNotification(match) {
    console.log('🔔 sendBrowserNotification called for:', match);
    
    // Check if notifications are supported and permitted
    if (!('Notification' in window)) {
      console.log('❌ This browser does not support notifications');
      return;
    }

    console.log('📢 Notification permission status:', Notification.permission);

    // Request permission if not granted
    if (Notification.permission === 'default') {
      console.log('🙏 Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('📢 Permission granted:', permission);
    }

    // Send notification if permission granted
    if (Notification.permission === 'granted') {
      console.log('✅ Creating browser notification...');
      const notification = new Notification('Insurance Match Nearby! 💊', {
        body: `${match.pharmacy_name} accepts your ${match.insurance_name} insurance. Only ${match.distance_km}km away!`,
        icon: '/pharmacy-icon.png',
        badge: '/pharmacy-badge.png',
        tag: `pharmacy-${match.pharmacy_id}`,
        requireInteraction: false,
        silent: false,
        data: {
          pharmacyId: match.pharmacy_id,
          pharmacyName: match.pharmacy_name,
          distance: match.distance_km,
          insuranceName: match.insurance_name
        }
      });

      console.log('🎉 Notification created successfully!', notification);

      // Handle notification click
      notification.onclick = function(event) {
        console.log('👆 Notification clicked!');
        event.preventDefault();
        window.focus();
        // Navigate to pharmacy details
        window.location.href = `/patient/dashboard?pharmacyId=${match.pharmacy_id}`;
        notification.close();
      };

      // Auto-close after 10 seconds
      setTimeout(() => {
        console.log('⏱️ Auto-closing notification after 10 seconds');
        notification.close();
      }, 10000);
    } else {
      console.log('❌ Notification permission not granted. Current status:', Notification.permission);
    }
  }

  /**
   * Reset notification tracking (e.g., when user wants fresh notifications)
   */
  resetNotifications() {
    this.notifiedPharmacies.clear();
    console.log('Reset notification tracking');
  }

  /**
   * Get distance to a specific location
   */
  getDistanceTo(targetLat, targetLon) {
    if (!this.lastPosition) {
      return null;
    }
    return this.calculateDistance(
      this.lastPosition.latitude,
      this.lastPosition.longitude,
      targetLat,
      targetLon
    );
  }

  /**
   * Check if position is within radius of target
   */
  isWithinRadius(targetLat, targetLon, radiusMeters) {
    const distance = this.getDistanceTo(targetLat, targetLon);
    return distance !== null && distance <= radiusMeters;
  }

  /**
   * Get current tracking status
   */
  getStatus() {
    return {
      isTracking: this.isTracking,
      isSupported: this.isSupported(),
      lastPosition: this.lastPosition,
      lastCheck: this.lastCheck,
      permission: 'Notification' in window ? Notification.permission : 'not-supported'
    };
  }
}

// Export singleton instance
const geolocationService = new GeolocationService();
export default geolocationService;

