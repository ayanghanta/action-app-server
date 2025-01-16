const express = require("express");
const bidDetailController = require("./../controller/bidDetailController");
const authController = require("./../controller/authController");

const router = express.Router();

router.use(authController.protect);

router.route("/getMyBids").get(bidDetailController.getMyBids);
router.route("/:bidId").get(bidDetailController.getBidDetail);

module.exports = router;
