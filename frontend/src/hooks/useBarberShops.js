import { useState, useCallback } from "react";
import { fetchNearbyShops, searchShopsByText } from "../api/shopsApi";

const useBarberShops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchCenter, setSearchCenter] = useState(null);

  const searchByCoords = useCallback(async (lat, lng, radius = 5000) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchNearbyShops(lat, lng, radius);
      setShops(result.data || []);
      setSearchCenter({ lat, lng });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch nearby shops.");
      setShops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchByText = useCallback(async (query, radius = 5000) => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchShopsByText(query, radius);
      setShops(result.data || []);
      if (result.data?.length > 0) setSearchCenter(result.data[0].location);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to search shops.");
      setShops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { shops, loading, error, searchCenter, searchByCoords, searchByText };
};

export default useBarberShops;
