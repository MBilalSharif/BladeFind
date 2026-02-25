import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";
const api = axios.create({ baseURL: BASE_URL });

/* ─── Shops ──────────────────────────────────────────────────────────────── */
export const fetchNearbyShops = async (lat, lng, radius = 5000) => {
  const { data } = await api.get("/shops/nearby", { params: { lat, lng, radius } });
  return data;
};

export const searchShopsByText = async (query, radius = 5000) => {
  const { data } = await api.get("/shops/search", { params: { query, radius } });
  return data;
};

export const fetchShopDetails = async (placeId) => {
  const { data } = await api.get(`/shops/${placeId}/details`);
  return data;
};

export const getPhotoUrl = (photoReference, maxWidth = 600) =>
  `${BASE_URL}/shops/photo?photoReference=${encodeURIComponent(photoReference)}&maxWidth=${maxWidth}`;

/* ─── Reviews ────────────────────────────────────────────────────────────── */
export const fetchReviews = async (placeId) => {
  const { data } = await api.get(`/reviews/${placeId}`);
  return data;
};

export const submitReview = async (placeId, { authorName, rating, comment, shopName }) => {
  const { data } = await api.post(`/reviews/${placeId}`, { authorName, rating, comment, shopName });
  return data;
};

export const deleteReview = async (reviewId) => {
  const { data } = await api.delete(`/reviews/${reviewId}`);
  return data;
};
