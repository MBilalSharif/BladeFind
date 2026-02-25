const axios = require("axios");
const Review = require("../models/Review");
const {
  fetchNearbyBarberShops,
  searchBarberShopsByText,
} = require("../services/placesService");

const PLACES_BASE_URL = "https://maps.googleapis.com/maps/api/place";

/**
 * GET /api/shops/nearby
 */
const getNearbyShops = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) return res.status(400).json({ success: false, message: "lat and lng are required." });

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const parsedRadius = parseInt(radius) || 5000;

    if (isNaN(parsedLat) || isNaN(parsedLng))
      return res.status(400).json({ success: false, message: "lat and lng must be valid numbers." });

    const shops = await fetchNearbyBarberShops(parsedLat, parsedLng, parsedRadius);
    return res.status(200).json({ success: true, count: shops.length, data: shops });
  } catch (error) {
    console.error("❌ getNearbyShops:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch nearby shops.", error: error.message });
  }
};

/**
 * GET /api/shops/search
 */
const searchShops = async (req, res) => {
  try {
    const { query, radius } = req.query;
    if (!query?.trim()) return res.status(400).json({ success: false, message: "query is required." });

    const shops = await searchBarberShopsByText(query.trim(), parseInt(radius) || 5000);
    return res.status(200).json({ success: true, count: shops.length, data: shops });
  } catch (error) {
    console.error("❌ searchShops:", error.message);
    return res.status(500).json({ success: false, message: "Failed to search shops.", error: error.message });
  }
};

/**
 * GET /api/shops/:placeId/details
 * Fetches full Place Details from Google including ALL photos, phone, website,
 * opening hours, and reviews from Google. Also attaches our own review count.
 */
const getShopDetails = async (req, res) => {
  try {
    const { placeId } = req.params;
    if (!placeId) return res.status(400).json({ success: false, message: "placeId is required." });

    const response = await axios.get(`${PLACES_BASE_URL}/details/json`, {
      params: {
        place_id: placeId,
        fields: [
          "name", "rating", "user_ratings_total", "formatted_address",
          "formatted_phone_number", "website", "opening_hours",
          "photos", "price_level", "editorial_summary", "types",
          "geometry", "reviews", "url",
        ].join(","),
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status !== "OK") {
      return res.status(404).json({ success: false, message: `Google Places error: ${response.data.status}` });
    }

    const place = response.data.result;

    // Count our own DB reviews for this shop
    const ourReviewCount = await Review.countDocuments({ placeId });

    const details = {
      placeId,
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number || null,
      website: place.website || null,
      rating: place.rating || null,
      userRatingsTotal: place.user_ratings_total || 0,
      priceLevel: place.price_level ?? null,
      isOpen: place.opening_hours?.open_now ?? null,
      openingHours: place.opening_hours?.weekday_text || [],
      description: place.editorial_summary?.overview || null,
      types: place.types || [],
      googleMapsUrl: place.url || null,
      location: {
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng,
      },
      // All photo references (up to 10)
      photos: (place.photos || []).slice(0, 10).map((p) => ({
        reference: p.photo_reference,
        width: p.width,
        height: p.height,
      })),
      // Google's own reviews (up to 5)
      googleReviews: (place.reviews || []).map((r) => ({
        authorName: r.author_name,
        rating: r.rating,
        text: r.text,
        relativeTime: r.relative_time_description,
        profilePhoto: r.profile_photo_url,
      })),
      ourReviewCount,
    };

    return res.status(200).json({ success: true, data: details });
  } catch (error) {
    console.error("❌ getShopDetails:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch shop details.", error: error.message });
  }
};

/**
 * GET /api/shops/photo
 * Streams a Google Place photo through our server (avoids CORS & hides API key).
 */
const getShopPhoto = async (req, res) => {
  try {
    const { photoReference, maxWidth = 800 } = req.query;
    if (!photoReference) return res.status(400).json({ success: false, message: "photoReference is required." });

    const googlePhotoUrl = `${PLACES_BASE_URL}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    const response = await axios.get(googlePhotoUrl, {
      responseType: "stream",
      timeout: 12000,
      maxRedirects: 5,
    });

    res.set("Content-Type", response.headers["content-type"] || "image/jpeg");
    res.set("Cache-Control", "public, max-age=86400");
    res.set("Access-Control-Allow-Origin", "*");
    response.data.pipe(res);
    response.data.on("error", () => { if (!res.headersSent) res.status(500).end(); });
  } catch (error) {
    console.error("❌ getShopPhoto:", error.message);
    if (!res.headersSent) res.status(500).json({ success: false, message: "Failed to fetch photo." });
  }
};

module.exports = { getNearbyShops, searchShops, getShopDetails, getShopPhoto };
