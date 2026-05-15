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

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'donor',
      organizationName,
      registrationNumber,
      description,
      address,
      isVerified: role === 'donor' ? true : false // Donors auto-verified, NGOs need admin approval
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ token, user: userResponse });
  } catch (error) {
    console.error('Registration error:', error);
    // Return Mongoose validation errors as readable messages
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: messages });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
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

    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // If user doesn't exist, create a new one
      user = new User({
        name,
        email,
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

    const name = email.split('@')[0]; // Simple mock name
    const picture = 'https://ui-avatars.com/api/?name=' + name; // Mock avatar

    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create bypassed user
      user = new User({
        name,
        email,
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

    const name = email.split('@')[0]; // Simple mock name
    const picture = 'https://ui-avatars.com/api/?name=' + name + '&background=000000&color=ffffff'; // Mock Apple avatar

    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create bypassed user
      user = new User({
        name,
        email,
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

module.exports = router;
