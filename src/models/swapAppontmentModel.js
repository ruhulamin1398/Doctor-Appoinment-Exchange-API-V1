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
     
    
    amount: {
      type:Number,
      default: 5,
      
    },    status: {
      type:Number,
      default: 0,
      
    },
       
  

  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("SwapAppointment", swapappointmentSchema);
