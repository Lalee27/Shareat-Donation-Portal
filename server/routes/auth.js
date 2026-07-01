const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { OAuth2Client } = require('google-auth-library');
const sendEmail = require('../utils/sendEmail');

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'your_google_client_id_here');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user._id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'donation_platform_jwt_secret_key_2026';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, organizationName, registrationNumber, description, address } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const lowerEmail = email.toLowerCase().trim();

    if (!validateEmail(lowerEmail)) {
      return res.status(400).json({ message: 'Email is invalid.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email: lowerEmail }, { secondaryEmails: lowerEmail }] });
    if (existingUser) {
      // Agar user hai but email verified nahi hai, toh usse dubara OTP bhejo
      if (!existingUser.isEmailVerified) {
        const otp = generateOTP();
        existingUser.emailVerificationCode = otp;
        existingUser.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
        await existingUser.save();

        await sendEmail({
          email: existingUser.email,
          subject: 'Shareat - Email Verification Code',
          message: `Hello ${existingUser.name},\n\nYour email verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\n- Shareat Team`
        });

        return res.status(200).json({ 
          message: 'Verification code resent to your email.',
          requiresVerification: true,
          email: existingUser.email
        });
      }
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP for email verification
    const otp = generateOTP();

    // Create user (email unverified by default)
    const user = new User({
      name,
      email: lowerEmail,
      password: hashedPassword,
      phone,
      role: role || 'donor',
      organizationName,
      registrationNumber,
      description,
      address,
      isVerified: role === 'donor' ? true : false,
      isEmailVerified: false,
      emailVerificationCode: otp,
      emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000) // OTP valid for 10 minutes
    });

    await user.save();

    // Send OTP email to the user (non-fatal)
    try {
      await sendEmail({
        email: user.email,
        subject: 'Shareat - Verify Your Email',
        message: `Hello ${user.name},\n\nWelcome to Shareat! Your email verification code is:\n\n${otp}\n\nThis code will expire in 10 minutes. Please enter it on the verification page to activate your account.\n\nThank you,\nShareat Team`
      });
      console.log(`📧 OTP sent to ${user.email}: ${otp}`);
    } catch (emailError) {
      console.error('⚠️ Email sending failed (non-fatal):', emailError.message);
      console.log(`📋 OTP for ${user.email}: ${otp}`);
    }

    res.status(201).json({ 
      message: 'Registration successful! Please check your email for the verification code.',
      requiresVerification: true,
      email: user.email
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: messages });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
});


// POST /api/auth/verify-email - Verify OTP code
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required.' });
    }

    const lowerEmail = email.toLowerCase().trim();
    if (!validateEmail(lowerEmail)) {
      return res.status(400).json({ message: 'Email is invalid.' });
    }
    const user = await User.findOne({ email: lowerEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email.' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified. Please login.' });
    }

    // Check if OTP matches
    if (user.emailVerificationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code. Please try again.' });
    }

    // Check if OTP is expired
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    // Mark email as verified and clear OTP fields
    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Generate JWT and auto-login
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log(`✅ Email verified successfully for: ${user.email}`);

    res.json({ 
      message: 'Email verified successfully!', 
      token, 
      user: userResponse 
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification.' });
  }
});

