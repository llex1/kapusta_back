const mongoose = require("mongoose");
const {
  Types: { ObjectId },
} = require("mongoose");
const { Schema } = mongoose;

const TokenSchema = new Schema(
  {
    token: { type: String},
  }
);

const Token = mongoose.model("Token", TokenSchema);

module.exports = Token;


