import express from "express";

import {
  signup,
  login,
  logout,
  isAuthenticated,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
} from "./../controller/authController.js";
import {
  uploadUserPhoto,
  resizeUserPhoto,
  updateMe,
  getAllUsers,
  getUser,
} from "./../controller/userController.js";

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);

router.route("/isAuthenticated").get(isAuthenticated);

router.route("/forgotPassword").patch(forgotPassword);
router.route("/resetPassword/:resetToken").patch(resetPassword);

router.route("/getUser/:userId").get(getUser);

// UNDER THIS ALL ROUTES ARE PROTECTED

router.use(protect);

router.route("/updatePassword").patch(updatePassword);

router.route("/updateMe").patch(uploadUserPhoto, resizeUserPhoto, updateMe);
// UNDER THESE ALL THE ROUTE ARE ONLY ACCESSABLE FOR ADMINS

// router.use(authController.restrictTo("admin"));

router.route("/").get(getAllUsers);

export default router;
