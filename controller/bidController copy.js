const User = require("./../model/userModel");
const Product = require("./../model/productModel");
const AppError = require("./../utils/AppError");
const Bid = require("./../model/bidModel");
const { calcMinBidAmount } = require("./../utils/helper");

// exports.createNewBid = async (req, res, next) => {
//   // 1. get the product id
//   const auction = await Product.findById(req.params.id);
//   // 2. chek is the first bid or not
//   // 3. if first bid then bid ammount at least the base price of the product
//   // 4. if its not the first bid then the bid ammount must be altest the (10% ⬆️) of the current bid
//   // 5. upate the last bid witn status "outbid"
//   // 6. create a new bid with status "accepted"
//   // 7. upadte the product wity the current bid details
//   // 8. send the responce
// };
exports.createNewBid = async (socket, data) => {
  try {
    const { productId, currnetBidData, newBidData } = data;
    let minBidAmmount;
    const auction = await Product.findOne({
      _id: productId,
      verified: true,
      published: true,
      auctionsStartsAt: { $lte: Date.now() },
      auctionsEndsAt: { $gt: Date.now() },
    });
    if (!auction)
      return socket.emit("bidError", {
        message: "No Live Auction found with that ID",
      });

    //# IF THAT IS THE FIRST BID (OPENING BID)
    if (!auction.currentBid) {
      const minBidAmmount = auction.basePrice;
      if (newBidData.amount < minBidAmmount)
        return socket.emit("bidError", {
          message: "Bid Ammount is low !",
        });

      const newBid = await Bid.create({
        productId,
        bidAmount: newBidData.amount,
        bidder: newBidData.bidder,
        status: "winning",
      });

      auction.currentBidDeails = newBid._id;
      auction.currentBid = newBidData.amount;
      await auction.save();
      socket.io.to(productId).emit("bidAccepted", {
        ...newBid.toObject(),
        bidAmount: newBidData.amount,
      });
    } else {
      const minBidAmmount = calcMinBidAmount(auction.currentBid);
      if (newBidData.amount < minBidAmmount)
        return socket.emit("bidError", {
          message: "Bid Ammount is low !",
        });
      // OUTBID THE OLD BID
      const oldBid = await Bid.findByIdAndUpdate(auction.currentBidDeails, {
        stats: "outbid",
      });
      const newBid = await Bid.create({
        productId,
        bidAmount: newBidData.amount,
        bidder: newBidData.bidder,
        status: "winning",
      });

      auction.currentBidDeails = newBid._id;
      auction.currentBid = newBidData.amount;
      await auction.save();
      socket.io.to(productId).emit("bidAccepted", {
        ...newBid.toObject(),
        bidAmount: newBidData.amount,
      });
    }

    // if (newBidData.amount < minBidAmmount)
    // return socket.emit("bidError", {
    //   message: "Bid Ammount is low !",
    // });
  } catch (err) {
    // console.log(err);
    socket.emit("bidError", {
      message: "Error happen in creating new bid",
    });
  }
};
