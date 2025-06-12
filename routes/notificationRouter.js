import express from "express";
import {
  getNotifications,
  markRead,
} from "./../controller/notificationController.js";
import { protect } from "./../controller/authController.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getNotifications);
router.route("/:id").patch(markRead);

export default router;
