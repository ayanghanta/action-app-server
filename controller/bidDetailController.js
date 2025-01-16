const AppError = require("./../utils/AppError");
const Bid = require("./../model/bidModel");

exports.getBidDetail = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.bidId).populate({
      path: "bidder",
      select: "fullName photo",
    });

    if (!bid) return next(new AppError("No bid found !", 404));

    res.status(200).json({
      ok: true,
      data: {
        bid,
      },
    });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};
exports.getMyBids = async (req, res, next) => {
  try {
    const bids = await Bid.aggregate([
      {
        $match: { bidder: req.user._id },
      },
      {
        $sort: { biddingAt: -1 },
      },
      {
        $group: {
          _id: "$productId",
          yourNumBids: { $sum: 1 },
          leatestBidAt: { $first: "$biddingAt" },
          myLatestBid: { $first: "$bidAmount" },
          bidStatus: { $first: "$status" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "auctionDetails",
          pipeline: [
            {
              $project: {
                title: 1,
                _id: 0,
                coverImage: 1,
                basePrice: 1,
                currentBid: 1,
                auctionsEndsAt: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: { productId: "$_id" },
      },
    ]);

    res.status(200).json({
      ok: true,
      results: bids.length,
      data: {
        bids,
      },
    });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};
