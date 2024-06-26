const express = require("express");
const {
  registerUser,
  currentUser,
  loginUser,
  verifyUserOtpToken,
  reSendVerificationOTP,
  updateUserToken,
  updateFirebaseToken,
} = require("../../controllers/v1/userController");
const validateToken = require("../../middleware/v1/validateTokenHandler");
const checkUserIsActive = require("../../middleware/v1/userIsActiveHandler");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/current", validateToken, currentUser);
router.post("/resend-verification-email", validateToken, reSendVerificationOTP);
router.get("/verify-user-otp-token", validateToken, verifyUserOtpToken);

router.post("/update-user-token", validateToken, updateUserToken);
router.post("/update-firebase-token", validateToken, updateFirebaseToken);


module.exports = router;