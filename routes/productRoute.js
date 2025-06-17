import express from "express";

import {
  getAllProducts,
  aliasGetMyProducts,
  aliasPublishProduct,
  aliasVerifyProduct,
  updateProduct,
  aliasRejectProduct,
  getProduct,
  uploadProductImage,
  resizeProductImage,
  aliasUpdateProduct,
  deleteProduct,
  createProduct,
} from "./../controller/productController.js";
import { protect, restrictTo } from "./../controller/authController.js";

const router = express.Router();

// ALL ROUTER MUST BE PROTECTED
router.use(protect);

router.route("/").get(restrictTo("admin"), getAllProducts);

router.route("/getMyProducts").get(aliasGetMyProducts, getAllProducts);
router.route("/publishProduct/:id").patch(aliasPublishProduct, updateProduct);
router
  .route("/verify/:id")
  .patch(restrictTo("admin"), aliasVerifyProduct, updateProduct);
router
  .route("/reject/:id")
  .patch(restrictTo("admin"), aliasRejectProduct, updateProduct);

router
  .route("/")
  .post(
    restrictTo("user"),
    uploadProductImage,
    resizeProductImage,
    createProduct
  );

router
  .route("/:id")
  .get(getProduct)
  .patch(
    uploadProductImage,
    resizeProductImage,
    aliasUpdateProduct,
    updateProduct
  )
  .delete(deleteProduct);

export default router;
