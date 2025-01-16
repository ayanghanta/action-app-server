const express = require("express");

const authController = require("./../controller/authController");
const userController = require("./../controller/userController");

const router = express.Router();

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/logout").get(authController.logout);
router.route("/isAuthenticated").get(authController.isAuthenticated);

router.route("/forgotPassword").patch(authController.forgotPassword);
router.route("/resetPassword/:resetToken").patch(authController.resetPassword);

// UNDER THIS ALL ROUTES ARE PROTECTED

router.use(authController.protect);

router.route("/updatePassword").patch(authController.updatePassword);

router
  .route("/updateMe")
  .patch(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
  );
// UNDER THESE ALL THE ROUTE ARE ONLY ACCESSABLE FOR ADMINS

// router.use(authController.restrictTo("admin"));

router.route("/").get(userController.getAllUsers);

module.exports = router;
