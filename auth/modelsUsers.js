const mongoose = require("mongoose");

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, validate: (value) => value.includes("@") },
    password: { type: String, required: true },
    token: {
      type: String,
    },
    verificationToken: String,
    costs: [
      {
        type: ObjectId,
        ref: costs,
      }
    ],
    profit: [
      {
        type: ObjectId,
        ref: profit,
      }
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;


authSource=admin&replicaSet=atlas-xgpp7x-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true