import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "A order must have a product"],
      unique: [true],
    },
    transactionId: {
      type: String,
      required: [true, "A order must have a transaction id"],
    },
    buyerId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A order must belog to a buyer"],
    },
    finalAmout: {
      type: String,
      required: [true, "A order must have a price"],
    },
    address: {
      type: Object,
      required: [true, "A order must have a devivary address"],
    },
    deliveryDate: {
      type: Date,
      required: [true, "A order must have a devivary time and date"],
    },
    orderPlaceAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
orderSchema.virtual("deliveryStatus").get(function () {
  const now = Date.now();
  return now >= this.deliveryDate.getTime() ? "delivered" : "out_for_delivery";
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
