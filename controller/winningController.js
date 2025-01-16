const Bid = require("./../model/bidModel");
const AppError = require("./../utils/AppError");

exports.getMyWinnings = async (req, res, next) => {
  try {
    const winnings = await Bid.find({
      bidder: req.user._id,
      status: "finalized",
    }).populate({
      path: "productId",
      select:
        "coverImage title basePrice summary category auctionsEndsAt currentBid",
    });

    res.status(200).json({
      ok: true,
      data: {
        winnings,
      },
    });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};
