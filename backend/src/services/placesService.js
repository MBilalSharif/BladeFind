const axios = require("axios");
const BarberShop = require("../models/BarberShop");

const PLACES_BASE_URL = "https://maps.googleapis.com/maps/api/place";
const CACHE_TTL_HOURS = 12; // Re-fetch from Google if cache is older than this

/**
 * Fetches nearby barber shops from Google Places API (Nearby Search).
 * @param {number} lat - Latitude of the search center
 * @param {number} lng - Longitude of the search center
 * @param {number} radius - Search radius in meters (default 5000)
 * @returns {Array} Array of formatted barber shop objects
 */
const fetchNearbyBarberShops = async (lat, lng, radius = 5000) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  // Check MongoDB cache first — valid if cached within TTL
  const cacheExpiry = new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000);

  const cached = await BarberShop.find({
    cachedAt: { $gte: cacheExpiry },
    geoLocation: {
      $nearSphere: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: radius,
      },
    },
  }).limit(20);

  if (cached.length > 0) {
    console.log(`📦 Returning ${cached.length} shops from cache`);
    return formatShopsFromDB(cached);
  }

  // No cache hit — call Google Places Nearby Search API
  console.log("🌐 Fetching from Google Places API...");
  const response = await axios.get(`${PLACES_BASE_URL}/nearbysearch/json`, {
    params: {
      location: `${lat},${lng}`,
      radius,
      type: "hair_care",          // Covers barber shops + salons
      keyword: "barber",          // Narrow results to barber-specific
      key: apiKey,
    },
  });

  if (response.data.status !== "OK" && response.data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Places API error: ${response.data.status}`);
  }

  const results = response.data.results || [];

  // Save each result to MongoDB cache (upsert by placeId)
  const savePromises = results.map((place) => upsertShop(place));
  await Promise.allSettled(savePromises); // Don't fail if one save errors

  return results.map(formatShopFromGoogle);
};

/**
 * Searches Google Places by text query (e.g. "barbers in Lahore").
 * Used when the user types a location manually.
 * @param {string} query - Text search query
 * @param {number} radius - Search radius in meters
 * @returns {Array} Array of formatted barber shop objects
 */
const searchBarberShopsByText = async (query, radius = 5000) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  const response = await axios.get(`${PLACES_BASE_URL}/textsearch/json`, {
    params: {
      query: `barber shops near ${query}`,
      type: "hair_care",
      radius,
      key: apiKey,
    },
  });

  if (response.data.status !== "OK" && response.data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Places API error: ${response.data.status}`);
  }

  const results = response.data.results || [];
  const savePromises = results.map((place) => upsertShop(place));
  await Promise.allSettled(savePromises);

  return results.map(formatShopFromGoogle);
};

/**
 * Upserts a Google Place result into MongoDB.
 * Uses placeId as the unique key to avoid duplicates.
 */
const upsertShop = async (place) => {
  const lat = place.geometry?.location?.lat;
  const lng = place.geometry?.location?.lng;

  await BarberShop.findOneAndUpdate(
    { placeId: place.place_id },
    {
      placeId: place.place_id,
      name: place.name,
      address: place.vicinity || place.formatted_address,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      priceLevel: place.price_level,
      photoReference: place.photos?.[0]?.photo_reference || null,
      isOpen: place.opening_hours?.open_now,
      location: { lat, lng },
      geoLocation: {
        type: "Point",
        coordinates: [lng, lat], // GeoJSON: [longitude, latitude]
      },
      cachedAt: new Date(),
    },
    { upsert: true, new: true }
  );
};

/**
 * Formats a raw Google Places API result into our app's shape.
 */
const formatShopFromGoogle = (place) => ({
  placeId: place.place_id,
  name: place.name,
  address: place.vicinity || place.formatted_address,
  rating: place.rating || null,
  userRatingsTotal: place.user_ratings_total || 0,
  priceLevel: place.price_level || null,
  isOpen: place.opening_hours?.open_now ?? null,
  photoReference: place.photos?.[0]?.photo_reference || null,
  location: {
    lat: place.geometry?.location?.lat,
    lng: place.geometry?.location?.lng,
  },
});

/**
 * Formats a MongoDB document (cached shop) into our app's shape.
 */
const formatShopsFromDB = (shops) =>
  shops.map((shop) => ({
    placeId: shop.placeId,
    name: shop.name,
    address: shop.address,
    rating: shop.rating,
    userRatingsTotal: shop.userRatingsTotal,
    priceLevel: shop.priceLevel,
    isOpen: shop.isOpen,
    photoReference: shop.photoReference,
    location: shop.location,
  }));

module.exports = { fetchNearbyBarberShops, searchBarberShopsByText };
