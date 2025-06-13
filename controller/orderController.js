import Order from "./../model/orderModel.js";
import AppError from "./../utils/AppError.js";

export const getOrder = async (req, res, next) => {
  try {
    // 1. update the addrres by id
    const order = await Order.findById(req.params.id)
    .populate({
      path: "productId",
      select: "title coverImage basePrice auctionsEndsAt summary",
    });

    res.status(200).json({
      ok: true,
      data: {
        order,
      },
    });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};
export const getAllOrders = async (req, res, next) => {
  try {
    // 1. update the addrres by id
    const userId = req.user._id;
    const orders = await Order.find({ buyerId: userId }).populate({
      path: "productId",
      select: "title coverImage",
    });

    res.status(200).json({
      ok: true,
      data: {
        orders,
      },
    });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};
