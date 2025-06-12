import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.ObjectId,
    required: [true, "A valid bid must be belog to a prodcut"],
    ref: "Product",
  },
  bidAmount: {
    type: Number,
    required: [true, "A vaild bid must have amount"],
  },
  bidder: {
    type: mongoose.Schema.ObjectId,
    require: [true, "A bid must be belog to a valid user"],
    ref: "User",
  },
  biddingAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "outbid", "winning", "finalized", "expired"],
    default: "pending",
  },
});

bidSchema.post("save", async function (doc) {
  await doc.populate({
    path: "bidder",
    select: "fullName photo",
  });
});
const Bid = mongoose.model("Bid", bidSchema);

export default Bid;
