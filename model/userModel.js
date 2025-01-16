const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "A user must have a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "User must have a valid email"],
      unique: [true, "user with this email is already exist"],
      validate: [validator.isEmail, "Please provide us a valid email"],
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    photo: {
      type: String,
      default: "default-user.png",
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "member"],
    },
    password: {
      type: String,
      required: [true, "To create account user must have a password"],
      minlength: [8, "Passowrd must have at least 8 character long"],
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, "Please provide confirm password"],
      min: [8, "Confirm passowrd must have at least 8 character long"],
      validate: {
        validator: function (confirmPassword) {
          return this.password === confirmPassword;
        },
        message: "Password and confirm passowrd must be same",
      },
    },
    addresses: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Address",
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    passwordChangeAt: {
      type: Date,
    },
    passwordResetToken: String,
    resetTokenExpireIn: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// VIRTUAL PROPERTY

// virtual populate
userSchema.virtual("products", {
  ref: "Product",
  foreignField: "seller",
  localField: "_id",
});

// QUERY MIDDLEWARE

// userSchema.pre(["findOne", "findById"], function (next) {
//   next();
//   this.populate({
//     path: "addresses",
//     select: "-__v",
//   });
// });

// DOCUMENT MIDDLEWARE

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 3000;
  next();
});
//INSTANCE METHODS
userSchema.methods.isCorrectPassword = async function (
  inputPassword,
  dbPassword
) {
  return await bcrypt.compare(inputPassword, dbPassword);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetTokenExpireIn = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.isPasswordChangeAfter = function (jwtIssuAt) {
  const passwordChangeAt = parseInt(
    new Date(this.passwordChangeAt).getTime() / 1000
  );
  if (this.passwordChangeAt) {
    return passwordChangeAt > jwtIssuAt;
  }

  // false ==> user not change password after the last jwt is issued
  return false;
};

// MODEL

const User = mongoose.model("User", userSchema);
module.exports = User;
