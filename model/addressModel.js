import mongoose from "mongoose";

/*
{
    id: "1",
    phoneNumber: "9832838188",
    pinCode: "721166",
    locality: "Lutunia",
    address: "Sabang, temathani",
    city: "Medinipur",
    state: "West bengal",
    landMark: "near barik nursing home",
    alternativeNumber: "8116733102",
    tag: "Home",
  },
*/
const addressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Adress need full name of user"],
  },
  phoneNumber: {
    type: String,
    required: [true, "Adress need a valid pone number"],
  },
  pinCode: {
    type: String,
    required: [true, "Adress need a valid pincode of your location"],
  },
  locality: {
    type: String,
    required: [true, "Adress need a locality"],
  },
  address: {
    type: String,
    required: [true, "a details address reuiqred"],
  },
  city: {
    type: String,
    required: [true, "Adress need a city"],
  },
  state: {
    type: String,
    required: [true, "Adress need a state of you location"],
  },
  landMark: {
    type: String,
  },
  alternativeNumber: {
    type: String,
  },
  tag: {
    type: String,
    default: "Home",
  },
});

const Address = mongoose.model("Address", addressSchema);

export default Address;
