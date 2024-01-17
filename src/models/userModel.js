const { Int32 } = require("mongodb");
const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please add the user name"],
    },
    email: {
      type: String,
      required: [true, "Please add the user email address"],
      unique: [true, "Email address already taken"],
    },
    password: {
      type: String,
      required: [true, "Please add the user password"],
    },
    token: {
      type: String,
      default: "",
    },
    is_verified: {
      type: Boolean,
      default: false,
    },

    user_type: {
      type: String,
      default: "patient",
    },
    amount: {
      type: Number,
      default: 1000,
    },

    
    
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
