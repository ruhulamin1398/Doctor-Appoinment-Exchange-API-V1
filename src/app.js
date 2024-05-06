require("dotenv").config();
const express = require('express');
const app = express();
require("./db/conn")
const errorHandler = require("./middleware/v1/errorHandler");
const path = require('path'); // Add this line






const userRoute = require("./routers/v1/userRoutes");
const contactRoutes = require("./routers/v1/contactRoutes");
const doctorRoute = require("./routers/v1/doctorRoutes");
const appointmentsRoutes = require("./routers/v1/appointmentsRoutes");



const wordRoutes = require("./routers/v1/wordRoutes"); 
const AsyncHandler = require("express-async-handler");
const User = require("./models/userModel");
const VerificationCode  = require("./models/verificationCodeModel"); 
const doctorProfile = require("./models/doctorProfileModel");
const appointmentModel = require("./models/appointmentModel");


// Middleware to parse JSON in the request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/hi', AsyncHandler(async(req,res)=>{
  // Update all existing documents to include the new fields
 await User.updateMany({}, { $set: { is_verified: false, verification_code: 0 } });
 res.json({ "msg" : "done"})

}));
// for no production only , please remove before deploy
app.get('/clean-data', AsyncHandler(async(req,res)=>{
  
  
  // await User.deleteMany({});
  // await doctorProfile.deleteMany({});
  // await VerificationCode.deleteMany({})
  const result = await appointmentModel.find({})

   
 res.json({result })

}));

app.get('/users', AsyncHandler(async(req,res)=>{

  const users = await User.find({});
  
 res.json({ users})

}));

  

// Use the user routec 
app.use('/api/v1/users', userRoute);
// Use the doctor routec 
app.use('/api/v1/doctors', doctorRoute);

app.use('/api/v1/contacts', contactRoutes);
app.use('/api/v1/appointments', appointmentsRoutes);


app.use( wordRoutes);
 


app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('views', path.join(__dirname, 'views')); // Set the views directory path


app.use(errorHandler);
const PORT  = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
