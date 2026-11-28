const express = require('express');
const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Format Issue document for frontend consumption
const formatIssue = (doc, currentUserId) => {
  const supporters = doc.supporters || [];
  const uid = currentUserId ? String(currentUserId) : null;
  return {
    _id: doc._id,
    id: doc.refId,
    title: doc.title,
    category: doc.category,
    description: doc.description,
    location: doc.location,
    priority: doc.priority,
    status: doc.status,
    date: doc.createdAt ? new Date(doc.createdAt).toISOString().split('T')[0] : '',
    reporter: doc.anonymous ? 'Anonymous Student' : doc.reporterName,
    anonymous: doc.anonymous,
    isMine: uid ? String(doc.userId) === uid : false,
    supporters: supporters.length,
    supportedByMe: uid ? supporters.some((s) => String(s) === uid) : false,
    images: doc.images || [],
    staffNote: doc.staffNote,
    comments: (doc.comments || []).map((c) => ({
      id: c._id,
      author: c.author,
      text: c.text,
      date: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '',
    })),
  };
};

// GET /api/issues (public feed, optional filters)
router.get('/', async (req, res) => {
  try {
    const { status, category, location, search } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (category && category !== 'All') filter.category = category;
    if (location && location !== 'All') filter.location = location;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const docs = await Issue.find(filter).sort({ createdAt: -1 }).limit(100);
    return res.status(200).json(docs.map((d) => formatIssue(d, req.query.userId)));
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching issues.' });
  }
});

// GET /api/issues/mine (protected - current user's reports only)
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const docs = await Issue.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(docs.map((d) => formatIssue(d, req.user.id)));
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching your reports.' });
  }
});

// GET /api/issues/:id (by Mongo _id or refId)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { refId: id };
    const doc = await Issue.findOne(query);
    if (!doc) return res.status(404).json({ message: 'Issue not found.' });
    return res.status(200).json(formatIssue(doc, req.query.userId));
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching issue.' });
  }
});

// POST /api/issues (protected)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, category, description, location, priority, anonymous, images } = req.body;
    if (!title || !category || !description || !location) {
      return res.status(400).json({ message: 'Title, category, description, and location are required.' });
    }

    const user = await User.findById(req.user.id);
    const refId = `CF-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const doc = await Issue.create({
      refId,
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      location: location.trim(),
      priority: ['Low', 'Medium', 'High'].includes(priority) ? priority : 'Medium',
      userId: req.user.id,
      reporterName: user?.name || 'Student',
      anonymous: Boolean(anonymous),
      images: Array.isArray(images) ? images.slice(0, 5) : [],
      supporters: [req.user.id],
    });

    await Notification.create({
      userId: req.user.id,
      title: 'Your report has been submitted',
      message: `${refId}: "${doc.title}" has been saved and queued for review.`,
      icon: 'paper-plane-outline',
    });

    return res.status(201).json(formatIssue(doc, req.user.id));
  } catch (err) {
    return res.status(500).json({ message: 'Error creating issue.' });
  }
});

// PATCH /api/issues/:id/status (Staff / Admin only)
router.patch('/:id/status', requireAuth, requireRole('Staff', 'Admin'), async (req, res) => {
  try {
    const { status, staffNote } = req.body;
    const validStatuses = ['Submitted', 'Acknowledged', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { refId: req.params.id };

    const update = { status };
    if (typeof staffNote === 'string') update.staffNote = staffNote.trim();

    const doc = await Issue.findOneAndUpdate(query, update, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: 'Issue not found.' });
    return res.status(200).json(formatIssue(doc, req.user.id));
  } catch (err) {
    return res.status(500).json({ message: 'Error updating status.' });
  }
});

// POST /api/issues/:id/support (protected - toggle upvote, prevents duplicates)
router.post('/:id/support', requireAuth, async (req, res) => {
  try {
    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { refId: req.params.id };

    const doc = await Issue.findOne(query);
    if (!doc) return res.status(404).json({ message: 'Issue not found.' });

    const uid = String(req.user.id);
    const exists = doc.supporters.some((s) => String(s) === uid);
    if (exists) {
      doc.supporters = doc.supporters.filter((s) => String(s) !== uid);
    } else {
      doc.supporters.push(req.user.id);
    }
    await doc.save();
    return res.status(200).json(formatIssue(doc, req.user.id));
  } catch (err) {
    return res.status(500).json({ message: 'Error toggling support.' });
  }
});

// POST /api/issues/:id/comments (protected)
router.post('/:id/comments', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { refId: req.params.id };

    const doc = await Issue.findOne(query);
    if (!doc) return res.status(404).json({ message: 'Issue not found.' });

    const user = await User.findById(req.user.id);
    doc.comments.push({
      userId: req.user.id,
      author: user?.name || 'Student',
      text: text.trim(),
    });
    await doc.save();
    return res.status(201).json(formatIssue(doc, req.user.id));
  } catch (err) {
    return res.status(500).json({ message: 'Error posting comment.' });
  }
});

// DELETE /api/issues/:id (protected - owner or Admin only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { refId: req.params.id };

    const doc = await Issue.findOne(query);
    if (!doc) return res.status(404).json({ message: 'Issue not found.' });

    if (String(doc.userId) !== String(req.user.id) && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden: you can only delete your own reports.' });
    }

    await Issue.deleteOne({ _id: doc._id });
    return res.status(200).json({ message: 'Issue deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting issue.' });
  }
});

module.exports = router;
