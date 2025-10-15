/**
 * Location utility functions for pharmacy sorting and distance calculations
 */

/**
 * Calculate the Haversine distance between two points in kilometers
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Sort pharmacies by distance from user location
 * @param {Array} pharmacies - Array of pharmacy objects
 * @param {Object} userLocation - User's location {lat, lng}
 * @returns {Array} Sorted pharmacies array (nearest first)
 */
export const sortPharmaciesByDistance = (pharmacies, userLocation) => {
  if (!userLocation || !pharmacies || pharmacies.length === 0) {
    return pharmacies;
  }

  return [...pharmacies].sort((a, b) => {
    const distanceA = calculateHaversineDistance(
      userLocation.lat, 
      userLocation.lng, 
      a.latitude, 
      a.longitude
    );
    const distanceB = calculateHaversineDistance(
      userLocation.lat, 
      userLocation.lng, 
      b.latitude, 
      b.longitude
    );
    
    return distanceA - distanceB;
  });
};

/**
 * Randomize array order (Fisher-Yates shuffle)
 * @param {Array} array - Array to randomize
 * @returns {Array} Randomized array
 */
export const randomizeArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Format distance for display (in miles for consistency)
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Formatted distance string in miles
 */
export const formatDistance = (distanceKm) => {
  const distanceMiles = distanceKm * 0.621371; // Convert km to miles
  
  if (distanceMiles < 0.1) {
    return `${(distanceMiles * 5280).toFixed(0)} ft`; // Convert to feet for very short distances
  } else if (distanceMiles < 1) {
    return `${(distanceMiles * 10).toFixed(1)} mi`; // Show 0.1 mi format
  } else {
    return `${distanceMiles.toFixed(1)} mi`;
  }
};

/**
 * Check if location permission is likely granted
 * @returns {boolean} True if location permission is likely granted
 */
export const isLocationPermissionGranted = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => resolve(true),
      () => resolve(false),
      { timeout: 1000 }
    );
  });
};
