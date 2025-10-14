import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { GoogleMap, Marker, Autocomplete, Circle } from "@react-google-maps/api";
import { useGoogleMaps } from "../../context/GoogleMapsContext";
import geolocationService from "../../services/geolocationService";

const RegisterPharmacy = () => {
  const { register } = useContext(AuthContext);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { isLoaded, loadError } = useGoogleMaps();
  const [insuranceOptions, setInsuranceOptions] = useState([]);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    pharmacyName: "",
    location: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    insurances: [],
    latitude: "",
    longitude: ""
  });

  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" }
  ];

  const [workingHours, setWorkingHours] = useState(
    days.reduce((acc, day) => {
      acc[day.key] = { open: "09:00", close: "17:00", closed: false };
      return acc;
    }, {})
  );

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [accuracyCircle, setAccuracyCircle] = useState(null);
  const [locationProgress, setLocationProgress] = useState(null);
  const autocompleteRef = useRef(null);
  const mapContainerStyle = { height: "300px", width: "100%" };
  const mapCenter = selectedLocation || { lat: 40.7128, lng: -74.0060 };

  useEffect(() => {
    const fetchInsurances = async () => {
      try {
        const res = await fetch("/api/insurances");
        const data = await res.json();
        const options = data.map((ins) => ({ value: ins.id, label: ins.name }));
        setInsuranceOptions(options);
      } catch (error) {
        console.error("Error fetching insurances:", error);
      }
    };
    fetchInsurances();
  }, []);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInsuranceChange = (selectedOptions) => {
    setFormData({
      ...formData,
      insurances: selectedOptions ? selectedOptions.map((o) => o.value) : [],
    });
  };

  const handleWorkingHoursChange = (day, field, value) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setSelectedLocation({ lat, lng });
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    }));
  };

  const onMapLoad = (map) => {
    setMap(map);
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const location = { lat, lng };
        
        setSelectedLocation(location);
        setFormData((prev) => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
          location: place.formatted_address || place.name || ""
        }));
        
        // Clear the search input after selection
        setSearchValue(place.formatted_address || place.name || "");
        
        // Pan to the selected place
        if (map) {
          map.panTo(location);
          map.setZoom(15);
        }
      }
    }
  };

  const onAutocompleteLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
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
      addToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    try {
      setGettingLocation(true);
      setLocationProgress('Acquiring GPS signal...');
      
      // Use high-precision mode with multiple samples
      const position = await geolocationService.getHighPrecisionPosition(
        (current, total) => {
          setLocationProgress(`Reading GPS ${current}/${total}...`);
        }
      );
      
      const location = {
        lat: position.latitude,
        lng: position.longitude
      };
      
      setSelectedLocation(location);
      setLocationAccuracy(position.accuracy);
      
      setFormData((prev) => ({
        ...prev,
        latitude: position.latitude.toFixed(6),
        longitude: position.longitude.toFixed(6),
        location: `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`
      }));
      
      // Pan to current location
      if (map) {
        map.panTo(location);
        map.setZoom(18); // Closer zoom for current location
      }
      
      // Show accuracy-based message
      const quality = getAccuracyQuality(position.accuracy);
      addToast(
        `${quality.emoji} Location acquired with ${quality.label.toLowerCase()} accuracy (±${Math.round(position.accuracy)}m)`,
        position.accuracy <= 30 ? 'success' : 'info'
      );
      
      // Try to get address from coordinates using reverse geocoding
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: location }, (results, status) => {
          if (status === 'OK' && results[0]) {
            setFormData((prev) => ({
              ...prev,
              location: results[0].formatted_address
            }));
            setSearchValue(results[0].formatted_address);
          }
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      if (error.code === 1) {
        addToast('Location permission denied. Please enable location access in your browser settings.', 'error');
      } else {
        addToast('Could not get your current location. Please try again or use the search box.', 'error');
      }
    } finally {
      setGettingLocation(false);
      setLocationProgress(null);
    }
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }

    if (!selectedLocation) {
      addToast("Please set your pharmacy location on the map", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // 🔥 Normalize working hours to array of objects
      const formattedWorkingHours = days.map(({ key, label }) => {
        const wh = workingHours[key];
        const closed = !!wh.closed;

        return {
          day_of_week: label,                          // "Monday" ... "Sunday"
          open_time: closed ? null : (wh.open || null), // null if closed
          close_time: closed ? null : (wh.close || null),
          closed,
        };
      });

      const payload = {
        owner_name: formData.ownerName,
        owner_email: formData.ownerEmail,
        owner_phone: formData.ownerPhone,
        pharmacy_name: formData.pharmacyName,
        location: formData.location,
        email: formData.email,
        phone_number: formData.phone,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        insurances: formData.insurances,
        working_hours: formattedWorkingHours,
      };

      await register(payload, "pharmacy_owner");
      
      // Show success message
      addToast("Pharmacy registration successful! Please login to continue.", "success");
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);

    } catch (error) {
      console.error("Registration failed:", error);
      addToast(`Registration failed: ${error.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-6">Register Pharmacy</h1>

          {/* Stepper Navigation */}
          <div className="flex justify-between mb-8">
            {["Pharmacist", "Pharmacy", "Hours", "Location"].map((label, i) => (
              <div
                key={i}
                className={`flex-1 text-center ${
                  step === i + 1 ? "font-bold text-indigo-600" : "text-gray-400"
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Step 1: Owner Info */}
          {step === 1 && (
            <div className="space-y-6">
              <input type="text" name="ownerName" value={formData.ownerName} onChange={handleFormChange} placeholder="Pharmacist Name" className="w-full p-3 border rounded-lg" />
              <input type="email" name="ownerEmail" value={formData.ownerEmail} onChange={handleFormChange} placeholder="Pharmacist Email" className="w-full p-3 border rounded-lg" />
              <input type="tel" name="ownerPhone" value={formData.ownerPhone} onChange={handleFormChange} placeholder="Pharmacist Phone" className="w-full p-3 border rounded-lg" />
            </div>
          )}

          {/* Step 2: Pharmacy Details */}
          {step === 2 && (
            <div className="space-y-6">
              <input type="text" name="pharmacyName" value={formData.pharmacyName} onChange={handleFormChange} placeholder="Pharmacy Name" className="w-full p-3 border rounded-lg" />
              <input type="text" name="location" value={formData.location} onChange={handleFormChange} placeholder="Location Address" className="w-full p-3 border rounded-lg" />
              <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="Email" className="w-full p-3 border rounded-lg" />
              <input type="tel" name="phone" value={formData.phone} onChange={handleFormChange} placeholder="Phone Number" className="w-full p-3 border rounded-lg" />
              <Select isMulti options={insuranceOptions} onChange={handleInsuranceChange} placeholder="Select insurances..." />
              <input type="password" name="password" value={formData.password} onChange={handleFormChange} placeholder="Password" className="w-full p-3 border rounded-lg" />
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleFormChange} placeholder="Confirm Password" className="w-full p-3 border rounded-lg" />
            </div>
          )}

          {/* Step 3: Working Hours */}
          {step === 3 && (
            <div className="space-y-4">
              {days.map(({ key, label }) => (
                <div key={key} className="grid grid-cols-4 gap-2 items-center">
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={workingHours[key].closed}
                    onChange={(e) =>
                      handleWorkingHoursChange(key, "closed", e.target.checked)
                    }
                  />
                  <input
                    type="time"
                    value={workingHours[key].open}
                    onChange={(e) =>
                      handleWorkingHoursChange(key, "open", e.target.value)
                    }
                    disabled={workingHours[key].closed}
                  />
                  <input
                    type="time"
                    value={workingHours[key].close}
                    onChange={(e) =>
                      handleWorkingHoursChange(key, "close", e.target.value)
                    }
                    disabled={workingHours[key].closed}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Location */}
          {step === 4 && (
            <div>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">📍 Set Your Pharmacy Location</h3>
                <p className="text-sm text-blue-700">
                  <strong>Search:</strong> Use the search box to find your pharmacy location by name or address.<br/>
                  <strong>Click:</strong> Click anywhere on the map to set your pharmacy's exact location.<br/>
                  <strong>Drag:</strong> Drag the marker to fine-tune the position.
                </p>
              </div>
              
              {loadError ? (
                <div className="w-full h-96 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
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
              ) : !isLoaded ? (
                <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading Google Maps...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Current Location Button */}
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={gettingLocation}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {gettingLocation ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>{locationProgress || 'Getting your location...'}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>📍 Use My Current Location</span>
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

                  <div className="relative flex items-center mb-4">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                  </div>

                  {/* Search Box */}
                  <div className="mb-4">
                    <Autocomplete
                      onLoad={onAutocompleteLoad}
                      onPlaceChanged={onPlaceChanged}
                      options={{
                        types: ['geocode'],
                        componentRestrictions: { country: 'rw' },
                        fields: ['place_id', 'geometry', 'name', 'formatted_address', 'address_components']
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Search for your pharmacy address or location..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </Autocomplete>
                    <p className="mt-2 text-sm text-gray-500">
                      💡 You can also click directly on the map to set your location
                    </p>
                  </div>

                  {/* Accuracy Display */}
                  {locationAccuracy && selectedLocation && (
                    <div className={`mb-4 p-3 rounded-lg border ${
                      locationAccuracy <= 30 
                        ? 'bg-green-50 border-green-200' 
                        : locationAccuracy <= 50
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getAccuracyQuality(locationAccuracy).emoji}</span>
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
                              Accurate within ±{Math.round(locationAccuracy)} meters
                            </p>
                          </div>
                        </div>
                        {locationAccuracy <= 30 && (
                          <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                            High Precision
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={13}
                    onClick={handleMapClick}
                    onLoad={onMapLoad}
                  >
                    {selectedLocation && (
                      <>
                        <Marker
                          position={selectedLocation}
                          draggable={true}
                          onDragEnd={(e) => {
                            const lat = e.latLng.lat();
                            const lng = e.latLng.lng();
                            setSelectedLocation({ lat, lng });
                            setLocationAccuracy(null); // Clear accuracy when manually adjusted
                            setFormData((prev) => ({
                              ...prev,
                              latitude: lat.toFixed(6),
                              longitude: lng.toFixed(6)
                            }));
                          }}
                        />
                        {/* Accuracy Circle */}
                        {locationAccuracy && (
                          <Circle
                            center={selectedLocation}
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
                      </>
                    )}
                  </GoogleMap>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                      <input type="text" name="latitude" value={formData.latitude} readOnly className="w-full p-3 border rounded-lg bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                      <input type="text" name="longitude" value={formData.longitude} readOnly className="w-full p-3 border rounded-lg bg-gray-50" />
                    </div>
                  </div>
                  {!selectedLocation && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <span className="font-medium">⚠️ Location not set:</span> Please click on the map to set your pharmacy's location before proceeding.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 bg-gray-200 rounded-lg"
              >
                Back
              </button>
            )}
            {step < 4 && (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Next
              </button>
            )}
            {step === 4 && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registering...
                  </div>
                ) : (
                  'Register Pharmacy'
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPharmacy;
  