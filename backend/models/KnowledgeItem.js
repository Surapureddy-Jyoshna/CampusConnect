import mongoose from 'mongoose';

const KnowledgeItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['exams', 'fee', 'holidays', 'admissions', 'departments', 'facilities', 'rules', 'placement', 'academic', 'general'],
    default: 'general',
  },
  targetBatches: {
    type: [String],
    default: ['All'], // 'P1', 'P2', 'E1', 'E2', 'E3', 'E4', 'All'
  },
  queryPatterns: {
    type: [String],
    default: [],
  },
  answer: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  sourceDocument: {
    type: String,
    default: 'College Official Notice Board / Handbook 2026',
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

KnowledgeItemSchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

export default mongoose.models.KnowledgeItem || mongoose.model('KnowledgeItem', KnowledgeItemSchema);
