const express = require("express");
const router = express.Router();
const { getReviews, addReview, deleteReview } = require("../controllers/reviewsController");
const { requireAuth, optionalAuth } = require("../middlewares/authMiddleware");

router.get("/:placeId", getReviews);
router.post("/:placeId", optionalAuth, addReview);   // guests can still review
router.delete("/:reviewId", requireAuth, deleteReview); // must be logged in to delete

module.exports = router;
