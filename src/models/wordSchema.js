const mongoose = require("mongoose");

const wordSchema = mongoose.Schema(
  {
    category: {
      type: String,
    },
    items: {
      type: [String], // Change to an array of strings
    }, 
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Word", wordSchema);
