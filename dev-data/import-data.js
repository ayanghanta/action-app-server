import fs from "fs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import Product from "./../model/productModel.js";
import User from "./../model/userModel.js";
import Address from "./../model/addressModel.js";
import Bid from "./../model/bidModel.js";

import { differenceInDays } from "date-fns";

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: "./config.env" });

const CONNECTION_STRING = process.env.DATABASE.replace(
  "<DBPASSWORD>",
  process.env.DB_PASSWORD
);
mongoose.connect(CONNECTION_STRING).then(() => {
  console.log("DB connection successfull ✅");
});

const products = JSON.parse(fs.readFileSync(`${__dirname}/products.json`));
const users = JSON.parse(fs.readFileSync(`${__dirname}/user.json`));
const addresses = JSON.parse(fs.readFileSync(`${__dirname}/address.json`));

function getRandomDays(min = 3, max = 9) {
  const day = Math.floor(Math.random() * (max - min + 1)) + min;
  return day * 24 * 60 * 60 * 1000;
}

function setAuctionDate(data) {
  return data.map((product) => {
    if (!product.published || !product.verified) return product;
    const daysAfter = getRandomDays();
    const auctionsStartsAt = `${
      new Date(Date.now() + daysAfter).toISOString().split("T")[0]
    }T00:00:00.000Z`;
    const auctionsEndsAt = `${
      new Date(Date.now() + daysAfter + getRandomDays())
        .toISOString()
        .split("T")[0]
    }T23:59:59.999Z`;
    const auctionDuration = differenceInDays(auctionsEndsAt, auctionsStartsAt);
    product.auctionsStartsAt = auctionsStartsAt;
    product.auctionsEndsAt = auctionsEndsAt;
    product.auctionDuration = auctionDuration;
    return product;
  });
}

const importProductData = async () => {
  try {
    const productDataSetAuctionDate = setAuctionDate(products);
    await Product.create(productDataSetAuctionDate);

    console.log("All Product Data is Imported ⏬");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const importUserData = async () => {
  try {
    await User.create(users);

    console.log("All User Data is Imported ⏬");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const importAddressData = async () => {
  try {
    await Address.create(addresses);

    console.log("All Address Data is Imported ⏬");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Product.deleteMany();

    await User.deleteMany();

    await Address.deleteMany();
    await Bid.deleteMany();

    console.log("DATA deleted 🚮");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] == "--importproduct") importProductData();
if (process.argv[2] == "--importuser") importUserData();
if (process.argv[2] == "--importaddress") importAddressData();
if (process.argv[2] == "--delete") deleteData();

console.log(process.argv);

// node .\dev-data\import-data.js --importproduct
