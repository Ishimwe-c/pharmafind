// Small reusable hook for Google Maps pickers.
// - Keeps map state/handlers out of forms.
// - Exposes a selected marker + helpers to update lat/lng in parent forms.

import { useState } from "react";

export default function useGoogleMap(defaultCenter = { lat: -1.9706, lng: 30.1044 }) {
  // Marker the user selects
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Map container size
  const mapContainerStyle = { width: "100%", height: "320px" };

  // When user clicks on the map, update marker + parent form's lat/lng
  const handleMapClick = (e, setFormData) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setSelectedLocation({ lat, lng });

    if (setFormData) {
      setFormData((prev) => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
      }));
    }
  };

  // When user drags the marker, also update form lat/lng
  const handleMarkerDragEnd = (e, setFormData) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setSelectedLocation({ lat, lng });

    if (setFormData) {
      setFormData((prev) => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
      }));
    }
  };

  return {
    mapContainerStyle,
    mapCenter: defaultCenter,
    selectedLocation,
    setSelectedLocation,
    handleMapClick,
    handleMarkerDragEnd,
  };
}
