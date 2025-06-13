import mongoose from "mongoose";
import { compareAsc } from "date-fns";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A product must have a title"],
    },
    summary: {
      type: String,
      required: [true, "A product must have a short summary"],
    },
    description: {
      type: String,
      required: [true, "A product must have a detailed description"],
    },
    coverImage: {
      type: String,
      required: [true, "A product must have a cover image"],
    },
    otherImages: {
      type: [String],
      default: [],
    },
    basePrice: {
      type: Number,
      required: [true, "A product must have a base price"],
    },
    legalDocument: {
      type: String,
      required: [true, "A product must have it's legal document"],
    },
    originCountry: {
      type: String,
    },
    timePeriod: {
      type: String,
    },
    height: {
      type: String,
    },
    width: {
      type: String,
    },
    depth: {
      type: String,
    },
    weight: {
      type: String,
    },
    material: {
      type: String,
      default: "Iron",
    },
    overallCondition: {
      type: String,
    },
    notes: {
      type: String,
    },
    historicalSignificance: {
      type: String,
    },
    certificateNumber: {
      type: String,
    },
    verifiedBy: {
      type: String,
    },
    category: {
      type: [String],
      default: ["antique"],
    },
    careInstructions: {
      type: [String],
      default: [],
    },
    favoritesCount: {
      type: Number,
      default: 0,
    },
    watchlistCount: {
      type: Number,
      default: 0,
    },
    shippingTime: {
      type: String,
    },
    status: {
      type: String,
      default: "pending",
    },
    rejectionCouse: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: false,
    },
    createAt: {
      type: Date,
      default: Date.now,
    },
    seller: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A product must belong to a seller"],
    },
    auctionsStartsAt: {
      type: Date,
    },
    auctionsEndsAt: {
      type: Date,
    },
    auctionDuration: {
      type: String,
    },
    currentBid: {
      type: Number,
    },
    currentBidDeails: {
      type: mongoose.Schema.ObjectId,
      ref: "Bid",
    },
    isAuctionEnds: {
      type: Boolean,
      default: false,
    },
    plasedOrder: {
      type: Boolean,
      default: false,
    },
    orderId: {
      type: mongoose.Schema.ObjectId,
      ref: "Order",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("isLive").get(function () {
  const now = new Date();
  return (
    compareAsc(now, this.auctionsStartsAt) === 1 &&
    compareAsc(now, this.auctionsEndsAt) === -1
  );
});

const Product = mongoose.model("Product", productSchema);

export default Product;
