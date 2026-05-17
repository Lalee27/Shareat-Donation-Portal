const mongoose = require('mongoose');
const User = require('./models/User');
const Donation = require('./models/Donation');
require('dotenv').config();

async function createDummy() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/donation-platform';
    await mongoose.connect(mongoUri);
    console.log('Connected to DB');

    const donor = await User.findOne({ role: 'donor' });
    if (!donor) {
      console.log('No donor found. Creating one...');
      // Just for safety if no donor exists
      return;
    }

    const newDonation = new Donation({
      donor: donor._id,
      items: [
        { category: 'clothes', name: 'Winter Coats & Sweaters', quantity: 5, condition: 'good' },
        { category: 'household', name: 'Kitchen Supplies', quantity: 1, condition: 'like-new' },
        { category: 'other', name: 'Canned Goods Collection', quantity: 20, condition: 'new' }
      ],
      pickupAddress: { street: '123 Main St', city: 'Vadodara', state: 'Gujarat', pincode: '390001' },
      pickupDate: new Date(Date.now() + 86400000), // Tomorrow
      pickupTimeSlot: 'morning',
      status: 'pending'
    });

    await newDonation.save();
    console.log('Dummy donation created successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createDummy();
