import Product from "./../model/productModel.js";
import Bid from "./../model/bidModel.js";
import Notification from "./../model/notificationModel.js";
import cron from "node-cron";
// import Email from "./../utils/email.js";

export const auctionEnds = () => {
  //  RUN IN EVERY MINUTS
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const endAuctions = await Product.find({
        verified: true,
        published: true,
        auctionsEndsAt: { $lt: now },
        isAuctionEnds: { $ne: true },
      })
        .populate({ path: "seller", select: "fullName email" })
        .populate({
          path: "currentBidDeails",
          populate: {
            path: "bidder",
            select: "fullName email",
          },
        });
      console.log(endAuctions);
      endAuctions.forEach(async (auction) => {
        auction.isAuctionEnds = true;
        await auction.save();
        // console.log(auction);
        const leatestPrice = auction.currentBid
          ? auction.currentBid
          : auction.basePrice;
        const imageUrl = `${
          process.env.NODE_ENV === "production" ? "https" : "http"
        }://${process.env.SERVER_HOST}/images/products/${auction.coverImage}`;

        //NOTIFY TO THE SELLER EMAIL AND APP
        await Notification.create({
          message: `📢 Your auction for ${auction.title} has ended! ${
            auction.currentBid ? `The final bid was ₹${auction.currentBid}` : ""
          }. Thank you for using Vintage Vault!`,
          item: auction._id,
          user: auction.seller,
          type: "auctionEnd",
        });

        // new Email(auction.seller).auctionEndMail(
        //   auction.title,
        //   leatestPrice,
        //   imageUrl
        // );

        // IF NO BIDDER OF THE PRODUCT THE RETURN
        if (!auction.currentBidDeails) return;

        // LOGIC TO SEND NOTIFICATION

        // 1. UPDATE THE LETEST BID DOCUMNET STATUS TO 'finalized'
        const finalBid = await Bid.findById(auction.currentBidDeails);
        finalBid.status = "finalized";
        await finalBid.save();
        // console.log(auction);

        // 3. SEND NOTIFICATION IN THE WEB APP
        await Notification.create({
          message: `🎉 Congratulations! You've won the bid for ${auction.title}`,
          item: auction._id,
          user: finalBid.bidder,
          type: "auctionWin",
        });

        // 3. SEND EMAIL TO THE WINNING BID VIA EMAIL TO WINNER
        // new Email(auction.currentBidDeails.bidder).sendWinningMail(
        //   auction.title,
        //   leatestPrice,
        //   imageUrl
        // );
      });
    } catch (err) {
      console.log(err);
    }
  });
};
