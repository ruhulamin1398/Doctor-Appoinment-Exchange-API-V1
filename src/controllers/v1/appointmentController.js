const asyncHandler = require("express-async-handler");
const Appointment = require("../../models/appointmentModel");
 
const { response } = require("express");
const SwapAppontment = require("../../models/swapAppontmentModel");

// @desc    book a doctor appointment
// @route   POST /api/v1/book-appointment
// @access  Public 
const BookAppointment = asyncHandler(async (req, res) => {
  const { appointment_id } = req.body;
  const patient_user_id = req.user.id;

  const appointment = await Appointment.findById(appointment_id);
  if(appointment.patient_user_id){
    res.status(400);
    throw new Error("Appointment Already Booked")
  }

  try {
    await Appointment.findByIdAndUpdate(
      appointment.id,
      { $set: { "patient_user_id": patient_user_id, "status": 1 } },
      { new: true }
    );
  }
  catch (err) {
    res.status(500);
    throw new Error("Some things went worong , Please try again")
  }


  res.status(201).json(
    {
      "Appointment":await Appointment.findById(appointment_id),
      "msg": "Appointment booked Successful !!",
  
    }
  )

});


// @desc    swap a doctor appointment
// @route   POST /api/v1/swap-appointment
// @access  Public 
const SwapAppointment = asyncHandler(async (req, res) => {
  const { appointment_id } = req.body;
  const user_id = req.user.id;

  const appointment = await Appointment.findById(appointment_id);
  
  if(!appointment.patient_user_id){
    res.status(400);
    throw new Error("Appointment Not Booked Yet")
  }

 
  const swapAppointment = await SwapAppontment.create({
    appointment_id,
    "patient_user_id":appointment.patient_user_id,
    "requested_user_id":user_id,
})


try {
  await Appointment.findByIdAndUpdate(
    appointment.id,
    { $set: {  "status": 2 } },
    { new: true }
  );
}
catch (err) {
  res.status(500);
  throw new Error("Some things went worong , Please try again")
}

  res.status(200).json({
    appointment,
    "hi":"hello",
  })
});


module.exports = {
  BookAppointment,
  SwapAppointment
};
