const asyncHandler = require("express-async-handler");
const User = require("../../models/userModel")

const checkUserIsActive = asyncHandler(async (req, res, next) => {
  
  const email = req.user.email;

  const user = await User.findOne({ email });
 console.log("user---------------------------------------")
 console.log(user)
 console.log("user ---------------------------------------------- ennd " )
  if (!user) {

    res.status(401);
    throw new Error("Email or Password is wrong ");

  }
  else if (!user.is_verified) {
    res.status(403);
    throw new Error("User is not active");
  }
  else {
    next();
  }




});

module.exports = checkUserIsActive;
