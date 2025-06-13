import express from "express";

import { protect } from "./../controller/authController.js";
import { getAllOrders, getOrder } from "../controller/orderController.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getAllOrders);
router.route("/:id").get(getOrder);

export default router;
