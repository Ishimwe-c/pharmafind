// src/views/pharmacy/PharmacyLocationSettings.jsx
// This component allows pharmacy owners to set and manage their pharmacy location
// It uses Google Maps API for superior mapping, geocoding, and search functionality

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, Save, RefreshCw, Navigation } from "lucide-react";
import { GoogleMap, Marker, InfoWindow, Circle } from "@react-google-maps/api";
import { useGoogleMaps } from "../../context/GoogleMapsContext";
import { useAuth } from "../../context/AuthContext"; // For authentication token
import axiosClient from "../../axios-client"; // For API calls with automatic token handling
import geolocationService from "../../services/geolocationService";

export default function LocationSettings() {
  // Get authentication token from context
  const { token } = useAuth();
  
  // Get Google Maps context
  const { isLoaded, loadError } = useGoogleMaps();

  // Refs for Google Maps
  const searchBoxRef = useRef(null);
  const mapRef = useRef(null);
  const geocoderRef = useRef(null);

  // State management for location and UI
  const [position, setPosition] = useState({ lat: -1.2921, lng: 36.8219 }); // Default: Nairobi, Kenya
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalPosition, setOriginalPosition] = useState(null);
  const [address, setAddress] = useState("");
  const [map, setMap] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [locationProgress, setLocationProgress] = useState(null);

  // Load current pharmacy location when component mounts
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await axiosClient.get("/pharmacy/my-pharmacy");
        const pharmacy = res.data;
        
        // Set location if available, otherwise use default
        if (pharmacy.latitude && pharmacy.longitude) {
          const currentPosition = {
            lat: parseFloat(pharmacy.latitude),
            lng: parseFloat(pharmacy.longitude)
          };
          setPosition(currentPosition);
          setOriginalPosition(currentPosition);
          
          // Get address for the coordinates
          if (isLoaded && window.google && window.google.maps) {
            getAddressFromCoordinates(currentPosition);
          }
        } else {
          setOriginalPosition({ lat: -1.2921, lng: 36.8219 });
        }
        
      } catch (err) {
        console.error("Error fetching pharmacy location:", err);
        setError("Failed to load current location");
      } finally {
        setInitialLoading(false);
      }
    };

    if (token && isLoaded) {
      fetchLocation();
    } else if (!token) {
      setInitialLoading(false);
    }
  }, [token, isLoaded]);

  // Initialize geocoder when Google Maps is loaded
  useEffect(() => {
    if (isLoaded && window.google && window.google.maps) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
  }, [isLoaded]);

  // Initialize search box when map is loaded
  useEffect(() => {
    if (map && searchBoxRef.current && window.google && window.google.maps) {
    const searchBox = new window.google.maps.places.SearchBox(searchBoxRef.current);
    
    // Bias search results to current map viewport
    map.addListener('bounds_changed', () => {
      searchBox.setBounds(map.getBounds());
    });

    // Listen for search results
    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      
      if (places.length === 0) return;

      const place = places[0];
      
      if (!place.geometry || !place.geometry.location) {
        setError("No results found for this search");
        return;
      }

      // Update map and marker
      const newPosition = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      
      setPosition(newPosition);
      map.setCenter(newPosition);
      map.setZoom(17);
      
      // Set address
      setAddress(place.formatted_address || "");
      
      // Clear search input
      setSearch("");
    });
    }
  }, [map]);

  // Get address from coordinates using reverse geocoding
  const getAddressFromCoordinates = useCallback((coords) => {
    if (!geocoderRef.current) return;

    geocoderRef.current.geocode({ location: coords }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setAddress(results[0].formatted_address);
      } else {
        setAddress("Address not found");
      }
    });
  }, []);

  // Handle map click
  const handleMapClick = useCallback((e) => {
    const newPosition = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setPosition(newPosition);
    getAddressFromCoordinates(newPosition);
  }, [getAddressFromCoordinates]);

  // Handle marker drag
  const handleMarkerDrag = useCallback((e) => {
    const newPosition = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setPosition(newPosition);
    getAddressFromCoordinates(newPosition);
  }, [getAddressFromCoordinates]);

  // Handle map load
  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // Enter fullscreen
      const mapContainer = document.getElementById('pharmacy-map-container');
      if (mapContainer) {
        if (mapContainer.requestFullscreen) {
          mapContainer.requestFullscreen();
        } else if (mapContainer.webkitRequestFullscreen) {
          mapContainer.webkitRequestFullscreen();
        } else if (mapContainer.msRequestFullscreen) {
          mapContainer.msRequestFullscreen();
        }
        setIsFullscreen(true);
        
        // Center on current position when entering fullscreen
        if (position && map) {
          console.log('Pharmacy fullscreen: Centering on position:', position);
          setTimeout(() => {
            map.setCenter(position);
            map.setZoom(16);
            console.log('Pharmacy fullscreen: Map centered on position');
          }, 200); // Delay to ensure fullscreen transition is complete
        } else {
          console.log('Pharmacy fullscreen: No position or map available:', { position: !!position, map: !!map });
        }
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen change events and keyboard shortcuts
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
      
      // Center on current position when entering fullscreen
      if (isCurrentlyFullscreen && position && map) {
        console.log('Pharmacy fullscreen change: Centering on position:', position);
        setTimeout(() => {
          map.setCenter(position);
          map.setZoom(16);
          console.log('Pharmacy fullscreen change: Map centered on position');
        }, 300); // Delay to ensure fullscreen transition is complete
      } else {
        console.log('Pharmacy fullscreen change: Conditions not met:', { 
          isCurrentlyFullscreen, 
          hasPosition: !!position, 
          hasMap: !!map 
        });
      }
    };

    const handleKeyDown = (event) => {
      // Escape key to exit fullscreen
      if (event.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
      // F11 key to toggle fullscreen
      if (event.key === 'F11') {
        event.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  // Check if there are unsaved changes
  useEffect(() => {
    if (originalPosition) {
      const changed = 
        position.lat !== originalPosition.lat || 
        position.lng !== originalPosition.lng;
      setHasChanges(changed);
    }
  }, [position, originalPosition]);

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Handle search submission
  const handleSearch = () => {
    if (search.trim() && searchBoxRef.current) {
      // Trigger search box search
      const event = new Event('input', { bubbles: true });
      searchBoxRef.current.dispatchEvent(event);
    }
  };

  // Handle Enter key in search
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Reset to original position
  const handleReset = () => {
    if (originalPosition) {
      setPosition({ ...originalPosition });
      if (map) {
        map.setCenter(originalPosition);
      }
      getAddressFromCoordinates(originalPosition);
      setError(null);
      setMessage(null);
    }
  };

  /**
   * Get accuracy quality description
   */
  const getAccuracyQuality = (accuracy) => {
    if (accuracy <= 10) return { label: 'Excellent', color: 'green', emoji: '🎯' };
    if (accuracy <= 30) return { label: 'Very Good', color: 'blue', emoji: '✨' };
    if (accuracy <= 50) return { label: 'Good', color: 'yellow', emoji: '👍' };
    if (accuracy <= 100) return { label: 'Fair', color: 'orange', emoji: '⚠️' };
    return { label: 'Low', color: 'red', emoji: '⚠️' };
  };

  /**
   * Get user's current location with high precision
   */
  const handleUseCurrentLocation = async () => {
    if (!geolocationService.isSupported()) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    try {
      setGettingLocation(true);
      setMessage(null);
      setError(null);
      setLocationProgress('Acquiring GPS signal...');
      
      // Use high-precision mode with multiple samples
      const location = await geolocationService.getHighPrecisionPosition(
        (current, total) => {
          setLocationProgress(`Reading GPS ${current}/${total}...`);
        }
      );
      
      const newPosition = {
        lat: location.latitude,
        lng: location.longitude
      };
      
      setPosition(newPosition);
      setLocationAccuracy(location.accuracy);
      
      // Pan to current location
      if (map) {
        map.panTo(newPosition);
        map.setZoom(18); // Closer zoom for current location
      }
      
      // Get address from coordinates
      getAddressFromCoordinates(newPosition);
      
      // Show accuracy-based message
      const quality = getAccuracyQuality(location.accuracy);
      setMessage(
        `${quality.emoji} Location acquired with ${quality.label.toLowerCase()} accuracy (±${Math.round(location.accuracy)}m). Remember to save your changes.`
      );
      
      // Auto-clear success message after 8 seconds
      setTimeout(() => setMessage(null), 8000);
    } catch (err) {
      console.error('Error getting location:', err);
      if (err.code === 1) {
        setError('Location permission denied. Please enable location access in your browser settings.');
      } else {
        setError('Could not get your current location. Please try again or use the search box.');
      }
    } finally {
      setGettingLocation(false);
      setLocationProgress(null);
    }
  };

  // Save location changes to the backend
  const handleSave = async () => {
    if (!hasChanges) return;

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Get the current pharmacy ID first
      const pharmacyRes = await axiosClient.get("/pharmacy/my-pharmacy");
      const pharmacyId = pharmacyRes.data.id;
      
      // Update the pharmacy with new coordinates
      const res = await axiosClient.put(`/pharmacy/${pharmacyId}`, {
        latitude: position.lat,
        longitude: position.lng
      });
      
      setMessage("Location updated successfully!");
      console.log("Updated location:", res.data);
      
      // Update original position to reflect saved state
      setOriginalPosition({ ...position });
      setHasChanges(false);
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      console.error("Error saving location:", err);
      setError(err.response?.data?.message || "Failed to save location");
    } finally {
      setLoading(false);
    }
  };

  // Show loading skeleton while fetching initial data
  if (initialLoading || !isLoaded) {
    return (
      <div className="p-10 flex-1">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="space-y-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading Google Maps...</p>
                </div>
              </div>
              <div className="h-12 bg-gray-200 rounded w-32 ml-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if Google Maps failed to load
  if (loadError) {
    return (
      <div className="p-10 flex-1">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
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
      </div>
    );
  }

  return (
    <div className="p-10 flex-1">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-800">Location Settings</h2>
          <p className="text-gray-600 mt-2">
            Update your pharmacy's location to make it easier for customers to find you
          </p>
        </div>
        
        {/* Quick stats */}
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {position ? `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}` : "Not Set"}
          </div>
          <div className="text-sm text-gray-500">Current Coordinates</div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Information section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <MapPin className="text-blue-600 mr-2 mt-0.5 w-5 h-5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Google Maps Integration:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Search for any address or location using Google's powerful search</li>
                <li>Click on the map or drag the marker to set exact coordinates</li>
                <li>Automatic address lookup and reverse geocoding</li>
                <li>High-quality maps with satellite and street view options</li>
                <li>Changes are saved when you click "Save Changes"</li>
              </ul>
              
            </div>
          </div>
        </div>

        {/* Current Location Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={gettingLocation}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {gettingLocation ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span className="font-medium">{locationProgress || 'Getting your location...'}</span>
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                <span className="font-medium">📍 Use My Current Location</span>
              </>
            )}
          </button>
          <p className="mt-2 text-sm text-gray-500 text-center">
            {gettingLocation 
              ? 'Taking multiple GPS readings for best accuracy...'
              : 'Uses high-precision GPS for accurate positioning'
            }
          </p>
        </div>

        {/* Accuracy Display */}
        {locationAccuracy && (
          <div className={`mb-6 p-4 rounded-lg border ${
            locationAccuracy <= 30 
              ? 'bg-green-50 border-green-200' 
              : locationAccuracy <= 50
              ? 'bg-blue-50 border-blue-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getAccuracyQuality(locationAccuracy).emoji}</span>
                <div>
                  <p className={`text-sm font-semibold ${
                    locationAccuracy <= 30 ? 'text-green-800' : 
                    locationAccuracy <= 50 ? 'text-blue-800' : 'text-yellow-800'
                  }`}>
                    {getAccuracyQuality(locationAccuracy).label} GPS Accuracy
                  </p>
                  <p className={`text-xs ${
                    locationAccuracy <= 30 ? 'text-green-600' : 
                    locationAccuracy <= 50 ? 'text-blue-600' : 'text-yellow-600'
                  }`}>
                    Your location is accurate within ±{Math.round(locationAccuracy)} meters
                  </p>
                </div>
              </div>
              {locationAccuracy <= 30 && (
                <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
                  High Precision
                </span>
              )}
            </div>
          </div>
        )}

        <div className="relative flex items-center mb-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm font-medium">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={searchBoxRef}
            type="text"
            placeholder="Search for any address, business, or location..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            value={search}
            onChange={handleSearchChange}
            onKeyPress={handleSearchKeyPress}
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Search
          </button>
          <p className="mt-2 text-sm text-gray-500">
            💡 You can also click directly on the map to set your location
          </p>
        </div>

        {/* Google Map */}
        <div 
          id="pharmacy-map-container"
          className={`relative rounded-xl overflow-hidden mb-6 border border-gray-200 transition-all duration-300 ${
            isFullscreen 
              ? 'fixed inset-0 z-50 h-screen' 
              : 'h-96'
          }`}
        >
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={position}
            zoom={15}
            onLoad={onMapLoad}
            onClick={handleMapClick}
            options={{
              styles: [
                {
                  featureType: "poi.business",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }]
                }
              ],
              mapTypeControl: true,
              streetViewControl: true,
              fullscreenControl: false, // Disable built-in fullscreen to prevent marker disappearing
              zoomControl: true,
            }}
          >
            <Marker
              position={position}
              draggable={true}
              onDragEnd={(e) => {
                handleMarkerDrag(e);
                setLocationAccuracy(null); // Clear accuracy when manually adjusted
              }}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: { width: 32, height: 32 }
              }}
            />
            {/* Accuracy Circle */}
            {locationAccuracy && (
              <Circle
                center={position}
                radius={locationAccuracy}
                options={{
                  fillColor: locationAccuracy <= 30 ? '#22c55e' : locationAccuracy <= 50 ? '#3b82f6' : '#eab308',
                  fillOpacity: 0.15,
                  strokeColor: locationAccuracy <= 30 ? '#16a34a' : locationAccuracy <= 50 ? '#2563eb' : '#ca8a04',
                  strokeOpacity: 0.5,
                  strokeWeight: 2,
                }}
              />
            )}
          </GoogleMap>
          
          {/* Fullscreen toggle button */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={toggleFullscreen}
              className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg shadow-md border border-gray-200 transition-colors duration-200 flex items-center space-x-2 group"
              title={isFullscreen ? "Exit fullscreen (Esc)" : "Enter fullscreen (F11)"}
            >
              {isFullscreen ? (
                <>
                  <span className="material-icons text-sm group-hover:scale-110 transition-transform">fullscreen_exit</span>
                  <span className="text-sm font-medium hidden sm:inline">Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <span className="material-icons text-sm group-hover:scale-110 transition-transform">fullscreen</span>
                  <span className="text-sm font-medium hidden sm:inline">Fullscreen</span>
                </>
              )}
            </button>
          </div>

          {/* Fullscreen indicator */}
          {isFullscreen && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm">
              <div className="flex items-center space-x-2">
                <span className="material-icons text-sm">fullscreen</span>
                <span>
                  {address 
                    ? `Viewing: ${address.substring(0, 50)}${address.length > 50 ? '...' : ''}`
                    : 'Fullscreen Mode - Press Esc to exit'
                  }
                </span>
              </div>
            </div>
          )}
          
          {/* Map instructions overlay */}
          <div className="absolute top-4 left-4 bg-white bg-opacity-90 px-3 py-2 rounded-lg text-sm text-gray-700">
            <Navigation className="inline w-4 h-4 mr-1" />
            Click map or drag marker to set location
          </div>
        </div>

        {/* Address Display */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address (Auto-detected)
          </label>
          <div className="relative">
            <input
              type="text"
              value={address}
              readOnly
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-medium cursor-not-allowed"
              placeholder="Address will appear here after setting location"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <MapPin className="text-gray-400 w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Coordinate Display Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Latitude Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Latitude (Read-only)
            </label>
            <div className="relative">
              <input
                type="text"
                value={position ? position.lat.toFixed(6) : ""}
                readOnly
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-mono text-sm cursor-not-allowed"
                placeholder="Click on map to set coordinates"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-400 text-xs">°N/S</span>
              </div>
            </div>
          </div>

          {/* Longitude Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longitude (Read-only)
            </label>
            <div className="relative">
              <input
                type="text"
                value={position ? position.lng.toFixed(6) : ""}
                readOnly
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-mono text-sm cursor-not-allowed"
                placeholder="Click on map to set coordinates"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-400 text-xs">°E/W</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <RefreshCw className="mr-2 w-4 h-4" />
            Reset Changes
          </button>
          
          <button
            onClick={handleSave}
            disabled={loading || !hasChanges}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* Success Message Display */}
        {message && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-green-500 rounded-full mr-2 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <p className="text-green-800 font-medium">{message}</p>
            </div>
          </div>
        )}

        {/* Error Message Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-red-500 rounded-full mr-2 flex items-center justify-center">
                <span className="text-white text-xs">✕</span>
              </div>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
