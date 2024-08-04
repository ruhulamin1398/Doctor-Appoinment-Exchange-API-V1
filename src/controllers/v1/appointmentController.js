const asyncHandler = require("express-async-handler");
const Appointment = require("../../models/appointmentModel");

const { response } = require("express");
const SwapAppontment = require("../../models/swapAppontmentModel");
const User = require("../../models/userModel");
const { SendFirebaseNotification } = require("./FirebaseController");
const userModel = require("../../models/userModel");
const { sentEMail } = require("./mailSenderController");

const { format } = require('date-fns');
const { zonedTimeToUtc, utcToZonedTime, format: formatTZ } = require('date-fns-tz');



// @desc    Get a single appointment
// @route   GET /api/v1/appoinments/:id
// @access  Public
const GetAppointmentDetails = asyncHandler(async (req, res) => {

  const appointment_id = req.params.id;



  const appointment = await Appointment.findById(appointment_id).populate({
    path: 'patient',
    select: '_id username email firebase_token',
  }).populate({
    path: 'requested_patient',
    select: '_id username email firebase_token',
  }).populate("doctor")
    .populate("swap-request");
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
  const patient = await userModel.findById(patient_user_id)
  // console.log("patient ", patient)

  const appointment = await Appointment.findById(appointment_id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment Not Found")
  }

  console.log("appointment ", appointment)

  const doctor = await userModel.findById(appointment.doctor_user_id)



  // ! this section should uncomment  // start 

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

  // ! this section should uncomment  // end 


  // ?  sending notification  to patient 

  // let notification = {
  //   notification: {
  //     title: 'You have booked new Appointment',
  //     body: `Hey ${patient.username}, your appointment successfully booked`, 
  //   }
  // };

  // try {

  //   await SendFirebaseNotification(patient.firebase_token, notification);
  // }
  // catch (err) {
  //   console.log(err)
  //   res.status(500);
  //   throw new Error("Some things went worong , Please try again")
  // }

  // send email to patient 

//   try {
//     await sentEMail({
//         "body": `<p> Hey ${patient.username}, your appointment successfully booked</p>`,
//         "to": patient.email,
//         "subject": "You have booked new Appointment",

//     })
// }
// catch (err) {
//   console.log(err)
//   res.status(500);
//   throw new Error("Some things went worong , Please try again")
// }


  //  ? sending notification  to Doctor 
  const date = new Date(appointment.unixTimestamp * 1000);
 
  notification = {
    notification: {
      title: 'You have new Appointment',
      body: `Hey ${doctor.username},  Congrats! Your ${format(date, 'h.mm aa do MMMM')} reservation is Booked by ${patient.username}` 
    }
  };

  try {
    await SendFirebaseNotification(doctor.firebase_token, notification);
  }
  catch (err) {
    console.log(err)
    res.status(500);
    throw new Error("Some things went worong , Please try again")
  }


    // send email to doctor 
  try {
    await sentEMail({
        "body": `<p> Hey ${doctor.username}, your appointment successfully booked</p>`,
        "to": patient.email,
        "subject": "You have new Appointment",

    })
}
catch (err) {
  console.log(err)
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
  }).populate("doctor");
  const pastAappointments = await Appointment.find({
    patient_user_id,
    unixTimestamp: { $lt: currentUnixTimestamp },
  }).populate("doctor");


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
    "doctor_user_id": appointment.doctor_user_id,
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



  ////  sending notification 
  const patient = await userModel.findById(appointment.patient_user_id)

  let notification = {
    title: 'New Swap Request',
    body: `Hey ${patient.username}, someone wants your reservation. Do you want to swap it?`,

    click_action: 'http://localhost:8081'
  };





  const snotification = await SendFirebaseNotification(patient.firebase_token, notification);
  res.json({ notification })





  //   After swapping requests sent:
  // Hey (first name of appointment owner) anyone want your a reservation.
  // Do you want to swap it?

  // After accept swap request accept:congratulations (first name who sent swap request)!!  (First name of appointment owner) accept your swap request.
  // Enjoy your reservation!!




  // let   notification= {
  //   title: 'hello 5',
  //   body: ' did you get it '
  // }

  //  const  snotification =  await SendFirebaseNotification(patient.firebase_token, notification) ;




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
    "status": 0,
    unixTimestamp: { $gt: currentUnixTimestamp },
  }).populate({
    path: 'patient',
    select: '_id username email firebase_token',
  }).populate({
    path: 'requested_patient',
    select: '_id username email firebase_token',
  }).populate('appointment')
    .populate('doctor');


  const prevSendSwapRequests = await SwapAppontment.find({
    "requested_user_id": user_id,
    "status": 0,
    unixTimestamp: { $lt: currentUnixTimestamp },
  }).populate({
    path: 'patient',
    select: '_id username email firebase_token',
  }).populate({
    path: 'requested_patient',
    select: '_id username email firebase_token',
  }).populate('appointment')
    .populate('doctor');


  const nextGetSwapRequests = await SwapAppontment.find({
    "patient_user_id": user_id,
    "status": 0,
    unixTimestamp: { $gt: currentUnixTimestamp },
  }).populate({
    path: 'patient',
    select: '_id username email firebase_token',
  }).populate({
    path: 'requested_patient',
    select: '_id username email firebase_token',
  }).populate('appointment')
    .populate('doctor');


  const prevGetSwapRequests = await SwapAppontment.find({
    "patient_user_id": user_id,
    "status": 0,
    unixTimestamp: { $lt: currentUnixTimestamp },
  }).populate({
    path: 'patient',
    select: '_id username email firebase_token',
  }).populate({
    path: 'requested_patient',
    select: '_id username email firebase_token',
  }).populate('appointment')
    .populate('doctor');




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



