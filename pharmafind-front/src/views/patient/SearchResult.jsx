import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import axiosClient from "../../axios-client";
import PatientMap from "../../components/PatientMap";
import PharmacyDetailsModal from "../../components/PharmacyDetailsModal";
import { useDirections } from "../../hooks/useDirections";
import { useDrivingDistance } from "../../hooks/useDrivingDistance";

// Reusable PharmacyCard component
const PharmacyCard = ({ pharmacy, onSelect, userLocation, drivingDistance, isCalculatingDistance }) => {
  // Helper function to extract insurance names safely
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

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer ${
        !isOpen ? "opacity-75" : ""
      }`}
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
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-gray-900">{pharmacy.pharmacy_name || pharmacy.name || 'Unnamed Pharmacy'}</h2>
        <span
          className={`font-medium text-sm flex items-center ${
            isOpen ? "text-green-600" : "text-red-600"
          }`}
        >
          <span className="material-icons mr-1 text-base">watch_later</span>
          {isOpen ? 'Open' : 'Closed'}
        </span>
      </div>

      <p className="text-gray-500 mb-4 flex items-center">
        <span className="material-icons mr-2 text-base">location_on</span>
        {pharmacy.location || pharmacy.address || 'Address not available'}
      </p>

      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">
          Accepted Insurances:
        </h3>
        <div className="flex flex-wrap gap-2">
          {insuranceNames.length > 0 ? (
            insuranceNames.map((ins, index) => (
              <span
                key={index}
                className="bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {ins}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-sm">No insurance information available</span>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-500">
          <span className="material-icons mr-1 text-base">location_on</span>
          <span className="font-medium">{getDistance()}</span>
          {isCalculatingDistance && (
            <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Open modal AND zoom to location
            if (onSelect) {
              onSelect(pharmacy); // This opens modal and zooms
            }
            
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
          }}
          className="text-purple-600 hover:text-purple-800 font-semibold text-sm flex items-center transition-colors"
        >
          View Details{" "}
          <span className="material-icons ml-1 text-base">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

const SearchResults = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [selectedPharmacyFromCard, setSelectedPharmacyFromCard] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPharmacies, setFilteredPharmacies] = useState([]);
  const [insuranceFilter, setInsuranceFilter] = useState("");
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

  // Get insurance filter from URL params
  useEffect(() => {
    const insurance = searchParams.get('insurance');
    if (insurance) {
      setInsuranceFilter(insurance);
      setSearchQuery(insurance); // Pre-fill search with insurance
    }
  }, [searchParams]);

  // Calculate driving distances when user location or pharmacies change
  useEffect(() => {
    if (userLocation && pharmacies.length > 0) {
      calculateMultipleDistances(userLocation, pharmacies);
    }
  }, [userLocation, pharmacies, calculateMultipleDistances]);

  // Fetch pharmacies from API
  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/pharmacies");
      setPharmacies(response.data);
      setFilteredPharmacies(response.data);
    } catch (err) {
      console.error("Error fetching pharmacies:", err);
      setError("Failed to fetch pharmacies. Please try again later.");
      // Set fallback data if API fails
      const fallbackData = [
        {
          id: 1,
          pharmacy_name: "Pamella Pharmacy",
          location: "Muhanga, Nyamabuye",
          insurances: ["RSSB", "MMI", "RADIANT"],
          is_open: true,
          latitude: -2.5958,
          longitude: 29.7558,
        },
        {
          id: 2,
          pharmacy_name: "PharmaBest Pharmacy",
          location: "Huye, Ngoma",
          insurances: ["RSSB", "MMI", "RADIANT", "UR"],
          is_open: true,
          latitude: -2.6033,
          longitude: 29.7431,
        },
        {
          id: 3,
          pharmacy_name: "Dynamic Pharmacy",
          location: "Gasabo, Zindiro",
          insurances: ["RSSB", "PRIME", "BRITAM"],
          is_open: false,
          latitude: -1.9441,
          longitude: 30.0619,
        },
        {
          id: 4,
          pharmacy_name: "City Center Pharmacy",
          location: "Kigali, Downtown",
          insurances: ["Cigna", "Humana", "Medicare"],
          is_open: true,
          latitude: -1.9441,
          longitude: 30.0619,
        }
      ];
      setPharmacies(fallbackData);
      setFilteredPharmacies(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  // Filter pharmacies based on search query and insurance filter
  useEffect(() => {
    let filtered = pharmacies;

    // First filter by insurance if specified
    if (insuranceFilter.trim()) {
      filtered = filtered.filter(pharmacy => {
        if (!pharmacy.insurances || !Array.isArray(pharmacy.insurances)) return false;
        
        return pharmacy.insurances.some(ins => {
          const insuranceName = typeof ins === 'object' && ins !== null && ins.name 
            ? ins.name.toLowerCase() 
            : String(ins).toLowerCase();
          return insuranceName.toLowerCase().includes(insuranceFilter.toLowerCase());
        });
      });
    }

         // Then filter by search query if specified
     if (searchQuery.trim()) {
       filtered = filtered.filter(pharmacy => {
         const query = searchQuery.toLowerCase();
         const nameMatch = (pharmacy.pharmacy_name || pharmacy.name)?.toLowerCase().includes(query);
         const locationMatch = pharmacy.location?.toLowerCase().includes(query);
         
         // Check insurance names (handle both object and string formats)
         const insuranceMatch = pharmacy.insurances?.some(ins => {
           const insuranceName = typeof ins === 'object' && ins !== null && ins.name 
             ? ins.name.toLowerCase() 
             : String(ins).toLowerCase();
           return insuranceName.includes(query);
         });

         return nameMatch || locationMatch || insuranceMatch;
       });
     }

    setFilteredPharmacies(filtered);
  }, [searchQuery, pharmacies, insuranceFilter]);

  const handlePharmacySelect = (pharmacy) => {
    console.log("Pharmacy selected from card:", pharmacy); // Debug log
    console.log("Pharmacy coordinates:", { 
      lat: pharmacy.latitude, 
      lng: pharmacy.longitude 
    }); // Debug log
    
    setSelectedPharmacy(pharmacy);
    setSelectedPharmacyFromCard(pharmacy); // This will trigger map zoom
    setShowModal(true);
    
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

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPharmacy(null);
  };

  // Handle get directions from modal - enable directions and select pharmacy
  const handleGetDirectionsFromModal = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setSelectedPharmacyFromCard(pharmacy);
    getDirectionsToPharmacy(pharmacy);
    setShowModal(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by useEffect above
  };

  if (loading) {
    return (
      <div className="p-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading search results...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Search Results
            </h1>
            <p className="text-gray-600 text-lg">
              {insuranceFilter ? (
                <>
                  Found {filteredPharmacies.length} pharmacies accepting <span className="font-semibold text-purple-600">{insuranceFilter}</span>
                </>
              ) : (
                `Found ${filteredPharmacies.length} pharmacies matching your criteria`
              )}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Results for</div>
            <div className="text-lg font-semibold text-gray-700">
              {user?.name || 'Patient'}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={handleSearch} className="flex space-x-4">
          <div className="flex-1 relative">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              type="text"
              placeholder="Search pharmacies by name, location, or insurance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={!searchQuery.trim()}
            className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 focus:outline-none transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed"
          >
            Search
          </button>
        </form>
        
        {/* Insurance Filter Display */}
        {insuranceFilter && (
          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="material-icons text-purple-600 mr-2">filter_list</span>
                <p className="text-purple-800 text-sm">
                  Filtering by insurance: <span className="font-semibold">{insuranceFilter}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setInsuranceFilter("");
                  setSearchQuery("");
                }}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                Clear Filter
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="material-icons text-red-600 mr-2">error</span>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side - results */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Pharmacies</h2>
            <span className="text-sm text-gray-500">
              {filteredPharmacies.length} found
            </span>
          </div>
          
          {filteredPharmacies.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-icons text-gray-400 text-4xl mb-2">search_off</span>
              <p className="text-gray-500">No pharmacies found matching your search</p>
            </div>
          ) : (
                         filteredPharmacies.map((pharmacy, index) => (
               <PharmacyCard 
                 key={pharmacy.id || index} 
                 pharmacy={pharmacy}
                 onSelect={handlePharmacySelect}
                 userLocation={userLocation}
                 drivingDistance={getCachedDistance(pharmacy)}
                 isCalculatingDistance={isCalculatingDistance(pharmacy)}
               />
             ))
          )}
        </div>

        {/* Right side - map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Pharmacy Locations</h3>
                  <p className="text-sm text-gray-600">
                    {filteredPharmacies.length} pharmacies shown on map
                  </p>
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
                  <button
                    onClick={toggleDirections}
                    disabled={isGettingLocation}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      showDirections
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } ${isGettingLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isGettingLocation ? 'Getting Location...' : !userLocation ? 'Enable Directions' : showDirections ? 'Hide Directions' : 'Show Directions'}
                  </button>
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
              onPharmacySelect={handlePharmacySelect}
              selectedPharmacyFromCard={selectedPharmacyFromCard}
              showDirections={showDirections}
              userLocation={userLocation}
              onUserLocationChange={(loc) => {
                setUserLocation(loc);
                if (showDirections && selectedPharmacyFromCard) {
                  setSelectedPharmacyFromCard({ ...selectedPharmacyFromCard });
                }
              }}
            />
          </div>
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
};

export default SearchResults;
