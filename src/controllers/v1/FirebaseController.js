const asyncHandler = require("express-async-handler");   
const userModel = require("../../models/userModel");

const admin = require("firebase-admin");
const {serviceAccount} = require("../../../firebase") 


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});




const SendFirebaseNotification = asyncHandler(async (device_id, notification) => {
     
        const message = {
          notification: notification,
          token: device_id,
    
        };
        console.log("heeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
      
        // Send the message to the device
        admin.messaging().send(message)
          .then((response) => {
            // Message sent successfully
            console.log('Notification sent successfully:', response); 
          })
          .catch((error) => {
            console.error('Error sending notification:', error); 
          });
          return; 
    
});

module.exports = { SendFirebaseNotification };
