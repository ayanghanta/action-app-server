const Notification = require("./../model/notificationModel");
const User = require("./../model/userModel");
const AppError = require("./../utils/AppError");

exports.getNotifications = async (req, res, next) => {
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

exports.markRead = async (req, res, next) => {
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
