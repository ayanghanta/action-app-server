const express = require("express");
const addressController = require("./../controller/addressController");
const authController = require("./../controller/authController");

const router = express.Router();

// ALL THE ROUTES MUST BE PROTECTED
router.use(authController.protect);

router
  .route("/")
  .get(addressController.getAllAddress)
  .post(addressController.createAddress);

router
  .route("/:id")
  .get(addressController.getAddress)
  .delete(addressController.deleteAddress)
  .patch(addressController.updateAddress);

module.exports = router;
