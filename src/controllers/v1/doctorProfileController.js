const asyncHandler = require("express-async-handler");
const DoctorProfile = require("../../models/doctorProfileModel");
const { response } = require("express");
const Appointment = require("../../models/appointmentModel");
const userModel = require("../../models/userModel");
const doctorProfileModel = require("../../models/doctorProfileModel");

// @desc    Create a doctor profile
// @route   POST /api/v1/doctors
// @access  Public
const createDoctorProfile = asyncHandler(async (req, res) => {

  const { name, img, rating, degree, designation, location, availableDays, availableTimes } = req.body;
  const user_id = req.user.id;
  const doctor = await DoctorProfile.findOne({ user_id: user_id });

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
    availableDays,
    availableTimes,
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
  const { name, img, rating, degree, location, designation, advanceDay, availableDays, availableTimes } = req.body;
  
  const user_id = req.user.id;  
  const doctorProfile = await doctorProfileModel.findOne({ "user_id":user_id });

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
  doctorProfile.advanceDay = advanceDay || doctorProfile.advanceDay;
  doctorProfile.availableDays = availableDays || doctorProfile.availableDays;
  doctorProfile.availableTimes = availableTimes || doctorProfile.availableTimes;
  
  
  console.log(doctorProfile)

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

  if (!doctorProfile) {
    res.status(400);
    throw new Error("Doctor Profile Doesn't Exist");
  }

  const startDate = new Date(); // Use the current date as the starting point

  const appointments = generateSchedules(
    startDate,
    doctorProfile.availableDays,
    doctorProfile.availableTimes,
    doctorProfile.advanceDay,
    doctorProfile.user_id
  );

  const batchSize = 50; // Adjust based on your database performance

  try {
    let createdAppointments = [];
    for (let i = 0; i < appointments.length; i += batchSize) {
      const batch = appointments.slice(i, i + batchSize);
      const createdBatch = await Promise.all(batch.map(async (appointment) => {
        const { doctor_user_id, unixTimestamp } = appointment;

        // Check if an appointment with the same doctor_user_id and unixTimestamp exists
        const existingAppointment = await Appointment.findOne({
          doctor_user_id,
          unixTimestamp,
        });

        // If the appointment doesn't exist, create it
        if (!existingAppointment) {
          return Appointment.create(appointment);
        } else {
          console.log(`Appointment already exists: ${doctor_user_id} - ${unixTimestamp}`);
          return null; // Avoid unnecessary creation of existing appointments
        }
      }));
      createdAppointments = createdAppointments.concat(createdBatch.filter(Boolean)); // Filter out null values from existing appointments
    }

    console.log(`Created ${createdAppointments.length} appointments`);

    const currentUnixTimestamp = Math.floor(new Date().getTime() / 1000);
    const existingAppointments = await Appointment.find({
      doctor_user_id: user_id,
      unixTimestamp: { $gt: currentUnixTimestamp },
    }).populate("patient").populate("swap-request");

    const groupedByDay = groupAppointmentsByDay(existingAppointments);

    res.status(200).json({
      appointments: groupedByDay,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating appointments" });
  }
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

const groupAppointmentsByDay = (appointments) => {
  const groupedAppointments = {};

  appointments.forEach((appointment) => {
    const dateKey = appointment.date.toISOString().split('T')[0]; // Convert to string and extract YYYY-MM-DD

    if (!groupedAppointments[dateKey]) {
      groupedAppointments[dateKey] = [];
    }

    groupedAppointments[dateKey].push(appointment);
  });

  // Sort appointments within each group by time
  Object.keys(groupedAppointments).forEach((dateKey) => {
    groupedAppointments[dateKey].sort((a, b) => a.time.localeCompare(b.time));
  });

  return groupedAppointments;
};

module.exports = {
  createDoctorProfile,
  getAllDoctorProfiles,
  getDoctorProfileById,
  updateDoctorProfile,
  deleteDoctorProfile,
  getDoctorAppointments,
};
