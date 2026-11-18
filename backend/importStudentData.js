import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import StudentData from './models/StudentData.js';
import { readLocalStore, writeLocalStore, isAtlasConnected, connectDB } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// (Swapna,suneetha,susmitha,nagraj naik,santhosh,sathyanandharam,Ratna kumari,Sravani,udayasree)
export const ADVISORS = [
  'Swapna',
  'suneetha',
  'susmitha',
  'nagraj naik',
  'santhosh',
  'sathyanandharam',
  'Ratna kumari',
  'Sravani',
  'udayasree'
];

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-indigo-600',
  'bg-purple-600',
  'bg-emerald-600',
  'bg-rose-600',
  'bg-sky-600',
  'bg-amber-600',
  'bg-teal-600'
];

/**
 * Extracts and assigns student details from the PDF
 */
export async function parseAndGenerateStudents(pdfPath) {
  const filePath = pdfPath || path.join(__dirname, '..', 'AY2023-2024_SEM1_(R21)E2CSE_ALL_Sections.pdf');
  if (!fs.existsSync(filePath)) {
    throw new Error(`PDF file not found at: ${filePath}`);
  }

  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdf(dataBuffer);

  const lines = pdfData.text.split('\n').map(l => l.trim()).filter(Boolean);
  const regex = /^\d+([A-Z]\d{6})\s*(.*?)([FM])(AB\d+-[A-Za-z0-9]+)$/;

  const students = [];
  let girlCount = 0;
  let boyCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('CLASSROOM') || line.includes('STUDENT_ID') || line.includes('AY2023')) continue;

    const match = line.match(regex);
    if (!match) continue;

    const rawId = match[1].trim().toUpperCase();
    const rawName = match[2].trim().replace(/\s+/g, ' ');
    const genderChar = match[3].trim().toUpperCase(); // 'F' or 'M'
    const section = match[4].trim();

    // Deterministic pseudo-random seeding based on student ID to keep values stable across restarts if desired
    let hash = 0;
    for (let c = 0; c < rawId.length; c++) {
      hash = (hash * 31 + rawId.charCodeAt(c)) & 0xffffffff;
    }
    const absHash = Math.abs(hash);

    // 1. Assign Advisor randomly from user's list:
    const advisorIndex = absHash % ADVISORS.length;
    const advisor = ADVISORS[advisorIndex];

    // 2. Assign Hostel Room:
    // girls -> GH2, boys -> BH2
    let hostelRoom = '';
    if (genderChar === 'F') {
      girlCount++;
      const roomNum = 100 + (girlCount % 150) + 1;
      hostelRoom = `GH2 - Room ${roomNum}`;
    } else {
      boyCount++;
      const roomNum = 100 + (boyCount % 150) + 1;
      hostelRoom = `BH2 - Room ${roomNum}`;
    }

    // 3. Assign Attendance randomly (between 76% and 97%):
    const attendanceVal = 76 + (absHash % 22);
    const attendance = `${attendanceVal}%`;

    // 4. Assign CGPA randomly (between 7.20 and 9.75):
    const cgpaVal = (7.20 + ((absHash % 255) / 100)).toFixed(2);
    const cgpa = String(Math.min(9.85, parseFloat(cgpaVal)));

    // Avatar initials:
    const nameParts = rawName.split(' ');
    const initials = (nameParts[0]?.[0] || 'S') + (nameParts[1]?.[0] || '');
    const avatarBg = AVATAR_COLORS[absHash % AVATAR_COLORS.length];

    students.push({
      id: rawId,
      name: rawName,
      gender: genderChar === 'F' ? 'Female' : 'Male',
      section,
      batch: 'E4',
      department: 'Computer Science & Engineering',
      degree: 'B.Tech Computer Science & Engineering',
      semester: 'Semester VII',
      role: 'student',
      attendance,
      cgpa,
      advisor,
      hostelRoom,
      email: `${rawId.toLowerCase()}@rguktrkv.ac.in`,
      phone: `+91 98421 ${String(10000 + (absHash % 89999))}`,
      password: 'password123',
      avatar: initials,
      avatarBg
    });
  }

  return students;
}

/**
 * Loads students into MongoDB Atlas collection 'students_data' and local store
 */
export async function seedStudentDataCollection(forceUpdate = true) {
  const students = await parseAndGenerateStudents();
  console.log(`Parsed ${students.length} students from PDF for E4 Batch with @rguktrkv.ac.in emails.`);

  // 1. Update local persistence store
  const store = readLocalStore();
  store.students_data = students;
  writeLocalStore(store);
  console.log(`Saved ${students.length} students to local store collection 'students_data'.`);

  // 2. If Atlas is connected, upsert into MongoDB Atlas 'students_data' collection
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    if (mongoose.connection.readyState === 1) {
      console.log(`Uploading ${students.length} E4 students into MongoDB Atlas collection 'students_data'...`);
      await StudentData.deleteMany({});
      await StudentData.insertMany(students);
      console.log(`Successfully uploaded ${students.length} E4 students to MongoDB Atlas collection 'students_data'!`);
    }
  } catch (err) {
    console.warn('Atlas upload notice:', err.message);
  }

  return students;
}

// If executed directly from command line
if (process.argv[1] && process.argv[1].endsWith('importStudentData.js')) {
  (async () => {
    try {
      const list = await seedStudentDataCollection();
      console.log(`Sample Student 1:`, list[0]);
      console.log(`Sample Student 2 (Boy):`, list.find(s => s.gender === 'Male'));
      console.log(`Sample Student 3 (Girl):`, list.find(s => s.gender === 'Female'));
      process.exit(0);
    } catch (e) {
      console.error('Error:', e);
      process.exit(1);
    }
  })();
}
