import { Paddle, Environment } from "@paddle/paddle-node-sdk";
import AppError from "../utils/AppError.js";
import Product from "../model/productModel.js";

const paddle = new Paddle(process.env.PADDLE_SECRET_KEY, {
  environment: Environment.sandbox,
});

export const processPayment = async (req, res, next) => {
  try {
    const { productId, addressId } = req.body;
    const { _id: userId, email } = req.user;

    const fullProductDetails = await Product.findById(productId).populate({
      path: "currentBidDeails",
      select: "bidder status bidAmount", // Only select bidderId
    });

    if (!fullProductDetails)
      return next(new AppError("Product is not found", 404));

    const {
      currentBidDeails: { bidAmount, bidder, status },
      title,
      summary,
      coverImage,
    } = fullProductDetails;

    if (status !== "finalized")
      return next(new AppError("Auction is not end yet", 400));

    if (!userId.equals(bidder))
      return next(
        new AppError("You can not place order with this account", 401)
      );

    const payblePrice = String(bidAmount * 100);

    const transaction = await paddle.transactions.create({
      items: [
        {
          quantity: 1,
          adjustableQuantity: false,
          price: {
            name: `price of ${title}`,
            description: "Dynamically generated description",
            unitPrice: {
              // FIXME:
              currencyCode: "INR",
              amount: payblePrice, // ADD THIS TWO 00 FOR FLOT CONVERT
            },
            product: {
              name: title,
              description: summary,
              taxCategory: "standard",
            },
          },
        },
      ],
      customer: {
        email,
      },

      customData: {
        userId,
        productId,
        addressId,
      },
    });
    // console.log(transaction);
    res.status(201).json({
      ok: true,
      data: {
        transaction: transaction.id,
      },
    });
  } catch (err) {
    console.log(err);
    next(new AppError(err.message, 500));
  }
};
