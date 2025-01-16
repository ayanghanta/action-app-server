const express = require("express");

const productController = require("./../controller/productController");
const authController = require("./../controller/authController");
const router = express.Router();

// ALL ROUTER MUST BE PROTECTED
router.use(authController.protect);

router
  .route("/")
  .get(authController.restrictTo("admin"), productController.getAllProducts);

router
  .route("/getMyProducts")
  .get(productController.aliasGetMyProducts, productController.getAllProducts);
router
  .route("/publishProduct/:id")
  .patch(
    productController.aliasPublishProduct,
    productController.updateProduct
  );
router
  .route("/verify/:id")
  .patch(
    authController.restrictTo("admin"),
    productController.aliasVerifyProduct,
    productController.updateProduct
  );
router
  .route("/reject/:id")
  .patch(
    authController.restrictTo("admin"),
    productController.aliasRejectProduct,
    productController.updateProduct
  );

router
  .route("/")
  .post(
    productController.uploadProductImage,
    productController.resizeProductImage,
    productController.createProduct
  );

router
  .route("/:id")
  .get(productController.getProduct)
  .patch(
    productController.uploadProductImage,
    productController.resizeProductImage,
    productController.aliasUpdateProduct,
    productController.updateProduct
  )
  .delete(productController.deleteProduct);

module.exports = router;
