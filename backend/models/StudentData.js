import mongoose from 'mongoose';

const StudentDataSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ['F', 'M', 'Female', 'Male'],
    required: true,
  },
  section: {
    type: String,
    default: 'AB1-S06',
  },
  batch: {
    type: String,
    default: 'E4',
  },
  department: {
    type: String,
    default: 'Computer Science & Engineering',
  },
  degree: {
    type: String,
    default: 'B.Tech Computer Science & Engineering',
  },
  semester: {
    type: String,
    default: 'Semester VII',
  },
  role: {
    type: String,
    default: 'student',
  },
  attendance: {
    type: String,
    required: true,
  },
  cgpa: {
    type: String,
    required: true,
  },
  advisor: {
    type: String,
    required: true,
  },
  hostelRoom: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
  },
  phone: {
    type: String,
  },
  password: {
    type: String,
    default: 'password123',
  },
  avatar: {
    type: String,
  },
  avatarBg: {
    type: String,
    default: 'bg-blue-600',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'students_data' // Explicit MongoDB collection name as requested: "students data"
});

export default mongoose.models.StudentData || mongoose.model('StudentData', StudentDataSchema);

