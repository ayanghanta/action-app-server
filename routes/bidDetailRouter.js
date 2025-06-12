import express from "express";
import {
  getMyBids,
  getBidDetail,
} from "./../controller/bidDetailController.js";
import { protect } from "./../controller/authController.js";

const router = express.Router();

router.use(protect);

router.route("/getMyBids").get(getMyBids);
router.route("/:bidId").get(getBidDetail);

export default router;
