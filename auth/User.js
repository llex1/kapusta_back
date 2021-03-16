const { string } = require("joi");
const mongoose = require("mongoose");
const {
  Types: { ObjectId },
} = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, validate: (value) => value.includes("@") },
    password: { type: String, required: true },
    tokenid: [
      {
        type: ObjectId,
        ref: "tokens",
      }
    ],
    balance: Number,
    verificationToken: String,
    costs: [
      {
        type: ObjectId,
        ref: "costs",
      }
    ],
    profit: [
      {
        type: ObjectId,
        ref: "profit",
      }
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;


