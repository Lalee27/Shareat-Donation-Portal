const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Donation = require('../models/Donation');
const { auth, requireRole } = require('../middleware/auth');

// GET /api/admin/stats - Platform-wide statistics
router.get('/stats', auth, requireRole('admin'), async (req, res) => {
  try {
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalNgos = await User.countDocuments({ role: 'ngo' });
    const verifiedNgos = await User.countDocuments({ role: 'ngo', isVerified: true });
    const pendingNgos = await User.countDocuments({ role: 'ngo', isVerified: false });
    
    const totalDonations = await Donation.countDocuments();
    const pendingDonations = await Donation.countDocuments({ status: 'pending' });
    const collectedDonations = await Donation.countDocuments({ status: 'collected' });
    const distributedDonations = await Donation.countDocuments({ status: 'distributed' });

    // Calculate total items donated
    const allDonations = await Donation.find();
    const totalItems = allDonations.reduce((sum, d) => sum + d.items.reduce((s, item) => s + item.quantity, 0), 0);

    res.json({
      users: { totalDonors, totalNgos, verifiedNgos, pendingNgos },
      donations: { totalDonations, pendingDonations, collectedDonations, distributedDonations, totalItems }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/admin/users - Get all users
router.get('/users', auth, requireRole('admin'), async (req, res) => {
  try {
    const { role, verified } = req.query;
    let query = {};
    if (role) query.role = role;
    if (verified !== undefined) query.isVerified = verified === 'true';

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/admin/users/:id/verify - Verify/unverify an NGO
router.put('/users/:id/verify', auth, requireRole('admin'), async (req, res) => {
  try {
    const { isVerified } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/admin/users/:id - Remove a user
router.delete('/users/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/admin/donations - Get all donations with full details
router.get('/donations', auth, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const donations = await Donation.find(query)
      .populate('donor', 'name email phone')
      .populate('assignedNgo', 'name organizationName')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/admin/ngos - Get verified NGOs list (public for donors)
router.get('/ngos', auth, async (req, res) => {
  try {
    const ngos = await User.find({ role: 'ngo', isVerified: true })
      .select('name organizationName description address totalDonations')
      .sort({ totalDonations: -1 });
    res.json(ngos);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
