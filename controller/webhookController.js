import { Paddle, Environment, EventName } from "@paddle/paddle-node-sdk";
import Order from "../model/orderModel.js";
import Product from "../model/productModel.js";

import AppError from "../utils/AppError.js";
import { calcDeliveryDate } from "../utils/helper.js";
import Address from "../model/addressModel.js";

const paddle = new Paddle(process.env.PADDLE_SECRET_KEY, {
  environment: Environment.sandbox,
});

export const controllWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["paddle-signature"] || "";

    // req.body must be a raw buffer — make sure express does not parse JSON in advance for this route!
    // const rawRequestBody = req.body.toString("utf-8");
    // console.log(req.body);
    const rawRequestBody = req.body.toString();

    const secretKey = process.env.WEBHOOK_SECRET_KEY || "";

    if (!signature || !rawRequestBody) {
      console.log("Missing signature or body");
      return res.status(400).send("Invalid webhook");
    }

    // Validate and parse the webhook
    const eventData = await paddle.webhooks.unmarshal(
      rawRequestBody,
      secretKey,
      signature
    );

    switch (eventData.eventType) {
      case EventName.TransactionCompleted:
        // ✅ Grant access, mark as paid, etc.
        //You are handling high-risk payments (e.g., very expensive or sensitive goods).

        // You want extra certainty before creating orders in your system.
        break;
      case EventName.TransactionPaid:
        console.log(`💳 Transaction paid: ${eventData.data.id}`);
        // Optional: payment succeeded but still processing
        const transactionId = eventData.data.id;
        const totalAmount = +eventData.data.details.totals.grandTotal / 100;
        const { userId, addressId, productId } = eventData.data.customData;

        const addressDoc = await Address.findById(addressId);
        const address = addressDoc.toObject();
        const deliveryDate = calcDeliveryDate();

        // 1. create a order
        const order = await Order.create({
          productId,
          transactionId,
          buyerId: userId,
          address,
          finalAmout: totalAmount,
          deliveryDate,
        });

        // 2. update the product as the plce order=true
        await Product.findByIdAndUpdate(productId, {
          plasedOrder: true,
          orderId: order._id,
        });

        break;

      case EventName.TransactionCanceled:
        console.log(`❌ Transaction canceled: ${eventData.data.id}`);
        // Maybe cleanup or notify user
        break;

      case EventName.TransactionPaymentFailed:
        console.log(`⚠️ Transaction failed: ${eventData.data.id}`);
        // Handle failed payments
        break;
      default:
        console.log(`🔔 Unhandled event type: ${eventData.eventType}`);
    }

    // Respond to Paddle that the webhook was received
    res.status(200).send("Processed webhook event");
  } catch (err) {
    console.error("Webhook error:", err);
    next(new AppError(err.message, 500));
  }
};
