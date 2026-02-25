const Review = require("../models/Review");

const AVATAR_COLORS = [
  "#2dd4bf", "#06b6d4", "#3b82f6", "#8b5cf6",
  "#ec4899", "#f59e0b", "#10b981", "#f97316",
];
const colorForName = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

/** GET /api/reviews/:placeId */
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ placeId: req.params.placeId })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch reviews." });
  }
};

/** POST /api/reviews/:placeId */
const addReview = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { authorName, rating, comment, shopName } = req.body;

    if (!authorName?.trim() || !comment?.trim() || !shopName?.trim())
      return res.status(400).json({ success: false, message: "authorName, comment and shopName are required." });
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ success: false, message: "rating must be 1–5." });

    const review = await Review.create({
      placeId,
      shopName: shopName.trim(),
      authorName: authorName.trim(),
      rating: Number(rating),
      comment: comment.trim(),
      avatarColor: colorForName(authorName.trim()),
      // If authenticated, store userId so they can delete their own reviews later
      userId: req.user?.userId || null,
      userAvatar: req.user?.avatar || null,
    });

    return res.status(201).json({ success: true, data: review });
  } catch (err) {
    console.error("❌ addReview:", err.message);
    return res.status(500).json({ success: false, message: "Failed to submit review." });
  }
};

/** DELETE /api/reviews/:reviewId */
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });

    // Only the author or an admin can delete
    if (review.userId && req.user?.userId !== review.userId.toString() && req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this review." });
    }

    await review.deleteOne();
    return res.status(200).json({ success: true, message: "Review deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to delete review." });
  }
};

module.exports = { getReviews, addReview, deleteReview };
