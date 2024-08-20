const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables

// Set up Nodemailer transport configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS  // Your app password
  }
});

// Helper function to capitalize the first letter of the user's name
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

// Common function to send an email with a flexible message body
const sendEmail = async (to, subject, userName, message) => {
  const formattedUserName = capitalizeFirstLetter(userName);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: `Dear ${formattedUserName},

${message}

Thank you.

Best Regards,
Easy Coupon Team.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendEmail
};
