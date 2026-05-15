const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  items: [{
    category: { type: String, enum: ['clothes', 'household', 'books', 'electronics', 'toys', 'other'], required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    condition: { type: String, enum: ['new', 'like-new', 'good', 'fair'], default: 'good' },
    description: { type: String }
  }],

  // Pickup details
  pickupAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  pickupDate: { type: Date, required: true },
  pickupTimeSlot: { type: String, required: true },
  
  // Assignment
  assignedNgo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Status tracking
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'scheduled', 'collected', 'distributed', 'cancelled'],
    default: 'pending' 
  },
  
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],

  // Notes
  donorNotes: { type: String },
  ngoNotes: { type: String },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

donationSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Donation', donationSchema);
