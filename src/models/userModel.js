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
    firebase_token: {
      type: String,
      default: "",
    },
    
    
  },
  {
    timestamps: true,
  }
);
userSchema.virtual("doctor", {
  ref: "DoctorProfile", // The model to use for populating the virtual field
  localField: "_id",
  foreignField: "user_id",
  justOne: true,
});

userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });
module.exports = mongoose.model("User", userSchema);
