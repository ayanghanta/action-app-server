const express = require("express");
const notificationController = require("./../controller/notificationController");
const authController = require("./../controller/authController");

const router = express.Router();

router.use(authController.protect);

router.route("/").get(notificationController.getNotifications);
router.route("/:id").patch(notificationController.markRead);

module.exports = router;
