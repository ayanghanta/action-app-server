import Notification from "./../model/notificationModel.js";
import User from "./../model/userModel.js";
import AppError from "./../utils/AppError.js";

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      ok: true,
      results: notifications.length,
      data: {
        notifications,
      },
    });
  } catch (err) {
    next(new AppError(err.message));
  }
};

export const markRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      isRead: true,
    });

    res.status(200).json({
      ok: true,
      message: "mark read",
    });
  } catch (err) {
    next(new AppError(err.message));
  }
};
