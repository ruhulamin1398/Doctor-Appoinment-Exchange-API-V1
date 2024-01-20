const express = require("express");
const {
  BookAppointment,
  SwapAppointment
 
} = require("../../controllers/v1/appointmentController");
const validateToken = require("../../middleware/v1/validateTokenHandler");

const router = express.Router();
router.use(validateToken);

// @desc    book a doctor appointment
// @route   POST /api/v1/book-appointment
// @access  Public 
router.post("/book-appointment", BookAppointment);

// @desc    swap a doctor appointment
// @route   POST /api/v1/swap-appointment
// @access  Public 
router.post("/swap-appointment", SwapAppointment);
 
 
  

module.exports = router;
