const express = require("express");
const auctionController = require("./../controller/auctionController");

const router = express.Router();

// router
//   .route("/live-auctions")
//   .get(auctionController.aliasLiveAuctions, auctionController.getAllAuctions);

router.route("/").get(auctionController.getAllAuctions);
router.route("/:id").get(auctionController.getAuction);

module.exports = router;
