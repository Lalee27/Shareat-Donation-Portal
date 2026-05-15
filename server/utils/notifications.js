const Notification = require('../models/Notification');

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
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

module.exports = { createNotification };
