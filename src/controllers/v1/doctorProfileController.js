const asyncHandler = require("express-async-handler");
const DoctorProfile = require("../../models/doctorProfileModel");
const { response } = require("express");
const Appointment = require("../../models/appointmentModel");

// @desc    Create a doctor profile
// @route   POST /api/v1/doctors
// @access  Public
const createDoctorProfile = asyncHandler(async (req, res) => {

  const { name, img, rating, degree, designation, location, availableDate, availableTime } = req.body;
  const user_id = req.user.id;
  const doctor = await DoctorProfile.findOne({ user_id });

  if (doctor) {
    res.status(400);
    throw new Error("Doctor Profile Already Exist");


  }



  const doctorProfile = await DoctorProfile.create({
    name,
    user_id,
    img,
    rating,
    degree,
    location,
    designation,
    availableDate,
    availableTime,
  });

  res.status(201).json({
    msg: "Doctor profile created successfully",
    doctorProfile,
  });
});

// @desc    Get all doctor profiles
// @route   GET /api/v1/doctors
// @access  Public
const getAllDoctorProfiles = asyncHandler(async (req, res) => {
  console.log(" all Doctor profile called")

  const doctorProfiles = await DoctorProfile.find();
  res.status(200).json({
    doctorProfiles,
  });
});

// @desc    Get a single doctor profile
// @route   GET /api/v1/doctors/:id
// @access  Public
const getDoctorProfileById = asyncHandler(async (req, res) => {

  const user_id = req.params.id;
  const doctorProfile = await DoctorProfile.findOne({ user_id });


  if (!doctorProfile) {
    res.status(404);
    throw new Error("Doctor profile not found");
  }

  res.status(200).json({
    doctorProfile,
  });
});

// @desc    Update a doctor profile
// @route   PUT /api/v1/doctors
// @access  Public
const updateDoctorProfile = asyncHandler(async (req, res) => {
  const { name, img, rating, degree, location, designation, availableDate, availableTime } = req.body;

  const user_id = req.user.id;
  const doctorProfile = await DoctorProfile.findOne({ user_id });

  if (!doctorProfile) {
    res.status(404);
    throw new Error("Doctor profile not found");
  }

  doctorProfile.name = name || doctorProfile.name;
  doctorProfile.img = img || doctorProfile.img;
  doctorProfile.rating = rating || doctorProfile.rating;
  doctorProfile.degree = degree || doctorProfile.degree;
  doctorProfile.location = location || doctorProfile.location;
  doctorProfile.designation = designation || doctorProfile.designation;
  doctorProfile.availableDate = availableDate || doctorProfile.availableDate;
  doctorProfile.availableTime = availableTime || doctorProfile.availableTime;

  await doctorProfile.save();

  res.status(200).json({
    msg: "Doctor profile updated successfully",
    doctorProfile,
  });
});

// @desc    Delete a doctor profile
// @route   DELETE /api/v1/doctors/:id
// @access  Public
const deleteDoctorProfile = asyncHandler(async (req, res) => {

  const user_id = req.user.id;
  const doctorProfile = await DoctorProfile.findOne({ user_id });



  if (!doctorProfile) {
    res.status(404);
    throw new Error("Doctor profile not found");
  }

  // await doctorProfile.remove();
  await DoctorProfile.deleteOne({ user_id });

  res.status(200).json({
    msg: "Doctor profile deleted successfully",
  });
});



// @desc    Get a doctor appointments
// @route   GET /api/v1/doctors/:id/appointments
// @access  Public
const getDoctorAppointments = asyncHandler(async (req, res) => {

  const user_id = req.params.id;
  const doctorProfile = await DoctorProfile.findOne({ user_id });



  const startDate = new Date(); // Use the current date as the starting point


  const appointments = generateSchedules(
    startDate,
    doctorProfile.availableDays,
    doctorProfile.availableTimes,
    doctorProfile.advanceDay,
    doctorProfile.user_id,
  );


  for (const appointment of appointments) {
    const { doctor_user_id, unixTimestamp } = appointment;

    // Check if an appointment with the same doctor_user_id and unixTimestamp exists
    const existingAppointment = await Appointment.findOne({
      doctor_user_id,
      unixTimestamp,
    });

    // If the appointment doesn't exist, create it
    if (!existingAppointment) {
     const temp= await Appointment.create(appointment);
     console.log(temp)
      console.log(`Appointment created: ${doctor_user_id} - ${unixTimestamp}`);
    } else {
      console.log(`Appointment already exists: ${doctor_user_id} - ${unixTimestamp}`);
    }
  }

  const currentUnixTimestamp = Math.floor(new Date().getTime() / 1000);
  const existingAppointments = await Appointment.find({
    doctor_user_id:user_id,
    unixTimestamp: { $gt: currentUnixTimestamp },
  }).populate("patient");;

  res.status(200).json({
    appointments:existingAppointments,
  })

});




function getUnixTimestamp(date, time) {
  const [hours, minutes] = time.split(':');
  const scheduleDate = new Date(date);
  scheduleDate.setHours(hours, minutes, 0, 0);
  return Math.floor(scheduleDate.getTime() / 1000);
}

function generateSchedules(startDate, availableDays, availableTime, numberOfDays, doctorsUserId) {
  const schedules = [];

  for (let i = 0; i < numberOfDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    const currentDay = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

    if (availableDays.includes(currentDay)) {
      availableTime.forEach((time) => {
        const unixTimestamp = getUnixTimestamp(currentDate, time);
        schedules.push({
          doctor_user_id: doctorsUserId,
          date: currentDate.toISOString(),
          day: currentDay,
          time: time,
          unixTimestamp: unixTimestamp,
        });
      });
    }
  }

  return schedules;
}




module.exports = {
  createDoctorProfile,
  getAllDoctorProfiles,
  getDoctorProfileById,
  updateDoctorProfile,
  deleteDoctorProfile,
  getDoctorAppointments,
};
