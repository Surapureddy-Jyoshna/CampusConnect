import mongoose from 'mongoose';

const DocumentChunkSchema = new mongoose.Schema({
  docTitle: {
    type: String,
    required: true,
  },
  docType: {
    type: String,
    enum: ['pdf', 'text', 'policy', 'handbook'],
    default: 'text',
  },
  category: {
    type: String,
    default: 'general',
  },
  chunkIndex: {
    type: Number,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  keywords: {
    type: [String],
    default: [],
  },
  embedding: {
    type: [Number],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.DocumentChunk || mongoose.model('DocumentChunk', DocumentChunkSchema);

