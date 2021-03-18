const mongoose = require("mongoose");

const { Schema } = mongoose;

const CostSchema = new Schema({
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
  userId:{
    type: String,
    required: true,
  }
});

const Cost = mongoose.model("Cost", CostSchema);

module.exports = Cost;
