const Notification = require('../models/Notification');
const User = require('../models/User');
const sendEmail = require('./sendEmail');

/**
 * Create a notification for a user
 * @param {string} userId - ID of the recipient
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - 'info', 'success', 'warning', 'impact'
 * @param {string} donationId - Optional related donation ID
 */
const createNotification = async (userId, title, message, type = 'info', donationId = null) => {
  try {
    const notification = new Notification({
      recipient: userId,
      title,
      message,
      type,
      relatedDonation: donationId
    });
    await notification.save();

    // Fetch the user to get their email address
    const user = await User.findById(userId);
    if (user && user.email) {
      // Send real email via Nodemailer
      await sendEmail({
        email: user.email,
        subject: `Shareat Update: ${title}`,
        message: `Hello ${user.name},\n\n${message}\n\nThank you for being part of Shareat!\n- Shareat Team`
      });
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification & sending email:', error);
    return null;
  }
};

module.exports = { createNotification };
