import Address from "./../model/addressModel.js";
import User from "./../model/userModel.js";
import AppError from "./../utils/AppError.js";

export const createAddress = async (req, res, next) => {
  try {
    // 1. create new address
    const newAddress = await Address.create(req.body);

    // 2. push new address to the user document
    const currentUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: { addresses: newAddress._id },
      },
      { new: true }
    );
    res.status(201).json({
      ok: true,
      data: {
        address: newAddress,
        user: currentUser,
      },
    });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    // 1. update the addrres by id
    const address = await Address.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json({
      ok: true,
      data: {
        address,
      },
    });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    // 1. delete the addrres by id
    await Address.findByIdAndDelete(req.params.id);
    // 2. Remove the address reference from the User document
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { addresses: req.params.id } },
      { new: true }
    );

    res.status(204).json({
      ok: true,
      data: null,
    });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
};
export const getAddress = async (req, res, next) => {};

export const getAllAddress = async (req, res, next) => {};
