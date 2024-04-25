const mongoose = require("mongoose");


const swapappointmentSchema = mongoose.Schema(
  {
    appointment_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Appointment",
    },
    unixTimestamp: {
      type: Number,
      required: true,
    },
    
    patient_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
     

    requested_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
     
    doctor_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "DoctorProfile",
    },

    
    amount: {
      type:Number,
      default: 5,
      
    },
    isViewed: {
      type:Number,
      default: 0,
      
    },    status: {
      type:Number,
      default: 0,
      
    },
       
  

  },
  {
    timestamps: true,
  }
);



swapappointmentSchema.virtual("patient", {
  ref: "User", // The model to use for populating the virtual field
  localField: "patient_user_id",
  foreignField: "_id",
  justOne: true,
});



swapappointmentSchema.virtual("requested_patient", {
  ref: "User", // The model to use for populating the virtual field
  localField: "requested_user_id",
  foreignField: "_id",
  justOne: true,
});


swapappointmentSchema.virtual("appointment", {
  ref: "Appointment", // The model to use for populating the virtual field
  localField: "appointment_id",
  foreignField: "_id",
  justOne: true,
});

swapappointmentSchema.virtual("doctor", {
  ref: "DoctorProfile", // The model to use for populating the virtual field
  localField: "doctor_user_id",
  foreignField: "user_id",
  justOne: true,
});

swapappointmentSchema.set("toObject", { virtuals: true });
swapappointmentSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("SwapAppointment", swapappointmentSchema);
