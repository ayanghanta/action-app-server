const multer = require("multer");
const sharp = require("sharp");
const User = require("./../model/userModel");
const Product = require("./../model/productModel");
const AppError = require("./../utils/AppError");

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

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = async (req, res, next) => {
  try {
    if (!req.file) return next();

    req.body.photo = `user-${Math.random()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(180, 180)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`public/images/users/${req.body.photo}`);

    next();
  } catch (err) {
    next(new AppError(`Can't upload your photo try again`, 500));
  }
};

exports.getAllUsers = async (req, res, next) => {
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

exports.updateMe = async (req, res, next) => {
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
