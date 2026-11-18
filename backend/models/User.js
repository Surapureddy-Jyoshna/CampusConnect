import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true, // Case-insensitive lookup
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },
  batch: {
    type: String,
    enum: ['P1', 'P2', 'E1', 'E2', 'E3', 'E4', 'All'],
    default: 'E3',
  },
  department: {
    type: String,
    default: 'Department of Information Technology',
  },
  degree: {
    type: String,
    default: 'B.Tech Information Technology',
  },
  semester: {
    type: String,
    default: 'Semester V',
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
    default: 'password123',
  },
  attendance: {
    type: String,
    default: '88%',
  },
  cgpa: {
    type: String,
    default: '8.90',
  },
  avatar: {
    type: String,
    default: 'ST',
  },
  avatarBg: {
    type: String,
    default: 'bg-blue-600',
  },
  designation: {
    type: String, // For Admin / Faculty
    default: 'Associate Professor & Controller of Examinations',
  },
  advisor: {
    type: String,
    default: 'Dr. Shanthi Victoria',
  },
  hostelRoom: {
    type: String,
    default: 'Block B - Room 204',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);

