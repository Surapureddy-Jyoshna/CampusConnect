import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true, // Case-insensitive lookup (e.g. EMP-IT-008, ADMIN)
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin'],
  },
  designation: {
    type: String,
    default: 'Academic Administrator & Controller of Examinations',
  },
  department: {
    type: String,
    default: 'Administrative & Academic Affairs',
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    default: 'admin123',
  },
  accessScope: {
    type: String,
    default: 'Master Administrator (All Batches: P1, P2, E1, E2, E3, E4)',
  },
  officeLocation: {
    type: String,
    default: 'Academic Administrative Block, Room 204',
  },
  avatar: {
    type: String,
    default: 'AD',
  },
  avatarBg: {
    type: String,
    default: 'bg-slate-900',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema, 'admins');

export default Admin;
