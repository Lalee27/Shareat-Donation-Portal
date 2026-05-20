const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'impact'],
    default: 'info'
  },
  unread: {
    type: Boolean,
    default: true
  },
  relatedDonation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for high performance and scalability
notificationSchema.index({ recipient: 1, unread: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