// POST /api/auth/resend-otp - Resend verification code
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const lowerEmail = email.toLowerCase().trim();
    if (!validateEmail(lowerEmail)) {
      return res.status(400).json({ message: 'Email is invalid.' });
    }
    const user = await User.findOne({ email: lowerEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email.' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified.' });
    }

    // Generate new OTP
    const otp = generateOTP();
    user.emailVerificationCode = otp;
    user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send new OTP
    await sendEmail({
      email: user.email,
      subject: 'Shareat - New Verification Code',
      message: `Hello ${user.name},\n\nYour new email verification code is:\n\n${otp}\n\nThis code will expire in 10 minutes.\n\n- Shareat Team`
    });

    console.log(`📧 New OTP resent to ${user.email}: ${otp}`);

    res.json({ message: 'New verification code sent to your email.' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error resending verification code.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const lowerEmail = email.toLowerCase().trim();

    if (!validateEmail(lowerEmail)) {
      return res.status(400).json({ message: 'Email is invalid.' });
    }

    // Find user
    const user = await User.findOne({ $or: [{ email: lowerEmail }, { secondaryEmails: lowerEmail }] });
    if (!user) {
      return res.status(400).json({ message: 'Email is invalid.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password.' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      // Automatically resend a fresh OTP
      const otp = generateOTP();
      user.emailVerificationCode = otp;
      user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await sendEmail({
        email: user.email,
        subject: 'Shareat - Verify Your Email',
        message: `Hello ${user.name},\n\nYour email verification code is:\n\n${otp}\n\nThis code will expire in 10 minutes.\n\n- Shareat Team`
      });

      return res.status(403).json({ 
        message: 'Please verify your email first. A new verification code has been sent to your email.',
        requiresVerification: true,
        email: user.email
      });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ token, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { access_token, role } = req.body;
    
    // Verify the Google token by fetching user info
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    
    if (!response.ok) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }
    
    const payload = await response.json();
    const { email, name, picture } = payload;

    const lowerEmail = email.toLowerCase().trim();

    // Check if user exists
    let user = await User.findOne({ $or: [{ email: lowerEmail }, { secondaryEmails: lowerEmail }] });
    
    if (!user) {
      // If user doesn't exist, create a new one
      user = new User({
        name,
        email: lowerEmail,
        password: await bcrypt.hash(Date.now().toString() + Math.random().toString(), 10), // Random placeholder password
        role: role || 'donor', // default role
        avatar: picture,
        isVerified: true
      });
      await user.save();
    }

    // Generate JWT
    const jwtToken = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ token: jwtToken, user: userResponse });
  } catch (error) {
    console.error('Google Auth error:', error);
    res.status(500).json({ message: 'Server error during Google authentication.' });
  }
});

// POST /api/auth/google-demo (BYPASS FOR PROJECT DEMO)
router.post('/google-demo', async (req, res) => {
  try {
    const { email, role } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Please provide a valid simulated email.' });
    }

    const lowerEmail = email.toLowerCase().trim();
    const name = lowerEmail.split('@')[0]; // Simple mock name
    const picture = 'https://ui-avatars.com/api/?name=' + name; // Mock avatar

    // Check if user exists
    let user = await User.findOne({ $or: [{ email: lowerEmail }, { secondaryEmails: lowerEmail }] });
    
    if (!user) {
      // Create bypassed user
      user = new User({
        name,
        email: lowerEmail,
        password: await bcrypt.hash('simulated_password_123', 10),
        role: role || 'donor',
        avatar: picture,
        isVerified: true
      });
      await user.save();
    }

    // Generate JWT
    const jwtToken = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ token: jwtToken, user: userResponse });
  } catch (error) {
    console.error('Demo Auth error:', error);
    res.status(500).json({ message: 'Server error during simulated authentication.' });
  }
});

// POST /api/auth/apple-demo (BYPASS FOR PROJECT DEMO)
router.post('/apple-demo', async (req, res) => {
  try {
    const { email, role } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Please provide a valid simulated Apple ID.' });
    }

    const lowerEmail = email.toLowerCase().trim();
    const name = lowerEmail.split('@')[0]; // Simple mock name
    const picture = 'https://ui-avatars.com/api/?name=' + name + '&background=000000&color=ffffff'; // Mock Apple avatar

    // Check if user exists
    let user = await User.findOne({ $or: [{ email: lowerEmail }, { secondaryEmails: lowerEmail }] });
    
    if (!user) {
      // Create bypassed user
      user = new User({
        name,
        email: lowerEmail,
        password: await bcrypt.hash('simulated_apple_password_123', 10),
        role: role || 'donor',
        avatar: picture,
        isVerified: true
      });
      await user.save();
    }

    // Generate JWT
    const jwtToken = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ token: jwtToken, user: userResponse });
  } catch (error) {
    console.error('Apple Demo Auth error:', error);
    res.status(500).json({ message: 'Server error during Apple simulated authentication.' });
  }
});

// GET /api/auth/me - Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/auth/profile - Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, address, bio, description, organizationName } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;
    if (bio !== undefined) updates.bio = bio;
    if (description) updates.description = description;
    if (organizationName) updates.organizationName = organizationName;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile.' });
  }
});

// POST /api/auth/profile/avatar - Upload Avatar
router.post('/profile/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }
    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Error uploading avatar' });
  }
});

