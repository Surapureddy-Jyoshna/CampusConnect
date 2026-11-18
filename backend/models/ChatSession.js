import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'bot', 'system'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  confidence: {
    type: Number,
    default: 1.0,
  },
  sources: {
    type: [String],
    default: [],
  },
  category: {
    type: String,
    default: 'general',
  },
  latencyMs: {
    type: Number,
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ChatSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  messages: [MessageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.ChatSession || mongoose.model('ChatSession', ChatSessionSchema);

