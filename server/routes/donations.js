const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const { createNotification } = require('../utils/notifications');

// POST /api/donations - Create a new donation (donor only)
router.post('/', auth, requireRole('donor'), async (req, res) => {
  try {
    const { items, pickupAddress, pickupDate, pickupTimeSlot, donorNotes, assignedNgo } = req.body;

    const donation = new Donation({
      donor: req.user._id,
      items,
      pickupAddress,
      pickupDate,
      pickupTimeSlot,
      donorNotes,
      assignedNgo: assignedNgo || undefined,
      status: 'pending',
      statusHistory: [{ status: 'pending', note: 'Donation request created' }]
    });

    await donation.save();

    // Donation count and impact score will be updated when status becomes 'distributed'

    const populated = await Donation.findById(donation._id)
      .populate('donor', 'name email phone')
      .populate('assignedNgo', 'name organizationName');

    // Notify NGO if assigned
    if (assignedNgo) {
      await createNotification(
        assignedNgo,
        'New Donation Assigned',
        `A new donation request (#${populated._id.toString().slice(-6).toUpperCase()}) has been assigned to your organization.`,
        'info',
        populated._id
      );
    }

    res.status(201).json(populated);
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ message: 'Server error creating donation.' });
  }
});

// GET /api/donations - Get donations based on role
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};

    if (req.user.role === 'donor') {
      query.donor = req.user._id;
    } else if (req.user.role === 'ngo') {
      query.$or = [
        { assignedNgo: req.user._id },
        { status: 'pending', assignedNgo: { $exists: false } },
        { status: 'pending', assignedNgo: null }
      ];
    }
    // admin sees all

    if (status) query.status = status;

    const donations = await Donation.find(query)
      .populate('donor', 'name email phone address')
      .populate('assignedNgo', 'name organizationName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Donation.countDocuments(query);

    res.json({ donations, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ message: 'Server error fetching donations.' });
  }
});

// GET /api/donations/stats - Get dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'donor') query.donor = req.user._id;
    else if (req.user.role === 'ngo') query.assignedNgo = req.user._id;

    const total = await Donation.countDocuments(query);
    const pending = await Donation.countDocuments({ ...query, status: 'pending' });
    const accepted = await Donation.countDocuments({ ...query, status: 'accepted' });
    const collected = await Donation.countDocuments({ ...query, status: 'collected' });
    const distributed = await Donation.countDocuments({ ...query, status: 'distributed' });

    // Calculate total items and families reached (for all items committed/accepted)
    const activeDonations = await Donation.find({ ...query, status: { $in: ['accepted', 'collected', 'distributed'] } });
    
    let totalItems = 0;
    let familiesReached = 0;

    activeDonations.forEach(d => {
      d.items.forEach(item => {
        totalItems += item.quantity;
        
        // Logical family reaching calculation
        // High-impact items (TV, Fridge, Bed, etc.) benefit one family per unit
        if (item.category === 'electronics' || item.category === 'household') {
          familiesReached += item.quantity; 
        } 
        // Clothes and books are usually distributed in bundles
        else if (item.category === 'clothes') {
          familiesReached += Math.ceil(item.quantity / 5); // 5 items per family
        } else if (item.category === 'toys') {
          familiesReached += Math.ceil(item.quantity / 3); // 3 items per family
        } else if (item.category === 'books') {
          familiesReached += Math.ceil(item.quantity / 10); // 10 items per family
        } else {
          familiesReached += Math.ceil(item.quantity / 4); // default
        }
      });
    });

    res.json({ 
      total, 
      pending, 
      accepted, 
      collected, 
      distributed, 
      totalItems, 
      familiesReached 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching stats.' });
  }
});

// GET /api/donations/:id - Get single donation
router.get('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email phone address')
      .populate('assignedNgo', 'name organizationName phone');
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found.' });
    }

    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/donations/:id/status - Update donation status (NGO or Admin)
router.put('/:id/status', auth, requireRole('ngo', 'admin'), async (req, res) => {
  try {
    const { status, note } = req.body;
    
    const update = {
      $set: { status, updatedAt: Date.now() },
      $push: { statusHistory: { status, note: note || `Status updated to ${status}` } }
    };
    
    if (status === 'accepted' && req.user.role === 'ngo') {
      update.$set.assignedNgo = req.user._id;
    }

    const donation = await Donation.findByIdAndUpdate(req.params.id, update, { returnDocument: 'after' });

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found.' });
    }

    // If status is updated to distributed, increment donor's stats
    if (status === 'distributed') {
      await User.findByIdAndUpdate(donation.donor, {
        $inc: { totalDonations: 1, impactScore: 10 }
      }, { returnDocument: 'after' });
    }

    const updated = await Donation.findById(donation._id)
      .populate('donor', 'name email phone')
      .populate('assignedNgo', 'name organizationName');

    // Create notification for the donor
    let title = '';
    let message = '';
    let type = 'info';

    const donationIdStr = updated._id.toString().slice(-6).toUpperCase();

    if (status === 'accepted') {
      title = 'Donation Accepted';
      message = `Your donation (#${donationIdStr}) has been accepted by ${updated.assignedNgo?.organizationName || 'an NGO'}.`;
      type = 'success';
    } else if (status === 'collected') {
      title = 'Donation Collected';
      message = `Your donation (#${donationIdStr}) has been successfully collected.`;
      type = 'info';
    } else if (status === 'distributed') {
      title = 'Donation Distributed';
      message = `Amazing! Your donation (#${donationIdStr}) has been distributed to those in need.`;
      type = 'impact';
    }

    if (title) {
      const donorId = updated.donor?._id || donation.donor;
      if (donorId) {
        await createNotification(donorId, title, message, type, updated._id);
      }
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Server error updating status.' });
  }
});

// DELETE /api/donations/:id - Cancel donation (donor only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found.' });
    
    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    if (['collected', 'distributed'].includes(donation.status)) {
      return res.status(400).json({ message: 'Cannot cancel a completed donation.' });
    }

    donation.status = 'cancelled';
    donation.statusHistory.push({ status: 'cancelled', note: 'Cancelled by user' });
    await donation.save();

    res.json({ message: 'Donation cancelled.', donation });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
