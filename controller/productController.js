import fs from "fs";
import path from "path";
import multer from "multer";
import sharp from "sharp";

import Product from "./../model/productModel.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import { PDFDocument } from "pdf-lib";
import { differenceInDays } from "date-fns";

import ApiFeatures from "./../utils/apiFeatures.js";
import AppError from "./../utils/AppError.js";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  maxAttempts: 3,
});

const multerStorage = multer.memoryStorage();

const multerImageFilter = (req, file, cb) => {
  const isImage = file.mimetype.startsWith("image");
  const isPdfDocument =
    file.mimetype.startsWith("application/pdf") &&
    file.fieldname.startsWith("legal");

  if (isImage || isPdfDocument) {
    cb(null, true);
  } else cb(new AppError("Plase upload a Image only !", 400), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerImageFilter,
});

export const uploadProductImage = upload.fields([
  {
    name: "coverImage",
    maxCount: 1,
  },
  {
    name: "otherImages",
    maxCount: 5,
  },
  {
    name: "legalDocument",
    maxCount: 1,
  },
]);

export const resizeProductImage = async (req, res, next) => {
  try {
    if (!req.files) return next();

    // 1. PROCESS AND SAVE COVER IMAGE
    if (req.files.coverImage) {
      req.body.coverImage = `product-cover-${Math.random()}-${Date.now()}.jpeg`;

      const outputBuffer = await sharp(req.files.coverImage.at(0).buffer)
        .resize(800, 600)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toBuffer();
      // .toFile(`public/images/products/${req.body.coverImage}`);

      const fileName = req.body.coverImage;

      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        Body: outputBuffer,
        ContentType: "image/jpeg",
        ACL: "public-read",
      });

      await s3.send(command);
    }
    // 2. PROCESS AND SAVE OTHER IMAGES
    req.body.otherImages = [];
    if (req.files.otherImages)
      await Promise.all(
        req.files.otherImages.map(async (file, i) => {
          const fileName = `product-${
            i + 1
          }-${Math.random()}-${Date.now()}.jpeg`;
          const outputBuffer = await sharp(file.buffer)
            .resize(800, 600)
            .toFormat("jpeg")
            .jpeg({ quality: 90 })
            .toBuffer();
          // .toFile(`public/images/products/${fileName}`);
          const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
            Body: outputBuffer,
            ContentType: "image/jpeg",
            ACL: "public-read",
          });
          await s3.send(command);

          req.body.otherImages.push(fileName);
        })
      );

    // 3. PROCESS AND SAVE LEGAL DOCUMENT
    if (!req.files.legalDocument) return next();

    req.body.legalDocument = `legal-document-${Math.random()}-${Date.now()}.pdf`;

    // const filePath = path.join("./public", "documents", req.body.legalDocument);

    const existingPdfBytes = req.files.legalDocument.at(0).buffer;
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pdfBytes = await pdfDoc.save();
    // fs.writeFileSync(filePath, pdfBytes);

    const pdf_fileName = req.body.legalDocument;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: pdf_fileName,
      Body: pdfBytes,
      ContentType: "application/pdf",
      ACL: "public-read",
    });

    await s3.send(command);

    next();
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

// CONTROLLERS
export const aliasGetMyProducts = (req, res, next) => {
  req.query.seller = req.user._id;
  req.query.select =
    "coverImage,basePrice,title,status,published,auctionsStartsAt,auctionDuration,auctionsEndsAt,rejectionCouse isAuctionEnds";

  next();
};

export const getAllProducts = async (req, res, next) => {
  try {
    const productsQuery = new ApiFeatures(Product.find(), req.query)
      .filter()
      .sorting()
      .limitingFields();
    // .paginating();

    const products = await productsQuery.query;

    res.status(200).json({
      ok: true,
      results: products.length,
      data: {
        products,
      },
    });
  } catch (err) {
    next(new AppError("There is a problem in getting products", 500));
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate({
      path: "seller",
      select: "fullName photo",
    });
    res.status(200).json({
      status: "success",
      ok: true,
      data: {
        product,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      ok: false,
      message: err,
    });
  }
};

export const createProduct = async (req, res, next) => {
  try {
    // SET THE SELLER ID FROM AUTH TOKEN
    const newProduct = await Product.create({
      ...req.body,
      seller: req.user._id,
    });
    res.status(201).json({
      status: "success",
      ok: true,
      data: {
        product: newProduct,
      },
    });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

export const aliasUpdateProduct = (req, res, next) => {
  // * THIS IS IMPORTENT: WHEN USER UPDATES THE PRODUCT IT AUTOMATICALLY GONING TO 'PENDING' STATUS --- SO USER JUST CAN CON VERIFY THEIR PRODUCT ON THEIRE WON AND ALSO USER CAN NOT CHAGE SELLER OF THIS PRODYCT
  const now = new Date();
  const updatedBody = {
    ...req.body,
    status: "pending",
    published: false,
    verified: false,
  };
  delete updatedBody.seller;

  req.filter = {
    _id: req.params.id,
    seller: req.user._id,
    $or: [
      { auctionsStartsAt: { $gt: now } },
      { auctionsStartsAt: { $exists: false } },
      { auctionsStartsAt: null },
    ],
    isAuctionEnds: false,

    // status: { $ne: "verified" },
  };

  req.body = updatedBody;

  next();
};

export const aliasPublishProduct = (req, res, next) => {
  const { auctionsStartsAt, auctionsEndsAt } = req.body;
  const publishBody = {
    auctionsStartsAt,
    auctionsEndsAt,
    published: true,
    auctionDuration: differenceInDays(auctionsEndsAt, auctionsStartsAt),
  };

  req.filter = {
    _id: req.params.id,
    seller: req.user._id,
    status: "verified",
    verified: true,
  };

  req.body = publishBody;

  next();
};
export const aliasVerifyProduct = (req, res, next) => {
  req.filter = {
    _id: req.params.id,
  };
  req.body = {
    status: "verified",
    verified: true,
  };
  next();
};
export const aliasRejectProduct = (req, res, next) => {
  req.filter = {
    _id: req.params.id,
  };
  req.body = {
    status: "rejected",
    verified: false,
    rejectionCouse: req.body.couse,
  };
  next();
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(req.filter, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product)
      return next(
        new AppError(
          `Product cannot be updated. Either it does not exist,or it is already in auction`,
          400
        )
      );

    res.status(202).json({
      ok: true,
      data: {
        product,
      },
    });
  } catch (err) {
    next(new AppError(err.message));
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    // 1. get the product and check if the seller is same as user id
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      seller: req.user._id,
      isAuctionEnds: { $ne: true },
    });

    if (!product)
      return next(new AppError(`No product found with this id`, 404));

    res.status(204).json({
      ok: true,
      message: "Product delete successfully",
    });
  } catch (err) {
    next(new AppError(err.message));
  }
};
