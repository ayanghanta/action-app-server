import express from "express";
import { protect } from "./../controller/authController.js";
import { controllWebhook } from "./../controller/webhookController.js";

const router = express.Router();

router.route("/").post(controllWebhook);

export default router;
