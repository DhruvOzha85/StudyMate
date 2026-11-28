const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    author: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const issueSchema = new mongoose.Schema(
  {
    refId: { type: String, required: true, unique: true },
    title: { type: String, required: [true, 'Issue title is required'], trim: true },
    category: { type: String, required: [true, 'Category is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Submitted', 'Acknowledged', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Submitted',
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reporterName: { type: String, default: 'Student', trim: true },
    anonymous: { type: Boolean, default: false },
    images: [{ type: String }],
    supporters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    staffNote: { type: String, default: 'Awaiting review by campus maintenance desk.' },
    comments: [commentSchema],
  },
  { timestamps: true }
);

issueSchema.index({ status: 1, category: 1, location: 1 });
issueSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Issue', issueSchema);
