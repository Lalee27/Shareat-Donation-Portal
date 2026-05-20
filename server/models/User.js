const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, trim: true },
  role: { type: String, enum: ['donor', 'ngo', 'admin'], default: 'donor' },
  
  // NGO specific fields
  organizationName: { type: String, trim: true },
  registrationNumber: { type: String, trim: true },
  description: { type: String },
  isVerified: { type: Boolean, default: false },

  // Email Verification (OTP System)
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String },
  emailVerificationExpires: { type: Date },

  // Address
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  
  // Profile
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  totalDonations: { type: Number, default: 0 },
  impactScore: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Indexes for high performance and scalability
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
