import express from "express";
import {
  getAllAuctions,
  getAuction,
} from "./../controller/auctionController.js";

const router = express.Router();

// router
//   .route("/live-auctions")
//   .get(auctionController.aliasLiveAuctions, auctionController.getAllAuctions);

router.route("/").get(getAllAuctions);
router.route("/:id").get(getAuction);

export default router;
