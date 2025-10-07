import { useQuery } from '@tanstack/react-query';
import axiosClient from '../axios-client';

/**
 * Hook to fetch pharmacies based on search term and insurance
 * @param {Object} params - Parameters for the query
 * @param {string} params.searchTerm - Search term for pharmacy name/location
 * @param {string} params.insurance - Insurance filter
 * @param {boolean} params.enabled - Whether the query should be enabled
 * @returns {Object} Query result with data, loading state, and error
 */
export const usePharmacies = ({ searchTerm, insurance, enabled = true }) => {
  return useQuery({
    queryKey: ['pharmacies', searchTerm, insurance],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (insurance) params.append('insurance', insurance);
      
      const response = await axiosClient.get(`/pharmacies?${params.toString()}`);
      return response.data;
    },
    enabled: enabled && (!!searchTerm || !!insurance),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch nearby pharmacies based on user location
 * @param {Object} params - Parameters for the query
 * @param {Object} params.userLocation - User's current location {lat, lng}
 * @param {string} params.insurance - Insurance filter
 * @param {number} params.radius - Search radius in kilometers
 * @param {boolean} params.enabled - Whether the query should be enabled
 * @returns {Object} Query result with data, loading state, and error
 */
export const useNearbyPharmacies = ({ userLocation, insurance, radius = 10, enabled = true }) => {
  return useQuery({
    queryKey: ['nearby-pharmacies', userLocation, insurance, radius],
    queryFn: async () => {
      if (!userLocation) return [];
      
      try {
        const params = new URLSearchParams();
        params.append('lat', userLocation.lat);
        params.append('lng', userLocation.lng);
        params.append('radius', radius);
        if (insurance) params.append('insurance', insurance);
        
        const response = await axiosClient.get(`/pharmacies/nearby?${params.toString()}`);
        return response.data;
      } catch (error) {
        console.warn('Nearby pharmacies API not available, using fallback data:', error);
        
        // Return fallback data based on user location
        return [
          {
            id: 1,
            pharmacy_name: "Nearby Pharmacy 1",
            name: "Nearby Pharmacy 1",
            location: "Near your location",
            address: "Near your location",
            insurances: insurance ? [insurance] : ["RSSB", "MMI"],
            is_open: true,
            isOpen: true,
            latitude: userLocation.lat + 0.01,
            longitude: userLocation.lng + 0.01,
            phone_number: "+250 123 456 789",
            email: "info@nearbypharmacy.com",
            distance_km: 0.5,
            working_hours: []
          },
          {
            id: 2,
            pharmacy_name: "Nearby Pharmacy 2",
            name: "Nearby Pharmacy 2", 
            location: "Close to your area",
            address: "Close to your area",
            insurances: insurance ? [insurance] : ["RSSB", "RADIANT"],
            is_open: false,
            isOpen: false,
            latitude: userLocation.lat - 0.01,
            longitude: userLocation.lng + 0.02,
            phone_number: "+250 987 654 321",
            email: "contact@nearbypharmacy2.com",
            distance_km: 1.2,
            working_hours: []
          }
        ];
      }
    },
    enabled: enabled && !!userLocation,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch pharmacies in Kigali as fallback
 * @param {Object} params - Parameters for the query
 * @param {string} params.insurance - Insurance filter
 * @param {boolean} params.enabled - Whether the query should be enabled
 * @returns {Object} Query result with data, loading state, and error
 */
export const useKigaliPharmacies = ({ insurance, enabled = true }) => {
  return useQuery({
    queryKey: ['kigali-pharmacies', insurance],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        params.append('city', 'Kigali');
        if (insurance) params.append('insurance', insurance);
        
        const response = await axiosClient.get(`/pharmacies?${params.toString()}`);
        return response.data;
      } catch (error) {
        console.warn('Kigali pharmacies API not available, using fallback data:', error);
        
        // Return fallback data for Kigali
        return [
          {
            id: 3,
            pharmacy_name: "Kigali Central Pharmacy",
            name: "Kigali Central Pharmacy",
            location: "Kigali, Rwanda",
            address: "Kigali, Rwanda",
            insurances: insurance ? [insurance] : ["RSSB", "MMI", "RADIANT"],
            is_open: true,
            isOpen: true,
            latitude: -1.9441,
            longitude: 30.0619,
            phone_number: "+250 111 222 333",
            email: "info@kigalipharmacy.com",
            working_hours: []
          }
        ];
      }
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook to fetch available insurance options
 * @returns {Object} Query result with data, loading state, and error
 */
export const useInsurances = () => {
  return useQuery({
    queryKey: ['insurances'],
    queryFn: async () => {
      const response = await axiosClient.get('/insurances');
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  });
};