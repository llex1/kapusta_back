const mongoose = require("mongoose");

const { Schema } = mongoose;

const ProfitSchema = new Schema({
  date: {
    type: String,
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  sum: {
    type: Number,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});

const Profit = mongoose.model("Profit", ProfitSchema);

module.exports = Profit;
