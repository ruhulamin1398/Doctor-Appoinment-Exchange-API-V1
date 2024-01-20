const express = require("express");
const {
  createDoctorProfile,
  getAllDoctorProfiles,
  getDoctorProfileById,
  updateDoctorProfile,
  deleteDoctorProfile,
} = require("../../controllers/v1/doctorProfileController");
const validateToken = require("../../middleware/v1/validateTokenHandler");

const router = express.Router();
router.use(validateToken);

// @desc    Create a doctor profile
// @route   POST /api/v1/doctors
// @access  Public
router.post("/", createDoctorProfile);

// @desc    Get all doctor profiles
// @route   GET /api/v1/doctors
// @access  Public
router.get("/", getAllDoctorProfiles);

// @desc    Get a single doctor profile
// @route   GET /api/v1/doctors/:id
// @access  Public
router.get("/:id",  getDoctorProfileById);

// @desc    Update a doctor profile
// @route   PUT /api/v1/doctors/:id
// @access  Public
router.put("/", updateDoctorProfile);

// @desc    Delete a doctor profile
// @route   DELETE /api/v1/doctors/:id
// @access  Public
router.delete("/",  deleteDoctorProfile);

module.exports = router;
