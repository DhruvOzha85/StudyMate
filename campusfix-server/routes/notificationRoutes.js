const express = require('express');
const Notification = require('../models/Notification');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const formatNotif = (n) => ({
  id: n._id,
  title: n.title,
  message: n.message,
  icon: n.icon,
  read: n.read,
  time: n.createdAt ? new Date(n.createdAt).toISOString().split('T')[0] : '',
});

// GET /api/notifications (protected - current user's notifications)
router.get('/', requireAuth, async (req, res) => {
  try {
    const list = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
    return res.status(200).json(list.map(formatNotif));
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching notifications.' });
  }
});

// PATCH /api/notifications/read-all (protected)
router.patch('/read-all', requireAuth, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    const list = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
    return res.status(200).json(list.map(formatNotif));
  } catch (err) {
    return res.status(500).json({ message: 'Error updating notifications.' });
  }
});

// PATCH /api/notifications/:id/read (protected - owner only)
router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true }
    );
    const list = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
    return res.status(200).json(list.map(formatNotif));
  } catch (err) {
    return res.status(500).json({ message: 'Error updating notification.' });
  }
});

module.exports = router;
