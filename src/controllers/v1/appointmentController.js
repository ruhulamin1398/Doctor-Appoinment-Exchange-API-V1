const asyncHandler = require("express-async-handler");
const Appointment = require("../../models/appointmentModel");

const { response } = require("express");
const SwapAppontment = require("../../models/swapAppontmentModel");
const User = require("../../models/userModel");




// @desc    Get a single appointment
// @route   GET /api/v1/appoinments/:id
// @access  Public
const GetAppointmentDetails = asyncHandler(async (req, res) => {
 
  const appointment_id = req.params.id;

  const appointment = await Appointment.findById(appointment_id).populate("patient");
  if (!appointment) {
    res.status(404);
    throw new Error("Appointment Not Found")
  }

  res.status(200).json(
    {
      "Appointment": appointment,
    }
  )

});



// @desc    book a doctor appointment
// @route   POST /api/v1/book-appointment
// @access  Public 
const BookAppointment = asyncHandler(async (req, res) => {
  const { appointment_id } = req.body;
  const patient_user_id = req.user.id;

  const appointment = await Appointment.findById(appointment_id);
  if (appointment.patient_user_id) {
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
      "Appointment": await Appointment.findById(appointment_id),
      "msg": "Appointment booked Successful !!",

    }
  )

});

// @desc    my appointment
// @route   GET /api/v1/my-appointment
// @access  Public 
const GetMyAppointment = asyncHandler(async (req, res) => {
  const patient_user_id = req.user.id;





  const currentUnixTimestamp = Math.floor(new Date().getTime() / 1000);
  const scheduledAppointments = await Appointment.find({
    patient_user_id,
    unixTimestamp: { $gt: currentUnixTimestamp },
  });
  const pastAappointments = await Appointment.find({
    patient_user_id,
    unixTimestamp: { $lt: currentUnixTimestamp },
  });


  res.status(200).json(
    {
      "appointments": {
        "prev": pastAappointments,
        "next": scheduledAppointments
      },
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

  if (!appointment.patient_user_id) {
    res.status(400);
    throw new Error("Appointment Not Booked Yet")
  }

  if (appointment.patient_user_id == user_id) {
    res.status(400);
    throw new Error("Appointment is Booked by you")
  }

  const existingRequest = await SwapAppontment.findOne({
    appointment_id,
    "requested_user_id": user_id
  })
  if (existingRequest) {
    res.status(400);

    throw new Error("Already Send Requests by you")
  }

  const swapAppointment = await SwapAppontment.create({
    appointment_id,
    "patient_user_id": appointment.patient_user_id,
    "unixTimestamp": appointment.unixTimestamp,
    "requested_user_id": user_id,
  })


  try {
    await Appointment.findByIdAndUpdate(
      appointment.id,
      { $set: { "status": 2 } },
      { new: true }
    );
  }
  catch (err) {
    res.status(500);
    throw new Error("Some things went worong , Please try again")
  }

  res.status(200).json({
    "msg": "Request send successfull",
    "appointment": await Appointment.findById(appointment_id),

  })
});




// @desc    my swap request
// @route   GET /api/v1/appointments/my-swap-requests
// @access  Public 
const GetMySwapRequests = asyncHandler(async (req, res) => {
  const user_id = req.user.id;


  const currentUnixTimestamp = Math.floor(new Date().getTime() / 1000);
  const nextSendSwapRequests = await SwapAppontment.find({
    "requested_user_id": user_id,
    unixTimestamp: { $gt: currentUnixTimestamp },
  });
  const prevSendSwapRequests = await SwapAppontment.find({
    "requested_user_id": user_id,
    unixTimestamp: { $lt: currentUnixTimestamp },
  });


  const nextGetSwapRequests = await SwapAppontment.find({
    "patient_user_id": user_id,
    unixTimestamp: { $gt: currentUnixTimestamp },
  });
  const prevGetSwapRequests = await SwapAppontment.find({
    "patient_user_id": user_id,
    unixTimestamp: { $lt: currentUnixTimestamp },
  });


  res.status(200).json(
    {
      "swapRequests": {
        "get": {
          "prev": prevGetSwapRequests,
          "next": nextGetSwapRequests,
        },
        "send": {
          "prev": prevSendSwapRequests,
          "next": nextSendSwapRequests,
        },
      },
    }
  )
});





// @desc    response swap request
// @route   GET /api/v1/appointments/response-swap-request
// @access  Public 
const ResponseSwapRequest = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  const { swap_request_id, status } = req.body


  const swapRequest = await SwapAppontment.findById(swap_request_id);
  if (!swapRequest) {
    res.status(404);
    throw new Error("swapRequest Not Found")
  }

  if (swapRequest.status ==2) {
    res.status(400);
    throw new Error("Already Accepted")
  }


  if (swapRequest.status ==3) {
    res.status(400);
    throw new Error("Already cancelled")
  }


  if (!status) {

    await SwapAppontment.findByIdAndUpdate(
      swapRequest.id,
      { status: 3 },
      { new: true }
    );

    res.status(200).json(
      {
        "msg":"Request cencel Successfull",
        "appointment":await Appointment.findById(swapRequest.appointment_id),

       
      }
    )



    

  }

  if (swapRequest.patient_user_id == user_id) {


    // transfer amount
    const owner = await User.findById(user_id);
    const requestSender = await User.findById(swapRequest.requested_user_id)
    if (requestSender.amount < swapRequest.amount) {
      res.status(400);
      throw new Error("Unsufficient Amount")
    }

    await User.findByIdAndUpdate(
      user_id,
      { amount: owner.amount+swapRequest.amount },
      { new: true }
    );
    await User.findByIdAndUpdate(
      swapRequest.requested_user_id,
      { amount: requestSender.amount-swapRequest.amount },
      { new: true }
    );
// status change 

await SwapAppontment.findByIdAndUpdate(
  swapRequest.id,
  { status:2 },
  { new: true }
);


console.log("accepted")
// update appointment

await Appointment.findByIdAndUpdate(
  swapRequest.appointment_id,
  { $set: { "patient_user_id": requestSender.id, "status": 0 } },
  
  { new: true }
);
console.log("done")

    res.status(200).json(
      {
        "msg":"Request Accepted Successfull",
        "Extra":{
          owner,
          requestSender,
          swapRequest,
          "appointment":await Appointment.findById(swapRequest.appointment_id),

        }
      }
    )

  }




  res.status(401);
  throw new Error("You don't have the access to accept")

});




module.exports = {
  GetAppointmentDetails,
  BookAppointment,
  SwapAppointment,
  GetMyAppointment,
  GetMySwapRequests,
  ResponseSwapRequest
};
