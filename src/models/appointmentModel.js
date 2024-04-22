

const User = require("./userModel");
const mongoose = require("mongoose");


const appointmentSchema = mongoose.Schema(
  {
    doctor_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    
    patient_user_id: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",
    },
    date: {
      type: Date,
      required: true,
    },
    day: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    unixTimestamp: {
      type: Number,
      required: true,
    },
    status: {
      type: Number,
      default:0,
    },
  

  },
  {
    timestamps: true,
  }
);


appointmentSchema.virtual("patient", {
  ref: "User", // The model to use for populating the virtual field
  localField: "patient_user_id",
  foreignField: "_id",
  justOne: true,
});
appointmentSchema.virtual("swap-request", {
  ref: "SwapAppointment", // The model to use for populating the virtual field
  localField: "_id",
  foreignField: "appointment_id",
  justOne: true,
});

// Apply the virtual field when querying
appointmentSchema.set("toObject", { virtuals: true });
appointmentSchema.set("toJSON", { virtuals: true });


module.exports = mongoose.model("Appointment", appointmentSchema);
