const mongoose = require("mongoose");

/**
 * BarberShop schema — used to cache Places API results in MongoDB.
 * This avoids repeated API calls for the same area and saves quota.
 */
const barberShopSchema = new mongoose.Schema(
  {
    placeId: {
      type: String,
      required: true,
      unique: true, // Google's unique place identifier
    },
    name: { type: String, required: true },
    address: { type: String },
    rating: { type: Number },
    userRatingsTotal: { type: Number },
    priceLevel: { type: Number },
    phoneNumber: { type: String },
    website: { type: String },
    photoReference: { type: String }, // Used to build Google photo URL
    isOpen: { type: Boolean },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    // GeoJSON for potential geospatial queries
    geoLocation: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number] }, // [lng, lat] — GeoJSON order
    },
    // Track when this cache entry was created so we can expire stale data
    cachedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Create a 2dsphere index for geospatial querying
barberShopSchema.index({ geoLocation: "2dsphere" });

module.exports = mongoose.model("BarberShop", barberShopSchema);
