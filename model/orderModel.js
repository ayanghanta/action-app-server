import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: [true, "A order must have a product"],
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
  addressId: {
    type: mongoose.Schema.ObjectId,
    ref: "Address",
    required: [true, "A order must have a devivary address"],
  },
  orderPlaceAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
