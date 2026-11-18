import mongoose from 'mongoose';

const NoticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['exams', 'fee', 'holidays', 'academic', 'placement', 'general'],
    default: 'general',
  },
  targetBatches: {
    type: [String],
    required: true,
    default: ['All'], // Can contain 'P1', 'P2', 'E1', 'E2', 'E3', 'E4', 'All'
  },
  priority: {
    type: String,
    enum: ['normal', 'important', 'urgent'],
    default: 'normal',
  },
  postedBy: {
    type: String,
    default: 'Dean Academics & Controller of Examinations',
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

NoticeSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Notice || mongoose.model('Notice', NoticeSchema);

