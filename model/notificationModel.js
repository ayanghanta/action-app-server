const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, "A notification must need a message"],
  },
  item: {
    type: mongoose.Schema.ObjectId,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    required: [true, "A notification must be belong to a user"],
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createAt: {
    type: Date,
    default: Date.now,
    expires: "7d",
  },
  type: {
    type: String,
    enum: ["auctionWin", "auctionEnd", "productVerification"],
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
