import { useState } from "react";

/**
 * Custom hook to get the user's current geolocation via the browser API.
 * Handles permission denied and other errors gracefully.
 */
const useGeolocation = () => {
  const [location, setLocation] = useState(null); // { lat, lng }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLocation = () => {
    // Check if Geolocation API is available
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        // Handle different error codes from the Geolocation API
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Location access denied. Please enable location permissions in your browser.");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location information is unavailable. Try entering your address manually.");
            break;
          case err.TIMEOUT:
            setError("Location request timed out. Please try again.");
            break;
          default:
            setError("An unknown error occurred getting your location.");
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Cache position for 1 minute
      }
    );
  };

  return { location, loading, error, getLocation };
};

export default useGeolocation;
