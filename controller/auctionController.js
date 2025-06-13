import Product from "./../model/productModel.js";
import apiFeatures from "./../utils/apiFeatures.js";

//NOTEME:  all the product that has verified and publish for auction by the seller are classified as auctions product or auctions
export const getAllAuctions = async (req, res) => {
  const now = new Date();
  try {
    const auctionQuery = new apiFeatures(
      Product.find({
        verified: true,
        published: true,
        auctionsEndsAt: { $gte: now },
      }),
      req.query
    )
      .filter()
      .sorting()
      .limitingFields()
      .paginating();

    const auctions = await auctionQuery.query;

    const totalDoc = await new apiFeatures(
      Product.find({
        verified: true,
        published: true,
        auctionsEndsAt: { $gte: now },
      }),
      req.query
    )
      .filter()
      .query.countDocuments();

    res.status(200).json({
      status: "success",
      ok: true,
      results: auctions.length,
      totals: totalDoc,
      data: {
        auctions,
      },
    });
  } catch (err) {
    // console.log(err);
    res.status(400).json({
      status: "error",
      ok: false,
      message: err,
    });
  }
};
export const getAuction = async (req, res) => {
  try {
    const auction = await Product.findById(req.params.id).populate({
      path: "currentBidDeails",
      populate: {
        path: "bidder",
        select: "fullName photo",
      },
    });

    res.status(200).json({
      status: "success",
      ok: true,
      data: {
        auction,
      },
    });
  } catch (err) {
    // console.log(err);
    res.status(400).json({
      status: "error",
      ok: false,
      message: err,
    });
  }
};
