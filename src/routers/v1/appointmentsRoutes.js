const express = require("express");
const {
  BookAppointment,
  SwapAppointment,
  GetAppointmentDetails,
  GetMyAppointment,
  GetMySwapRequests,
  ResponseSwapRequest,
  GetSwapRequestById
 
} = require("../../controllers/v1/appointmentController");
const validateToken = require("../../middleware/v1/validateTokenHandler");
const checkUserIsActive = require("../../middleware/v1/userIsActiveHandler")

const router = express.Router();
router.use(validateToken);
router.use(checkUserIsActive);


// @desc    book a doctor appointment
// @route   POST /api/v1/book-appointment
// @access  Public 
router.post("/book-appointment", BookAppointment);


// @desc    swap a doctor appointment
// @route   POST /api/v1/appointments/swap-appointment
// @access  Public 
router.post("/swap-appointment", SwapAppointment);

// @desc    my appointment
// @route   GET /api/v1/appointments/my-appointments
// @access  Public 
router.get("/my-appointments", GetMyAppointment);


// @desc    my swap request
// @route   GET /api/v1/appointments/my-swap-requests
// @access  Public 
router.get("/my-swap-requests", GetMySwapRequests);
// @desc    my swap request
// @route   GET /api/v1/appointments/my-swap-requests
// @access  Public 
router.get("/get-swap-request/:id", GetSwapRequestById);
 
 // @desc    response swap request
// @route   GET /api/v1/appointments/response-swap-request
// @access  Public 
router.post("/response-swap-request", ResponseSwapRequest);
  

// @desc    Get a single appointment
// @route   GET /api/v1/appoinments/:id
// @access  Public
router.get("/:id",  GetAppointmentDetails);
module.exports = router;
