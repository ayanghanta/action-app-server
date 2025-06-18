import multer from "multer";
import sharp from "sharp";

import User from "./../model/userModel.js";
import Product from "./../model/productModel.js";
import AppError from "./../utils/AppError.js";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  maxAttempts: 3,
});

// Store image in a memory
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else cb("Plase upload a Image only !", false);
};

// const upload = multer({ dest: "public/images/products" });
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadUserPhoto = upload.single("photo");

export const resizeUserPhoto = async (req, res, next) => {
  try {
    if (!req.file) return next();

    //     const outputBuffer = await sharp(inputBuffer)
    //   .rotate(rotation)
    //   .extract({
    //     left: Math.round(crop.x),
    //     top: Math.round(crop.y),
    //     width: Math.round(crop.width),
    //     height: Math.round(crop.height),
    //   })
    //   .resize(300, 300)
    //   .jpeg({ quality: 80 })
    //   .toBuffer();

    // const fileName = `profile/${resumeId}-${Date.now()}-profile.jpeg`;

    // const command = new PutObjectCommand({
    //   Bucket: process.env.R2_BUCKET_NAME,
    //   Key: fileName,
    //   Body: outputBuffer,
    //   ContentType: file.type,
    //   ACL: "public-read",
    // });

    // await s3.send(command);

    req.body.photo = `user-${Math.random()}-${Date.now()}.jpeg`;

    const outputBuffer = await sharp(req.file.buffer)
      .resize(180, 180)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toBuffer();
    // .toFile(`public/images/users/${req.body.photo}`);

    const fileName = req.body.photo;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: outputBuffer,
      ContentType: "image/jpeg",
      ACL: "public-read",
    });

    await s3.send(command);

    next();
  } catch (err) {
    next(new AppError(`Can't upload your photo try again`, 500));
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      ok: true,
      results: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    next(new AppError(err.message));
  }
};

const filterReqBody = (obj) => {
  const updateFileds = ["fullName", "email", "photo", "address", "phoneNumber"];
  const filteredObj = { ...obj };
  Object.keys(obj).forEach((el) => {
    if (!updateFileds.includes(el)) delete filteredObj[el];
  });
  return filteredObj;
};

export const updateMe = async (req, res, next) => {
  try {
    // 1. if use try to update the password send error
    if (req.body.password || req.body.confirmPassword)
      return next(
        new AppError(
          "This route is not for updating the password, try /updatePassword",
          400
        )
      );
    // 2. get the current user and update
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      filterReqBody(req.body),
      {
        new: true,
        runValidators: true,
      }
    );
    // 3. send responce
    res.status(200).json({
      ok: true,
      data: {
        user: updatedUser,
      },
    });
  } catch (err) {
    next(new AppError(err.message));
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    console.log(userId);
    // 1. if use try to update the password send error
    if (!userId) return next(new AppError("no user id", 404));
    // 2. get the current user and update
    const user = await User.findById(userId).select("fullName photo");

    // 3. send responce
    res.status(200).json({
      ok: true,
      data: {
        user,
      },
    });
  } catch (err) {
    next(new AppError(err.message));
  }
};
