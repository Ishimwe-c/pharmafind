import React, { useCallback, useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { useGoogleMaps } from '../context/GoogleMapsContext';

// Error boundary component for Google Maps
class MapsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Google Maps Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-96 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
          <div className="text-center text-red-600">
            <span className="material-icons text-4xl mb-2">error</span>
            <p className="font-medium">Map failed to load</p>
            <p className="text-sm mt-1">Please refresh the page and try again</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const PatientMap = ({ pharmacies = [], selectedInsurance = '', onPharmacySelect, selectedPharmacyFromCard = null, showDirections = false, userLocation = null, onUserLocationChange }) => {
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [map, setMap] = useState(null);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [directions, setDirections] = useState(null);
  const [directionsLoading, setDirectionsLoading] = useState(false);
  const selectedPharmacyRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const { isLoaded, loadError } = useGoogleMaps();

  // Sync selectedPharmacyFromCard with internal selectedPharmacy state
  useEffect(() => {
    if (selectedPharmacyFromCard) {
      setSelectedPharmacy(selectedPharmacyFromCard);
      selectedPharmacyRef.current = selectedPharmacyFromCard;
      setShowInfoWindow(false);
    }
  }, [selectedPharmacyFromCard]);

  // Initialize directions service when map loads
  useEffect(() => {
    if (isLoaded && window.google && map) {
      directionsServiceRef.current = new window.google.maps.DirectionsService();
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#8B5CF6',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });
      directionsRendererRef.current.setMap(map);
    }
  }, [isLoaded, map]);

  // Calculate directions when needed
  useEffect(() => {
    if (showDirections && userLocation && selectedPharmacy && directionsServiceRef.current && directionsRendererRef.current) {
      calculateDirections();
    } else if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections(null);
      setDirections(null);
    }
  }, [showDirections, userLocation, selectedPharmacy]);

  const calculateDirections = useCallback(async () => {
    if (!directionsServiceRef.current || !userLocation || !selectedPharmacy) return;

    const pharmacyCoords = selectedPharmacy.latitude && selectedPharmacy.longitude 
      ? { lat: parseFloat(selectedPharmacy.latitude), lng: parseFloat(selectedPharmacy.longitude) }
      : null;

    if (!pharmacyCoords) {
      setError('Pharmacy location not available');
      return;
    }

    setDirectionsLoading(true);
    setError(null);

    const request = {
      origin: userLocation,
      destination: pharmacyCoords,
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.IMPERIAL,
      avoidHighways: false,
      avoidTolls: false
    };

    try {
      const result = await new Promise((resolve, reject) => {
        directionsServiceRef.current.route(request, (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            resolve(result);
          } else {
            reject(new Error(`Directions failed: ${status}`));
          }
        });
      });

      setDirections(result);
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setDirections(result);
      }
    } catch (err) {
      setError('Failed to get directions. Please try again.');
    } finally {
      setDirectionsLoading(false);
    }
  }, [userLocation, selectedPharmacy]);

  // Handle marker click
  const handleMarkerClick = (pharmacy) => {
    try {
      setSelectedPharmacy(pharmacy);
      selectedPharmacyRef.current = pharmacy;
      setShowInfoWindow(true);
    } catch (err) {
      console.error('Error handling marker click:', err);
      setError('Failed to show pharmacy details');
    }
  };

  // Handle info window close
  const handleInfoWindowClose = () => {
    setShowInfoWindow(false);
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const mapContainer = document.getElementById('patient-map-container');
      if (mapContainer) {
        if (mapContainer.requestFullscreen) {
          mapContainer.requestFullscreen();
        } else if (mapContainer.webkitRequestFullscreen) {
          mapContainer.webkitRequestFullscreen();
        } else if (mapContainer.msRequestFullscreen) {
          mapContainer.msRequestFullscreen();
        }
        setIsFullscreen(true);
        
        // Center on selected pharmacy when entering fullscreen
        const pharmacy = selectedPharmacy || selectedPharmacyFromCard;
        if (pharmacy && map) {
          setTimeout(() => {
            const pharmacyCoords = pharmacy.latitude && pharmacy.longitude 
              ? { lat: parseFloat(pharmacy.latitude), lng: parseFloat(pharmacy.longitude) }
              : null;
            
            if (pharmacyCoords) {
              map.setCenter(pharmacyCoords);
              map.setZoom(16);
            }
          }, 200);
        }
      }
    } else {
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
      
      // Restore selectedPharmacy state after fullscreen transition
      if (isCurrentlyFullscreen && selectedPharmacyRef.current && !selectedPharmacy) {
        setSelectedPharmacy(selectedPharmacyRef.current);
      }
      
      // Center on selected pharmacy when entering fullscreen
      const pharmacy = selectedPharmacy || selectedPharmacyFromCard || selectedPharmacyRef.current;
      if (isCurrentlyFullscreen && pharmacy && map) {
        setTimeout(() => {
          const pharmacyCoords = pharmacy.latitude && pharmacy.longitude 
            ? { lat: parseFloat(pharmacy.latitude), lng: parseFloat(pharmacy.longitude) }
            : null;
          
          if (pharmacyCoords) {
            map.setCenter(pharmacyCoords);
            map.setZoom(16);
          }
        }, 300);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
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
  }, [isFullscreen, selectedPharmacy, selectedPharmacyFromCard, map]);

  // Additional effect to ensure selectedPharmacy persists during fullscreen
  useEffect(() => {
    if (isFullscreen && selectedPharmacyRef.current && !selectedPharmacy) {
      const timer = setTimeout(() => {
        setSelectedPharmacy(selectedPharmacyRef.current);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isFullscreen, selectedPharmacy]);

  // Effect to center on selected pharmacy when entering fullscreen
  useEffect(() => {
    if (isFullscreen && map) {
      const pharmacy = selectedPharmacy || selectedPharmacyFromCard || selectedPharmacyRef.current;
      if (pharmacy) {
        const attempts = [100, 300, 500, 1000];
        
        attempts.forEach((delay) => {
          setTimeout(() => {
            const pharmacyCoords = pharmacy.latitude && pharmacy.longitude 
              ? { lat: parseFloat(pharmacy.latitude), lng: parseFloat(pharmacy.longitude) }
              : null;
            
            if (pharmacyCoords && map) {
              map.setCenter(pharmacyCoords);
              map.setZoom(16);
            }
          }, delay);
        });
      }
    }
  }, [isFullscreen, map, selectedPharmacy, selectedPharmacyFromCard]);

  // Auto-zoom to selected pharmacy from card and scroll into view
  useEffect(() => {
    if (selectedPharmacyFromCard && map) {
      const position = selectedPharmacyFromCard.latitude && selectedPharmacyFromCard.longitude
        ? {
          lat: parseFloat(selectedPharmacyFromCard.latitude),
          lng: parseFloat(selectedPharmacyFromCard.longitude)
          }
        : {
            lat: -1.9441 + (Math.sin(selectedPharmacyFromCard.id || 0) * 0.05),
            lng: 30.0619 + (Math.cos(selectedPharmacyFromCard.id || 0) * 0.05)
          };
      
      map.panTo(position);
      map.setZoom(16);
      setSelectedPharmacy(selectedPharmacyFromCard);
      selectedPharmacyRef.current = selectedPharmacyFromCard;
      
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
    }
  }, [selectedPharmacyFromCard, map]);

  // Handle custom zoom events from card clicks
  useEffect(() => {
    const handlePharmacyZoom = (event) => {
      const { pharmacy, openModal } = event.detail;
      if (map && pharmacy) {
        const position = pharmacy.latitude && pharmacy.longitude
          ? {
            lat: parseFloat(pharmacy.latitude),
            lng: parseFloat(pharmacy.longitude)
            }
          : {
              lat: -1.9441 + (Math.sin(pharmacy.id || 0) * 0.05),
              lng: 30.0619 + (Math.cos(pharmacy.id || 0) * 0.05)
            };
        
        map.panTo(position);
        map.setZoom(16);
        
        if (openModal) {
          setSelectedPharmacy(pharmacy);
          selectedPharmacyRef.current = pharmacy;
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
      }
    };

    window.addEventListener('pharmacyZoom', handlePharmacyZoom);
    return () => {
      window.removeEventListener('pharmacyZoom', handlePharmacyZoom);
    };
  }, [map]);

      // Default center (Rwanda)
      const defaultCenter = { lat: -1.9441, lng: 30.0619 };
      
  // Map container style
  const mapContainerStyle = {
    width: '100%',
    height: '100%'
  };

  // Map options
  const mapOptions = {
        styles: [
          {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
          }
    ],
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
    scaleControl: true,
    rotateControl: false,
    clickableIcons: true
  };

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  // Show error if there's a load error from the provider
  if (loadError) {
    return (
      <div className="w-full h-96 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
        <div className="text-center text-red-600">
          <span className="material-icons text-4xl mb-2">error</span>
          <p className="font-medium">Failed to load Google Maps</p>
          <p className="text-sm mt-1">Please check your API key and internet connection</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (!isLoaded) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <MapsErrorBoundary>
      <div 
        id="patient-map-container"
        className={`relative w-full h-96 rounded-lg overflow-hidden border border-gray-200 ${
          isFullscreen ? 'fixed inset-0 z-50 h-screen' : ''
        }`}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={12}
          options={mapOptions}
          onLoad={onMapLoad}
          onClick={() => setShowInfoWindow(false)}
        >
          {/* User location marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" fill="white"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(24, 24),
                anchor: new window.google.maps.Point(12, 12)
              }}
              title="Your Location"
            />
          )}

          {/* Pharmacy markers */}
          {pharmacies.map((pharmacy, index) => {
            const position = pharmacy.latitude && pharmacy.longitude
              ? {
                lat: parseFloat(pharmacy.latitude),
                lng: parseFloat(pharmacy.longitude)
                }
              : {
                  lat: -1.9441 + (Math.sin(pharmacy.id || index) * 0.05),
                  lng: 30.0619 + (Math.cos(pharmacy.id || index) * 0.05)
                };

            const isSelected = selectedPharmacy && selectedPharmacy.id === pharmacy.id;
            const isOpen = pharmacy.is_open !== undefined ? pharmacy.is_open : pharmacy.isOpen;

            return (
              <Marker
                key={pharmacy.id || index}
                position={position}
                onClick={() => handleMarkerClick(pharmacy)}
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="14" fill="${isOpen ? '#10B981' : '#EF4444'}" stroke="white" stroke-width="2"/>
                      <path d="M16 8C12.6863 8 10 10.6863 10 14C10 17.3137 12.6863 20 16 20C19.3137 20 22 17.3137 22 14C22 10.6863 19.3137 8 16 8Z" fill="white"/>
                      <circle cx="16" cy="14" r="3" fill="${isOpen ? '#10B981' : '#EF4444'}"/>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(32, 32),
                  anchor: new window.google.maps.Point(16, 16)
                }}
                title={pharmacy.pharmacy_name || pharmacy.name}
              />
            );
          })}

          {/* Info Window for selected pharmacy */}
          {selectedPharmacy && showInfoWindow && (
            <InfoWindow
              position={(() => {
                if (selectedPharmacy.latitude && selectedPharmacy.longitude) {
                  return {
                    lat: parseFloat(selectedPharmacy.latitude),
                    lng: parseFloat(selectedPharmacy.longitude)
                  };
                } else {
                  const seed = selectedPharmacy.id || selectedPharmacy.pharmacy_name?.length || 0;
                  return {
                    lat: -1.9441 + (Math.sin(seed) * 0.05),
                    lng: 30.0619 + (Math.cos(seed) * 0.05)
                  };
                }
              })()}
              onCloseClick={handleInfoWindowClose}
            >
              <div className="p-3 max-w-xs">
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  {selectedPharmacy.pharmacy_name || selectedPharmacy.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  <span className="material-icons text-sm mr-1">location_on</span>
                  {selectedPharmacy.location || selectedPharmacy.address}
                </p>
                <p className="text-sm mb-2">
                  <span className="material-icons text-sm mr-1">watch_later</span>
                  <span className={`${selectedPharmacy.is_open || selectedPharmacy.isOpen ? 'text-green-600' : 'text-red-600'} font-medium`}>
                    {selectedPharmacy.is_open || selectedPharmacy.isOpen ? 'Open' : 'Closed'}
                  </span>
                </p>
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Accepted Insurances:</p>
                  <div className="flex flex-wrap gap-1">
                    {(selectedPharmacy.insurances || []).map((ins, idx) => {
                      const insuranceName = typeof ins === 'object' && ins !== null && ins.name ? ins.name : String(ins);
                      return (
                        <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {insuranceName}
                        </span>
                      );
                    })}
                  </div>
                </div>
        <button
                  onClick={() => {
                    if (onPharmacySelect) {
                      onPharmacySelect(selectedPharmacy);
                    }
                    handleInfoWindowClose();
                  }}
                  className="w-full bg-purple-600 text-white text-sm py-2 px-3 rounded hover:bg-purple-700 transition-colors"
                >
                  View Details
        </button>
      </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {/* Fullscreen toggle button */}
        <div className="absolute top-4 right-4 z-10">
          <div className="relative group">
            <button
              onClick={toggleFullscreen}
              className="px-3 py-2 rounded-lg shadow-md border transition-colors duration-200 flex items-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
              title={
                isFullscreen 
                  ? "Exit fullscreen (Esc)" 
                  : "Enter fullscreen (F11)"
              }
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
        </div>

        {/* Fullscreen indicator */}
        {isFullscreen && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm">
            <div className="flex items-center space-x-2">
              <span className="material-icons text-sm">fullscreen</span>
              <span>
                {selectedPharmacy || selectedPharmacyRef.current 
                  ? `Viewing: ${(selectedPharmacy || selectedPharmacyRef.current).pharmacy_name || (selectedPharmacy || selectedPharmacyRef.current).name || 'Selected Pharmacy'}`
                  : 'Fullscreen Mode - Press Esc to exit'
                }
              </span>
            </div>
          </div>
        )}

        {/* No pharmacy selected indicator */}
        {!isFullscreen && !(selectedPharmacy || selectedPharmacyFromCard || selectedPharmacyRef.current) && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
            <div className="flex items-center space-x-2">
              <span className="material-icons text-sm">touch_app</span>
              <span>Click on a pharmacy marker or card to select it</span>
            </div>
          </div>
        )}

        {/* Directions loading indicator */}
        {directionsLoading && (
          <div className="absolute top-4 left-4 z-10 bg-white px-3 py-2 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
              <span className="text-sm text-gray-600">Calculating directions...</span>
            </div>
          </div>
        )}

        {/* Directions summary */}
        {directions && showDirections && (
          <div className="absolute bottom-4 left-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">Directions to {selectedPharmacy?.pharmacy_name}</h4>
                <p className="text-sm text-gray-600">
                  {directions.routes[0]?.legs[0]?.distance?.text} • {directions.routes[0]?.legs[0]?.duration?.text}
                </p>
          </div>
              <button
                onClick={() => {
                  const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedPharmacy.latitude},${selectedPharmacy.longitude}`;
                  window.open(url, '_blank');
                }}
                className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
              >
                Open in Maps
              </button>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="absolute bottom-4 left-4 right-4 z-10 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <span className="material-icons text-red-500 mr-2">error</span>
              <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}
    </div>
    </MapsErrorBoundary>
  );
};

export default PatientMap;