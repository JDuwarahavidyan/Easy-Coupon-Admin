const nodemailer = require('nodemailer');
require('dotenv').config(); 

// Set up Nodemailer transport configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});


const sendEmail = async (to, subject, fullName, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: `Dear ${fullName},

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
