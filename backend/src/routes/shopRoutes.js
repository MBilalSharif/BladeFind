const express = require("express");
const router = express.Router();
const { getNearbyShops, searchShops, getShopDetails, getShopPhoto } = require("../controllers/shopsController");

router.get("/nearby", getNearbyShops);
router.get("/search", searchShops);
router.get("/photo", getShopPhoto);
router.get("/:placeId/details", getShopDetails);

module.exports = router;
