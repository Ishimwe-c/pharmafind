// src/pages/patient/PatientDashboard.jsx
import React, { useState, useEffect, useMemo, useDeferredValue, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import PatientMap from "../../components/PatientMap";
import PharmacyDetailsModal from "../../components/PharmacyDetailsModal";

// Import new UX components for better user experience
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import SuccessMessage from "../../components/SuccessMessage";
import { PharmacyCardSkeleton, DashboardSkeleton } from "../../components/SkeletonLoader";
import { useToast } from "../../context/ToastContext";
import { useSearchHistory } from "../../context/SearchHistoryContext";
import { usePharmacies, useInsurances, useNearbyPharmacies, useKigaliPharmacies } from "../../hooks/usePharmacies";
import { useDirections } from "../../hooks/useDirections";
import { useDrivingDistance } from "../../hooks/useDrivingDistance";
import axiosClient from "../../axios-client";

/**
 * Enhanced PharmacyCard Component
 * 
 * Displays pharmacy information in a card format with improved UX
 * Includes loading state, better visual feedback, and enhanced interactions
 * 
 * @param {Object} pharmacy - Pharmacy data object
 * @param {Function} onSelect - Callback function when pharmacy is selected
 * @param {Boolean} loading - Whether to show loading skeleton
 * @returns {JSX.Element} Pharmacy card component
 */
const PharmacyCard = React.memo(function PharmacyCard({ pharmacy, onSelect, loading = false, userLocation, drivingDistance, isCalculatingDistance }) {
  // Helper function to extract insurance names safely
  // Handles different data formats from API
  const getInsuranceNames = (insurances) => {
    if (!insurances || !Array.isArray(insurances)) return [];
    
    return insurances.map(ins => {
      // If insurance is an object with a name property, use that
      if (typeof ins === 'object' && ins !== null && ins.name) {
        return ins.name;
      }
      // If insurance is already a string, use it directly
      if (typeof ins === 'string') {
        return ins;
      }
      // Fallback for any other case
      return String(ins);
    });
  };

  const insuranceNames = getInsuranceNames(pharmacy.insurances);
  const isOpen = pharmacy.is_open !== undefined ? pharmacy.is_open : pharmacy.isOpen;
  
  // Get distance display
  const getDistance = () => {
    if (!userLocation || !pharmacy.latitude || !pharmacy.longitude) {
      return 'Location unavailable';
    }
    
    if (isCalculatingDistance) {
      return 'Calculating...';
    }
    
    if (drivingDistance) {
      return drivingDistance.text || `${drivingDistance.miles.toFixed(1)} mi`;
    }
    
    return 'Distance unavailable';
  };

  // Show loading skeleton if loading prop is true
  if (loading) {
    return (
      <div className="bg-white p-5 rounded-lg shadow-md animate-pulse">
        {/* Pharmacy name skeleton */}
        <div className="h-6 bg-gray-200 rounded mb-3"></div>
        {/* Location skeleton */}
        <div className="h-4 bg-gray-200 rounded mb-3"></div>
        {/* Insurance tags skeleton */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        </div>
        {/* Status badge skeleton */}
        <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105" 
      onClick={() => {
        // Only zoom to location, don't open modal
        if (onSelect) {
          // Create a custom event to trigger map zoom without modal
          const zoomEvent = new CustomEvent('pharmacyZoom', { 
            detail: { pharmacy, openModal: false } 
          });
          window.dispatchEvent(zoomEvent);
        }
      }}
    >
      {/* Pharmacy name with better typography */}
      <h3 className="font-bold text-xl text-gray-800 mb-2">
        {pharmacy.pharmacy_name || pharmacy.name || 'Unnamed Pharmacy'}
      </h3>
      
      {/* Location with icon */}
      <p className="text-gray-500 text-sm mb-3 flex items-center">
        <span className="material-icons text-sm mr-1">location_on</span>
        {pharmacy.location || 'Location not available'}
      </p>
      
      {/* Insurance section */}
      <p className="text-sm font-medium text-gray-600 mb-2">Accepted Insurances:</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {insuranceNames.length > 0 ? (
          insuranceNames.map((ins, idx) => (
            <span
              key={idx}
              className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full"
            >
              {ins}
            </span>
          ))
        ) : (
          <span className="text-gray-500 text-sm">No insurance information available</span>
        )}
      </div>
      
             {/* Distance and Status section */}
             <div className="flex items-center justify-between mb-3">
               <div className="flex items-center text-sm text-gray-500">
                 <span className="material-icons mr-1 text-base">location_on</span>
                 <span className="font-medium">{getDistance()}</span>
                 {isCalculatingDistance && (
                   <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
                 )}
               </div>
             </div>
      
      {/* Status badge with improved styling */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center text-sm font-medium px-3 py-1 rounded-full ${
            isOpen
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <span
            className={`w-2 h-2 mr-2 rounded-full ${
              isOpen ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          {isOpen ? "Open Now" : "Closed"}
        </span>
        
        {/* View details button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            // Open modal AND zoom to location
            if (onSelect) {
              onSelect(pharmacy); // This opens modal and zooms
            }
          }}
          className="text-teal-500 hover:text-teal-700 font-medium text-sm flex items-center transition-colors"
        >
          View Details
          <span className="material-icons text-sm ml-1">arrow_forward</span>
        </button>
      </div>
    </div>
  );
});

/**
 * PatientDashboard Component
 * 
 * Main dashboard for patients to search and find pharmacies
 * Enhanced with better UX including loading states, error handling, and toast notifications
 * 
 * @returns {JSX.Element} Patient dashboard component
 */
export default function PatientDashboard() {
  // Authentication and navigation hooks
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Toast notification hook for user feedback
  const { addToast } = useToast();
  
  // Search history hook for managing patient search history
  const { addSearch } = useSearchHistory();
  
  // State management for component data
  const [insurance, setInsurance] = useState("");
  const [searchTerm, setSearchTerm] = useState(''); // For real-time search input
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // For API calls
  const [allPharmacies, setAllPharmacies] = useState([]); // Full list for local filtering like SearchResult
  const [allLoading, setAllLoading] = useState(false);
  const [allError, setAllError] = useState(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [selectedPharmacyFromCard, setSelectedPharmacyFromCard] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Use the new directions hook
  const {
    userLocation,
    locationError,
    locationAccuracy,
    isGettingLocation,
    showDirections,
    getUserLocation,
    toggleDirections,
    getDirectionsToPharmacy
  } = useDirections();

  // Use driving distance hook for consistent distance calculations
  const {
    calculateDrivingDistance,
    calculateMultipleDistances,
    getCachedDistance,
    isCalculatingDistance,
    formatDistance
  } = useDrivingDistance();

  // Defer rendering for heavy children while user is typing rapidly
  const deferredSearchTerm = useDeferredValue(searchTerm);

  // Debounce search term to prevent excessive API calls
  useEffect(() => {
    // If cleared, reset immediately so UI and queries stop right away
    if (!deferredSearchTerm || !deferredSearchTerm.trim()) {
      setDebouncedSearchTerm("");
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedSearchTerm(deferredSearchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [deferredSearchTerm]);

  // Load all pharmacies once (client-side filtering like SearchResult page)
  useEffect(() => {
    let isMounted = true;
    const fetchAll = async () => {
      try {
        setAllLoading(true);
        setAllError(null);
        const response = await axiosClient.get("/pharmacies");
        if (isMounted) {
          setAllPharmacies(response.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setAllError("Failed to load pharmacies");
          // Fallback minimal data
          setAllPharmacies([]);
        }
      } finally {
        if (isMounted) setAllLoading(false);
      }
    };
    fetchAll();
    return () => {
      isMounted = false;
    };
  }, []);

  // Stable handler for user location change to avoid prop identity churn
  const handleUserLocationChange = useCallback((loc) => {
    if (showDirections && selectedPharmacyFromCard) {
      setSelectedPharmacyFromCard({ ...selectedPharmacyFromCard });
    }
  }, [showDirections, selectedPharmacyFromCard]);

  // React Query hooks for data fetching
  // Keep hook signature available but disabled; dashboard uses client-side filtering for quick search
  const { 
    data: pharmacies = [], 
    isLoading: pharmaciesLoading = false, 
    error: pharmaciesError = null 
  } = usePharmacies({ 
    searchTerm: '', 
    insurance: '',
    enabled: false
  });

  // Fetch nearby pharmacies when user location is available
  const { 
    data: nearbyPharmacies = [], 
    isLoading: nearbyPharmaciesLoading, 
    error: nearbyPharmaciesError 
  } = useNearbyPharmacies({ 
    userLocation,
    // Do not filter nearby results by insurance on the dashboard; the insurance button navigates elsewhere
    insurance: '',
    radius: 10, // 10km radius
    enabled: !debouncedSearchTerm && !!userLocation // Only fetch nearby when not searching and location available
  });

  // Fetch Kigali pharmacies as fallback when location is not available
  const { 
    data: kigaliPharmacies = [], 
    isLoading: kigaliPharmaciesLoading, 
    error: kigaliPharmaciesError 
  } = useKigaliPharmacies({ 
    // Do not filter fallback Kigali list by insurance on the dashboard
    insurance: '',
    enabled: !userLocation && !debouncedSearchTerm // Only fetch when no location and not searching
  });

  const { 
    data: availableInsurances = [], 
    isLoading: insurancesLoading, 
    error: insurancesError 
  } = useInsurances();

  // Determine which pharmacies to display based on search and location state (memoized)
  const displayPharmacies = useMemo(() => {
    if (debouncedSearchTerm) {
      // When searching, filter across the full list like SearchResult
      return allPharmacies;
    }
    if (userLocation) {
      return nearbyPharmacies;
    }
    return kigaliPharmacies;
  }, [debouncedSearchTerm, allPharmacies, nearbyPharmacies, kigaliPharmacies, userLocation]);

  // Calculate driving distances when user location or display pharmacies change
  useEffect(() => {
    if (userLocation && displayPharmacies.length > 0) {
      calculateMultipleDistances(userLocation, displayPharmacies);
    }
  }, [userLocation, displayPharmacies, calculateMultipleDistances]);

  // Handle URL parameters from search history
  useEffect(() => {
    const insuranceParam = searchParams.get('insurance');
    const searchParam = searchParams.get('search');
    
    if (insuranceParam) {
      setInsurance(insuranceParam);
    }
    if (searchParam) {
      setSearchTerm(searchParam);
      setDebouncedSearchTerm(searchParam);
    }
  }, [searchParams]);

  // Handle errors from React Query
  useEffect(() => {
    if (pharmaciesError) {
      addToast("Failed to load pharmacies. Please try again.", 'error');
    }
    if (nearbyPharmaciesError) {
      addToast("Failed to load nearby pharmacies. Please try again.", 'error');
    }
    if (kigaliPharmaciesError) {
      addToast("Failed to load pharmacies. Please try again.", 'error');
    }
    if (insurancesError) {
      addToast("Failed to load insurance providers.", 'error');
    }
  }, [pharmaciesError, nearbyPharmaciesError, kigaliPharmaciesError, insurancesError, addToast]);

  /**
   * Handle search functionality with validation and user feedback
   */
  const handleSearch = async () => {
    if (!insurance.trim()) {
      addToast("Please select an insurance provider", 'error');
      return;
    }

    // Add search to history
    addSearch({
      searchTerm: '',
      insuranceFilter: insurance,
      location: '',
      resultsCount: pharmacies.length
    });
    
    // Redirect to search results page with the insurance query
    addToast(`Searching for pharmacies with ${insurance}...`, 'info');
    navigate(`/patient/search-results?insurance=${encodeURIComponent(insurance)}`);
  };

  /**
   * Handle pharmacy selection with user feedback
   */
  const handlePharmacySelect = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setSelectedPharmacyFromCard(pharmacy); // This will trigger map zoom
    setShowModal(true);
    addToast(`Selected ${pharmacy.pharmacy_name}`, 'success');
    console.log("Selected pharmacy:", pharmacy);
    
    // Auto-scroll the map into view
    setTimeout(() => {
      const mapContainer = document.getElementById('patient-map-container');
      if (mapContainer) {
        mapContainer.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      }
    }, 100);
  };

  // Handle get directions from modal - enable directions and select pharmacy
  const handleGetDirectionsFromModal = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setSelectedPharmacyFromCard(pharmacy);
    getDirectionsToPharmacy(pharmacy);
    setShowModal(false);
    addToast(`Directions enabled for ${pharmacy.pharmacy_name}`, 'success');
  };

  /**
   * Handle closing the pharmacy details modal
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPharmacy(null);
  };

  /**
   * Handle reset functionality with user feedback
   */
  const handleReset = () => {
    setInsurance("");
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setSelectedPharmacy(null);
    addToast("Search reset", 'info');
  };

  /**
   * Filter pharmacies based on search term for real-time search
   * Only apply search filter when actually searching
   */
  const filteredPharmacies = useMemo(() => {
    if (!debouncedSearchTerm) {
      return displayPharmacies;
    }
    const lower = debouncedSearchTerm.toLowerCase();
    return displayPharmacies.filter(pharmacy =>
      pharmacy.pharmacy_name?.toLowerCase().includes(lower) ||
      pharmacy.location?.toLowerCase().includes(lower) ||
      pharmacy.insurances?.some(ins => (typeof ins === 'string' ? ins : ins.name)?.toLowerCase().includes(lower))
    );
  }, [debouncedSearchTerm, displayPharmacies]);


  /**
   * Track real-time search in history when debounced search term changes
   */
  const lastLoggedTermRef = useRef("");
  useEffect(() => {
    const term = debouncedSearchTerm.trim();
    if (term.length > 2 && term !== lastLoggedTermRef.current) {
      addSearch({
        searchTerm: term,
        insuranceFilter: insurance,
        location: '',
        resultsCount: filteredPharmacies.length
      });
      lastLoggedTermRef.current = term;
    }
    if (term.length === 0) {
      lastLoggedTermRef.current = "";
    }
  }, [debouncedSearchTerm, insurance, filteredPharmacies.length]);

  // Determine loading state based on current context
  const isLoading = debouncedSearchTerm 
    ? allLoading 
    : userLocation 
      ? nearbyPharmaciesLoading 
      : kigaliPharmaciesLoading;

  // Show loading screen if initial data is loading
  if (isLoading && displayPharmacies.length === 0) {
    return <DashboardSkeleton layout="patient" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header with enhanced styling */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Welcome, {user?.name || 'Patient'}!
              </h1>
              <p className="text-gray-600 text-lg">
                Find pharmacies near you that accept your insurance
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Today</div>
              <div className="text-lg font-semibold text-gray-700">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Messages Section */}
        {pharmaciesError && (
          <ErrorMessage 
            error="Failed to load pharmacies. Please try again." 
            onClose={() => {}} 
          />
        )}
        {nearbyPharmaciesError && (
          <ErrorMessage 
            error="Failed to load nearby pharmacies. Please try again." 
            onClose={() => {}} 
          />
        )}
        {kigaliPharmaciesError && (
          <ErrorMessage 
            error="Failed to load pharmacies. Please try again." 
            onClose={() => {}} 
          />
        )}
        {insurancesError && (
          <ErrorMessage 
            error="Failed to load insurance providers." 
            onClose={() => {}} 
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Section */}
          <div className="lg:col-span-2">
            {/* Insurance Search Card */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-1">Search For Pharmacy</h2>
              <p className="text-gray-600 mb-6">
                Select your insurance provider to find a pharmacy near you.
              </p>
              
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                <div className="flex-grow relative">
                  <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    local_hospital
                  </span>
                  <select
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                  >
                    <option value="">Insurance Provider (e.g. RSSB)</option>
                    {availableInsurances.map(ins => (
                      <option key={ins.id} value={ins.name}>{ins.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={handleSearch}
                    disabled={pharmaciesLoading || !insurance.trim()}
                    className="bg-teal-600 text-white font-medium py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none flex items-center justify-center space-x-1 transition-colors disabled:bg-teal-400 disabled:cursor-not-allowed text-sm"
                  >
                    {pharmaciesLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-icons text-sm">search</span>
                        <span>Search</span>
                      </>
                    )}
                  </button>
                  <button 
                    onClick={handleReset}
                    className="bg-gray-500 text-white font-medium py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none transition-colors text-sm"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Real-time Search Card */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Quick Search</h3>
              <p className="text-gray-600 mb-4">
                Search pharmacies by name, location, or insurance
              </p>
              
              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search pharmacies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              {/* Search Results Count */}
              {debouncedSearchTerm && (
                <p className="text-sm text-gray-600 mt-2">
                  Found {filteredPharmacies.length} pharmacies matching "{debouncedSearchTerm}"
                </p>
              )}
            </div>

            {/* Interactive Map */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Pharmacy Locations</h3>
                    <p className="text-sm text-gray-600">Click on markers to see pharmacy details</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {userLocation && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          Location enabled{locationAccuracy ? ` • ±${locationAccuracy}m` : ''}
                        </span>
                        <div className="group relative">
                          <span className="material-icons text-gray-400 text-sm cursor-help">info</span>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20">
                            All distances shown are driving distances calculated by Google Maps.
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* <button
                      onClick={toggleDirections}
                      disabled={isGettingLocation}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        showDirections
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      } ${isGettingLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isGettingLocation ? 'Getting Location...' : !userLocation ? 'Enable Directions' : showDirections ? 'Hide Directions' : 'Show Directions'}
                    </button> */}
                    {userLocation && (
                      <button
                        onClick={getUserLocation}
                        disabled={isGettingLocation}
                        title="Refresh location"
                        className="px-2 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        <span className="material-icons text-base">my_location</span>
                      </button>
                    )}
                  </div>
                </div>
                {locationError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                    {locationError}
                  </div>
                )}
              </div>
              <PatientMap 
                pharmacies={filteredPharmacies} 
                selectedInsurance={insurance}
                onPharmacySelect={handlePharmacySelect}
                selectedPharmacyFromCard={selectedPharmacyFromCard}
                showDirections={showDirections}
                userLocation={userLocation}
                onUserLocationChange={handleUserLocationChange}
              />
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <aside>
            <div className="sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {debouncedSearchTerm 
                  ? 'Search Results' 
                  : userLocation 
                    ? 'Nearby Pharmacies' 
                    : 'Recent Pharmacies'
                }
              </h2>

              {/* Location prompt when location is off */}
              {!userLocation && !debouncedSearchTerm && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <span className="material-icons text-blue-600 mr-3 mt-1">location_on</span>
                    <div>
                      <h3 className="text-blue-800 font-semibold mb-1">Enable Location</h3>
                      <p className="text-blue-700 text-sm mb-3">
                        Turn on your location to see pharmacies near you.
                      </p>
                      <button
                        onClick={getUserLocation}
                        disabled={isGettingLocation}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isGettingLocation ? 'Getting Location...' : 'Enable Location'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
                
              {/* Show loading state for pharmacy cards */}
              {isLoading ? (
                <PharmacyCardSkeleton count={4} />
              ) : filteredPharmacies.length > 0 ? (
                <div className="space-y-6">
                  {filteredPharmacies.slice(0, 4).map((pharmacy, idx) => (
                    <PharmacyCard 
                      key={pharmacy.id || idx} 
                      pharmacy={pharmacy}
                      onSelect={handlePharmacySelect}
                      userLocation={userLocation}
                      drivingDistance={getCachedDistance(pharmacy)}
                      isCalculatingDistance={isCalculatingDistance(pharmacy)}
                    />
                  ))}
                  
                  {/* Show "Load More" if there are more results */}
                  {/* {filteredPharmacies.length > 4 && (
                    <button 
                      onClick={() => addToast('Showing all results', 'info')}
                      className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Show All ({filteredPharmacies.length} pharmacies)
                    </button>
                  )} */}
                </div>
              ) : (
                /* Empty state when no pharmacies found */
                <div className="text-center py-8">
                  <span className="material-icons text-6xl text-gray-300 mb-4">local_pharmacy</span>
                  <p className="text-gray-500 text-lg">No pharmacies found</p>
                  <p className="text-gray-400 text-sm">
                    {debouncedSearchTerm 
                      ? 'Try adjusting your search terms' 
                      : userLocation 
                        ? 'No pharmacies found nearby' 
                        : 'No pharmacies available in Kigali'
                    }
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Pharmacy Details Modal */}
      <PharmacyDetailsModal
        pharmacy={selectedPharmacy}
        isOpen={showModal}
        onClose={handleCloseModal}
        onGetDirections={handleGetDirectionsFromModal}
      />
    </div>
  );
}
