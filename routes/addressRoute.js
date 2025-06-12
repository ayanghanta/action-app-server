import express from "express";
import {
  getAllAddress,
  createAddress,
  getAddress,
  deleteAddress,
  updateAddress,
} from "./../controller/addressController.js";
import { protect } from "./../controller/authController.js";

const router = express.Router();

// ALL THE ROUTES MUST BE PROTECTED
router.use(protect);

router.route("/").get(getAllAddress).post(createAddress);

router.route("/:id").get(getAddress).delete(deleteAddress).patch(updateAddress);

export default router;
