const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    placeId:     { type: String, required: true, index: true },
    shopName:    { type: String, required: true },
    authorName:  { type: String, required: true, trim: true, maxlength: 60 },
    rating:      { type: Number, required: true, min: 1, max: 5 },
    comment:     { type: String, required: true, trim: true, maxlength: 800 },
    avatarColor: { type: String, default: "#2dd4bf" },
    // Auth fields — null for guest reviews
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    userAvatar:  { type: String, default: null }, // Google profile photo
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
