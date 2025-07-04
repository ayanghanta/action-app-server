import express from "express";

import { protect } from "./../controller/authController.js";
import { getMyWinnings } from "./../controller/winningController.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getMyWinnings);

export default router;
