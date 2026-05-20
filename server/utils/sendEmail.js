const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // 1. Create a transporter
    // For Gmail, we use 'gmail' service.
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2. Define the email options
    const mailOptions = {
      from: `Shareat Platform <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      // html: options.html // (Optional) If you want to send rich HTML emails
    };

    // 3. Send the email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to: ${options.email}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};

module.exports = sendEmail;
