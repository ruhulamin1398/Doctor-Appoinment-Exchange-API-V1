const asyncHandler = require("express-async-handler");
const DoctorProfile = require("../../models/doctorProfileModel");
const { response } = require("express");

// @desc    Create a doctor profile
// @route   POST /api/v1/doctors
// @access  Public
const createDoctorProfile = asyncHandler(async (req, res) => {
 
  const { name, img, rating, degree, location, availableDate, availableTime } = req.body;
  const  user_id= req.user.id;
  const doctor = await DoctorProfile.findOne({ user_id});
  
  if(doctor){
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

  const  user_id= req.params.id;
  const doctorProfile = await DoctorProfile.findOne({ user_id});
   

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
  const { name, img, rating, degree, location, availableDate, availableTime } = req.body;

  const  user_id= req.user.id;
  const doctorProfile = await DoctorProfile.findOne({ user_id});

  if (!doctorProfile) {
    res.status(404);
    throw new Error("Doctor profile not found");
  }

  doctorProfile.name = name || doctorProfile.name;
  doctorProfile.img = img || doctorProfile.img;
  doctorProfile.rating = rating || doctorProfile.rating;
  doctorProfile.degree = degree || doctorProfile.degree;
  doctorProfile.location = location || doctorProfile.location;
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

  const  user_id= req.user.id;
  const doctorProfile = await DoctorProfile.findOne({ user_id});

 

  if (!doctorProfile) {
    res.status(404);
    throw new Error("Doctor profile not found");
  }
   
  // await doctorProfile.remove();
  await DoctorProfile.deleteOne({ user_id});

  res.status(200).json({
    msg: "Doctor profile deleted successfully",
  });
});

module.exports = {
  createDoctorProfile,
  getAllDoctorProfiles,
  getDoctorProfileById,
  updateDoctorProfile,
  deleteDoctorProfile,
};
