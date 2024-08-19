// mail.js
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

// Function to send email
const sendEmail = async (to, subject, userName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: `Dear ${userName},

${subject}

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
