const mongoose = require("mongoose");

const doctorProfileSchema = mongoose.Schema(
  {
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
    name: {
      type: String,
      required: [true, "Please add the doctor's name"],
    },
    img: {
      type: String,
      required: [true, "Please add the image URL for the doctor"],
    },
    rating: {
      type: Number,
      default: 0,
    },
    degree: {
      type: String,
      required: [true, "Please add the doctor's degree"],
    },
    location: {
      type: String,
      required: [true, "Please add the doctor's location"],
    },
    designation: {
      type: String,
      default: "",
    },



    advanceDay: {
      type: Number,
      default: 10,
    },    
    availableDays: {
      type: [String], // Array of days
      default:[
        "Monday",
        "Wednesday",
        "Friday"
    ],
    },
    availableTime: {
      type: [String], // Array of time in 24-hour format
      required: [true, "Please add the doctor's available times"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DoctorProfile", doctorProfileSchema);
