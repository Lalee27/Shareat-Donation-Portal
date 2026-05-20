// One-time migration script: Mark all existing users as email-verified
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/donation-platform';

mongoose.connect(MONGODB_URI).then(async () => {
  const result = await User.updateMany(
    { isEmailVerified: { $ne: true } },
    { $set: { isEmailVerified: true } }
  );
  console.log(`✅ Migration complete: ${result.modifiedCount} existing users marked as email-verified.`);
  process.exit(0);
}).catch(e => {
  console.error('❌ Migration failed:', e);
  process.exit(1);
});
