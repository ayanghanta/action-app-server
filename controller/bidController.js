const User = require("./../model/userModel");
const Product = require("./../model/productModel");
const Bid = require("./../model/bidModel");
const { calcMinBidAmount } = require("./../utils/helper");

exports.createNewBid = async (socket, data) => {
  try {
    const { productId, currnetBidData, newBidData } = data;
    // let minBidAmmount;
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
    const minBidAmmount = auction.currentBid
      ? calcMinBidAmount(auction.currentBid)
      : auction.basePrice;

    const message = auction.currentBid
      ? `Bid must be at least ${process.env.PRICE_HIKE}% higher than the current bid.`
      : "The opening bid must match the current price";

    // 2. check if the price higer them the requirement
    if (newBidData.amount < minBidAmmount)
      return socket.emit("bidError", {
        message,
      });

    // 2.CREATE NEW BID DOCUMENT
    const newBid = await Bid.create({
      productId,
      bidAmount: newBidData.amount,
      bidder: newBidData.bidder,
      status: "winning",
    });

    // 3. MARK THE OLD BID AS OUBID ONLY IF THEER WAS NAY OLD BID
    if (auction.currentBidDeails)
      await Bid.findByIdAndUpdate(auction.currentBidDeails, {
        status: "outbid",
      });

    // 4. UPDATE THE AUCTION DOCUMENT WITH NEW DATA
    auction.currentBidDeails = newBid._id;
    auction.currentBid = newBidData.amount;
    await auction.save();

    // 5. BRODCAST THE EVENT TO THE ROOM
    socket.io.to(productId).emit("bidAccepted", {
      ...newBid.toObject(),
      bidAmount: newBidData.amount,
    });
  } catch (err) {
    socket.emit("bidError", {
      message: "Error happen in creating new bid",
    });
  }
};
