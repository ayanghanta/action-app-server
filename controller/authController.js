import User from "./../model/userModel.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import AppError from "./../utils/AppError.js";
import Email from "./../utils/email.js";
const signJwt = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signJwt(user._id);
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 3600 * 1000
    ),
    httpOnly: true,
    // sameSite: "None",
  };

  // send JWT cookie
  if (process.env.NODE_ENV === "production") cookieOption.secure = true;
  res.cookie("jwt", token, cookieOption);

  // hide passwoord form output
  user.password = undefined;
  user.passwordResetToken = undefined;
  user.resetTokenExpire = undefined;
  res.status(statusCode).json({
    ok: true,
    token,
    data: {
      authenticated: true,
      user,
    },
  });
};

export const signup = async (req, res, next) => {
  try {
    const user = await User.create({ ...req.body, role: "user" });

    const url = `${process.env.FORNT_END_URL}`;

    createSendToken(user, 201, res);
    await new Email(user, url).sendWelcome();
  } catch (err) {
    console.log(err);
    let errMessage;
    if (err.name === "ValidationError") {
      errMessage = Object.keys(err.errors)
        .map((er) => err.errors[er].message)
        .join(", ");
    }

    next(new AppError(errMessage, 500));
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // 1. chek if email and passowrd are present or not
    if (!email || !password)
      return next(new AppError("Please provide email and pasword", 400));
    // 2. get the user based on the email

    const user = await User.findOne({ email }).select("+password");

    // 3. compare its password to the input password
    if (!user || !(await user?.isCorrectPassword(password, user.password)))
      return next(new AppError("Email or password is wrong", 401));

    // logged in user send JWT
    req.user = user;

    createSendToken(user, 200, res);
  } catch (err) {
    next(new AppError(err.message));
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    // 1.chacek if the email presset in request
    if (!email) return next(new AppError("Please provide us your email"));

    // 2. check is user exist with this email
    const user = await User.findOne({ email });
    if (!user) return next(new AppError("No user found with this email"));

    // 3. create reset token and save to the document
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 4. send reset token to this mail
    try {
      const resetLink = `${process.env.FORNT_END_URL}/api/v1/users/${resetToken}`;

      await new Email.resetPassword(user, resetLink);
    } catch (err) {
      return next(
        new AppError("There is a problem to send email, try agin latter")
      );
    }

    // 5. save reset token to the document
    res.status(200).json({
      ok: true,
      message: "Mail send to your email, reset your password",
    });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { password, confirmPassword } = req.body;
    // 1. Check both password is present
    if (!password || !confirmPassword)
      return next(
        new AppError("Please provide us password and confrim password", 400)
      );

    // 2. Get the reset token from req
    const resetToken = req.params.resetToken;

    // 3. Verify the reset token
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      resetTokenExpireIn: { $gt: Date.now() },
    });

    if (!user)
      return next(
        new AppError("Either invaild token or token has expire", 401)
      );

    // 4. update the document with new password
    user.password = password;
    user.confirmPassword = confirmPassword;
    user.passwordResetToken = undefined;
    user.resetTokenExpireIn = undefined;
    user.passwordChangeAt = Date.now();
    await user.save();

    // 5. loggedin user
    createSendToken(user, 200, res);
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, password, confirmPassword } = req.body;
    // 1. check if the password and confirm password and current exist
    if (!currentPassword || !password || !confirmPassword)
      return next(
        new AppError("Place provide all the credentials corectly", 400)
      );

    // 2. get the user form req.user
    const currentUser = await User.findById(req.user._id).select("+password");

    // 3. compare current password to DB password
    if (
      !(await currentUser.isCorrectPassword(
        currentPassword,
        currentUser.password
      ))
    )
      return next(
        new AppError("Please provide your current password corectly", 401)
      );

    // 4. relace the password with new pasword
    currentUser.password = password;
    currentUser.confirmPassword = confirmPassword;
    await currentUser.save();

    // 5. logged in user with new passwor send JWT
    createSendToken(currentUser, 200, res);
  } catch (err) {
    // console.log(err);
    next(new AppError(err.message, 500));
  }
};

export const protect = async (req, res, next) => {
  try {
    // 1.Check if there is any token in header / cookie
    const authHeader = req.headers.authorization?.startsWith("Bearer");

    let jwtToken;
    if (authHeader) jwtToken = req.headers.authorization.split(" ").at(1);
    else if (req.cookies.jwt) jwtToken = req.cookies.jwt;

    if (!jwtToken)
      return next(new AppError("Login to access to this route", 401));

    // 2. verify the JWT
    const decodeToken = jwt.verify(jwtToken, process.env.JWT_SECRET);

    // 3. find the user usning id from jwt and check is active(not delete his account) account

    const currentUser = await User.findById(decodeToken.id);
    if (!currentUser)
      return next(new AppError("Token belong to the user no loner exist", 401));

    // 4. check if user chnages the password after jwt issued
    if (currentUser.isPasswordChangeAfter(decodeToken.iat))
      return next(
        new AppError("User recently changed password, login again", 401)
      );

    // GIVE ACCESSS TO THE PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError")
      return next(new AppError("JWT is invaild, login again", 401));
    next(new AppError(err.message, 401));
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have premission to perform this action", 401)
      );
    }

    next();
  };
};

const sendUnAuthToken = (res) => {
  res.status(200).json({
    ok: true,
    data: {
      authenticated: false,
      user: null,
    },
  });
};

export const isAuthenticated = async (req, res) => {
  try {
    const authHeader = req.headers.authorization?.startsWith("Bearer");

    let jwtToken;
    if (authHeader) jwtToken = req.headers.authorization.split(" ").at(1);
    else if (req.cookies.jwt) jwtToken = req.cookies.jwt;

    if (!jwtToken) return sendUnAuthToken(res);

    const decodeToken = jwt.verify(jwtToken, process.env.JWT_SECRET);

    const currentUser = await User.findById(decodeToken.id).populate({
      path: "addresses",
      select: "-__v",
    });
    if (!currentUser) return sendUnAuthToken(res);

    if (currentUser.isPasswordChangeAfter(decodeToken.iat))
      return sendUnAuthToken(res);

    // SEND AUTHENTICATED TOKEN
    res.status(200).json({
      ok: true,
      data: {
        authenticated: true,
        user: currentUser,
      },
    });
  } catch (err) {
    sendUnAuthToken(res);
  }
};

export const logout = async (req, res, next) => {
  const cookieOption2 = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    // sameSite: "None",
  };
  if (process.env.NODE_ENV === "production") cookieOption2.secure = true;
  res.cookie("jwt", "loggedout", cookieOption2);

  res.status(200).json({
    ok: true,
  });
};
