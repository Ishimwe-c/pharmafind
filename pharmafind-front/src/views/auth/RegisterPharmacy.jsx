import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { GoogleMap, Marker, Autocomplete } from "@react-google-maps/api";
import { useGoogleMaps } from "../../context/GoogleMapsContext";

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
            {["Owner", "Pharmacy", "Hours", "Location"].map((label, i) => (
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
              <input type="text" name="ownerName" value={formData.ownerName} onChange={handleFormChange} placeholder="Owner Name" className="w-full p-3 border rounded-lg" />
              <input type="email" name="ownerEmail" value={formData.ownerEmail} onChange={handleFormChange} placeholder="Owner Email" className="w-full p-3 border rounded-lg" />
              <input type="tel" name="ownerPhone" value={formData.ownerPhone} onChange={handleFormChange} placeholder="Owner Phone" className="w-full p-3 border rounded-lg" />
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
                  </div>
                  
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={13}
                    onClick={handleMapClick}
                    onLoad={onMapLoad}
                  >
                    {selectedLocation && (
                      <Marker
                        position={selectedLocation}
                        draggable={true}
                        onDragEnd={(e) => {
                          const lat = e.latLng.lat();
                          const lng = e.latLng.lng();
                          setSelectedLocation({ lat, lng });
                          setFormData((prev) => ({
                            ...prev,
                            latitude: lat.toFixed(6),
                            longitude: lng.toFixed(6)
                          }));
                        }}
                      />
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
  