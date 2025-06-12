import express from "express";
import { protect } from "./../controller/authController.js";
import { processPayment } from "./../controller/paymnetController.js";

const router = express.Router();

router.use(protect);
router.route("/").post(processPayment);

export default router;