// DELETE /api/auth/profile/avatar - Delete Avatar
router.delete('/profile/avatar', auth, async (req, res) => {
  try {
    console.log(`🗑️ Deleting avatar for user: ${req.user._id}`);
    const user = await User.findById(req.user._id);
    if (!user || !user.avatar) {
      console.log('⚠️ No avatar found to delete');
      return res.status(400).json({ message: 'No avatar to delete' });
    }

    // Delete the physical file if it exists and is local
    if (user.avatar.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', user.avatar);
      console.log(`📁 Attempting to delete file: ${filePath}`);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('✅ File deleted successfully');
        }
      } catch (fileErr) {
        console.error('❌ Error deleting physical file:', fileErr);
      }
    }

    user.avatar = '';
    await user.save();
    console.log('✅ User record updated (avatar removed)');

    const userResponse = user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (error) {
    console.error('❌ Avatar delete error:', error);
    res.status(500).json({ message: 'Error deleting avatar' });
  }
});

// PUT /api/auth/password - Update password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both current and new passwords' });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating password' });
  }
});

// DELETE /api/auth/account - Permanent account deletion
router.delete('/account', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // In a real app, you might want to also delete their donations or mark them as anonymous
    // For this project, we'll delete the user and their avatar
    
    const user = await User.findById(userId);
    if (user && user.avatar && user.avatar.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'Account permanently deleted' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ message: 'Server error deleting account' });
  }
});

// POST /api/auth/emails - Add a secondary email
router.post('/emails', auth, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const lowerEmail = email.toLowerCase().trim();

    if (!validateEmail(lowerEmail)) {
      return res.status(400).json({ message: 'Email is invalid.' });
    }

    // Check if email already in use
    const existingUser = await User.findOne({ $or: [{ email: lowerEmail }, { secondaryEmails: lowerEmail }] });
    if (existingUser) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    const user = await User.findById(req.user._id);
    if (!user.secondaryEmails) user.secondaryEmails = [];
    user.secondaryEmails.push(lowerEmail);
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error adding email' });
  }
});

// DELETE /api/auth/emails/:email - Remove a secondary email
router.delete('/emails/:email', auth, async (req, res) => {
  try {
    const emailToRemove = req.params.email.toLowerCase().trim();
    const user = await User.findById(req.user._id);
    
    if (user.secondaryEmails && user.secondaryEmails.includes(emailToRemove)) {
      user.secondaryEmails = user.secondaryEmails.filter(e => e !== emailToRemove);
      await user.save();
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error removing email' });
  }
});

// POST /api/auth/forgot-password - Request password reset OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const lowerEmail = email.toLowerCase().trim();

    if (!validateEmail(lowerEmail)) {
      return res.status(400).json({ message: 'Email is invalid.' });
    }

    const user = await User.findOne({ $or: [{ email: lowerEmail }, { secondaryEmails: lowerEmail }] });

    if (!user) {
      return res.status(404).json({ message: 'User not found with this email.' });
    }

    const otp = generateOTP();
    user.resetPasswordCode = otp;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'Shareat - Password Reset Code',
      message: `Hello ${user.name},\n\nYour password reset code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request a password reset, you can safely ignore this email.\n\n- Shareat Team`
    });

    res.json({ message: 'Password reset code sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error requesting password reset.' });
  }
});

// POST /api/auth/reset-password - Reset password using OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, code, and new password are required.' });
    }

    const lowerEmail = email.toLowerCase().trim();

    if (!validateEmail(lowerEmail)) {
      return res.status(400).json({ message: 'Email is invalid.' });
    }

    const user = await User.findOne({ $or: [{ email: lowerEmail }, { secondaryEmails: lowerEmail }] });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.resetPasswordCode !== code) {
      return res.status(400).json({ message: 'Invalid reset code.' });
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: 'Reset code has expired. Please request a new one.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Clear reset tokens
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error resetting password.' });
  }
});

// GET /api/auth/preferences - Load user preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences');
    // Return defaults if preferences not yet saved
    const prefs = user.preferences || {
      notifications: { email: true, push: true, impact: true },
      darkMode: false,
      twoFactorEnabled: false,
      loginAlerts: true,
    };
    res.json(prefs);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ message: 'Server error fetching preferences.' });
  }
});

// PUT /api/auth/preferences - Save user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { notifications, darkMode, twoFactorEnabled, loginAlerts } = req.body;
    const updates = {};

    if (notifications !== undefined) updates['preferences.notifications'] = notifications;
    if (darkMode !== undefined) updates['preferences.darkMode'] = darkMode;
    if (twoFactorEnabled !== undefined) updates['preferences.twoFactorEnabled'] = twoFactorEnabled;
    if (loginAlerts !== undefined) updates['preferences.loginAlerts'] = loginAlerts;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select('preferences');

    res.json(user.preferences);
  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(500).json({ message: 'Server error saving preferences.' });
  }
});

module.exports = router;
