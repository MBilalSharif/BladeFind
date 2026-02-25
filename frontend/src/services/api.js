import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * Fetch nearby barber shops by coordinates.
 * @param {number} lat
 * @param {number} lng
 * @param {number} radius - in meters
 */
export const fetchShopsByCoords = async (lat, lng, radius = 5000) => {
  const res = await axios.get(`${API_BASE}/shops/nearby`, {
    params: { lat, lng, radius },
  });
  return res.data;
};

/**
 * Fetch shops by a text address.
 * @param {string} address
 * @param {number} radius - in meters
 */
export const fetchShopsByAddress = async (address, radius = 5000) => {
  const res = await axios.get(`${API_BASE}/shops/search`, {
    params: { address, radius },
  });
  return res.data;
};