// @desc    Get a single appointment
// @route   GET /api/v1/get-swap-request/:id
// @access  Public
const GetSwapRequestById = asyncHandler(async (req, res) => {

  const swap_request_id = req.params.id;



  const swapRequest = await SwapAppontment.findByIdAndUpdate(
    swap_request_id,
    { isViewed: 1 },
    { new: true }
  ).populate({
    path: 'patient',
    select: '_id username email firebase_token',
  }).populate({
    path: 'requested_patient',
    select: '_id username email firebase_token',
  }).populate('appointment')
    .populate('doctor');;






  if (!swapRequest) {
    res.status(404);
    throw new Error("swap request Not Found")
  }




  res.status(200).json(
    {
      swapRequest,
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

  const appointment_id = swapRequest.appointment_id;


  if (!swapRequest) {
    res.status(404);
    throw new Error("swapRequest Not Found")
  }

  if (swapRequest.status == 1) {
    res.status(400);
    throw new Error("Already Accepted")
  }


  if (swapRequest.status == 2) {
    res.status(400);
    throw new Error("Already cancelled")
  }





  if (!status) {

    await SwapAppontment.findByIdAndUpdate(
      swapRequest.id,
      { status: 2 },
      { new: true }
    );






    res.status(200).json(
      {
        "msg": "Request cencell Successfull",
        "appointment": await Appointment.findById(swapRequest.appointment_id),


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
      { amount: owner.amount + swapRequest.amount },
      { new: true }
    );
    await User.findByIdAndUpdate(
      swapRequest.requested_user_id,
      { amount: requestSender.amount - swapRequest.amount },
      { new: true }
    );
    // status change 





    const allSwapAppointment = await SwapAppontment.find({ appointment_id })
    for (const srequest of allSwapAppointment) {
      await SwapAppontment.findByIdAndUpdate(
        srequest.id,
        { status: 2 },
        { new: true }
      );
    }




    await SwapAppontment.findByIdAndUpdate(
      swapRequest.id,
      { status: 1 },
      { new: true }
    );


    console.log("accepted")
    // update appointment




    await Appointment.findByIdAndUpdate(
      swapRequest.appointment_id,
      { $set: { "patient_user_id": requestSender.id } },

      { new: true }
    );
    console.log("done")


    ////  sending notification 

    // start sencd notification  
    const patient = await userModel.findById(swapRequest.patient_user_id)
    const RequestedUser = await userModel.findById(swapRequest.requested_user_id)
    console.log("             -----       sending notification  -------------------------")
    console.log("patient ", patient)
    console.log("RequestedUser", RequestedUser)
    let notification = {
      title: 'Swap Request Accepted',
      body: `congratulations ${RequestedUser.username}!!  ${patient.username} accept your swap request. Enjoy your reservation!!`,
      click_action: 'http://localhost:8081'
    };



    const snotification = await SendFirebaseNotification(RequestedUser.firebase_token, notification
    );

    // end send notification 


    res.status(200).json(
      {
        "msg": "Request Accepted Successfull",
        "Extra": {
          owner,
          requestSender,
          swapRequest,
          "appointment": await Appointment.findById(swapRequest.appointment_id),

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
  GetSwapRequestById,
  ResponseSwapRequest

};
