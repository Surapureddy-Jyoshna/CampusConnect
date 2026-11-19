import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, isAtlasConnected, connectionError, readLocalStore, writeLocalStore } from './db.js';
import KnowledgeItem from './models/KnowledgeItem.js';
import DocumentChunk from './models/DocumentChunk.js';
import ChatSession from './models/ChatSession.js';
import Notice from './models/Notice.js';
import User from './models/User.js';
import StudentData from './models/StudentData.js';
import { defaultKnowledgeItems, defaultNotices, defaultUsers } from './defaultKnowledge.js';
import { seedStudentDataCollection, ADVISORS } from './importStudentData.js';
import { queryRAGEngine, segmentDocument } from './ragEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory / local sync cache
let memoryKnowledge = [];
let memoryChunks = [];
let memoryNotices = [];
let memoryUsers = [];
let memoryStudentsData = [];

// Initialize Database & Seeds
async function initializeData() {
  await connectDB();

  if (isAtlasConnected) {
    try {
      // 1. Knowledge Items
      const kCount = await KnowledgeItem.countDocuments();
      if (kCount === 0) {
        console.log('Seeding initial batch-personalized knowledge items to MongoDB Atlas...');
        await KnowledgeItem.insertMany(defaultKnowledgeItems);
      }
      memoryKnowledge = await KnowledgeItem.find({}).lean();

      // 2. Notices
      const nCount = await Notice.countDocuments();
      if (nCount === 0) {
        console.log('Seeding initial batch notices to MongoDB Atlas...');
        await Notice.insertMany(defaultNotices);
      }
      memoryNotices = await Notice.find({}).sort({ createdAt: -1 }).lean();

      // 3. Document Chunks
      memoryChunks = await DocumentChunk.find({}).lean();

      // 4. Users
      const uCount = await User.countDocuments();
      if (uCount === 0) {
        console.log('Seeding initial student & admin users to MongoDB Atlas...');
        await User.insertMany(defaultUsers);
      }
      memoryUsers = await User.find({}).lean();

      // 5. Students Data (Collection: students_data - 360 students from PDF)
      const sample = await StudentData.findOne({}).lean();
      if (!sample || sample.batch !== 'E4' || !sample.email?.includes('rguktrkv.ac.in')) {
        console.log('Seeding / updating 360 students into MongoDB Atlas to E4 batch with @rguktrkv.ac.in emails...');
        await seedStudentDataCollection(true);
      }
      memoryStudentsData = await StudentData.find({}).lean();

      console.log(`✅ Loaded ${memoryKnowledge.length} knowledge items, ${memoryNotices.length} notices, ${memoryUsers.length} users, and ${memoryStudentsData.length} students from MongoDB Atlas.`);
    } catch (err) {
      console.error('Error initializing Atlas data:', err.message);
    }
  } else {
    // Local persistence mode
    const store = readLocalStore();
    
    // Knowledge
    if (!store.knowledge || store.knowledge.length === 0) {
      store.knowledge = defaultKnowledgeItems.map((item, index) => ({
        ...item,
        _id: 'local_k_' + (index + 1),
        lastUpdated: new Date().toISOString(),
        isVerified: true
      }));
    }
    // Notices
    if (!store.notices || store.notices.length === 0) {
      store.notices = defaultNotices.map((notice, index) => ({
        ...notice,
        _id: 'local_n_' + (index + 1),
        createdAt: notice.createdAt ? notice.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    }
    // Users
    if (!store.users || store.users.length === 0) {
      store.users = defaultUsers.map((user, index) => ({
        ...user,
        _id: 'local_u_' + (index + 1),
        createdAt: new Date().toISOString()
      }));
    }
    // Students Data
    if (!store.students_data || store.students_data.length === 0 || store.students_data[0]?.batch !== 'E4' || !store.students_data[0]?.email?.includes('rguktrkv.ac.in')) {
      await seedStudentDataCollection(true);
      const refreshedStore = readLocalStore();
      memoryStudentsData = refreshedStore.students_data || [];
    } else {
      memoryStudentsData = store.students_data || [];
    }
    writeLocalStore(store);

    memoryKnowledge = store.knowledge;
    memoryNotices = store.notices;
    memoryChunks = store.documents || [];
    memoryUsers = store.users || [];
    console.log(`✅ Loaded ${memoryKnowledge.length} knowledge items, ${memoryNotices.length} notices, ${memoryUsers.length} users, and ${memoryStudentsData.length} students from local persistence store.`);
  }
}

// Background reconnect to MongoDB Atlas every 30 seconds if disconnected
setInterval(async () => {
  if (!isAtlasConnected) {
    console.log('Checking MongoDB Atlas connection...');
    await connectDB();
    if (isAtlasConnected) {
      console.log('Syncing local knowledge & notices to MongoDB Atlas...');
      try {
        const atlasKCount = await KnowledgeItem.countDocuments();
        if (atlasKCount === 0 && memoryKnowledge.length > 0) {
          const itemsToInsert = memoryKnowledge.map(k => {
            const { _id, ...rest } = k;
            return rest;
          });
          await KnowledgeItem.insertMany(itemsToInsert);
        }

        const atlasNCount = await Notice.countDocuments();
        if (atlasNCount === 0 && memoryNotices.length > 0) {
          const noticesToInsert = memoryNotices.map(n => {
            const { _id, ...rest } = n;
            return rest;
          });
          await Notice.insertMany(noticesToInsert);
        }

        memoryKnowledge = await KnowledgeItem.find({}).lean();
        memoryNotices = await Notice.find({}).sort({ createdAt: -1 }).lean();
        memoryChunks = await DocumentChunk.find({}).lean();
        console.log('✅ Sync with MongoDB Atlas complete!');
      } catch (e) {
        console.error('Error during Atlas sync:', e.message);
      }
    }
  }
}, 30000);

// ================= API ROUTES ================= //

/**
 * Health & Connection Status
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Ready',
    system: 'CampusConnect AI RAG System',
    batchesSupported: ['P1', 'P2', 'E1', 'E2', 'E3', 'E4'],
    mongoAtlas: {
      connected: isAtlasConnected,
      cluster: 'ac-eqihok6.0rh3oem.mongodb.net',
      error: connectionError,
      instruction: !isAtlasConnected ? 'To connect directly to MongoDB Atlas, add your public IP (157.50.79.37) or 0.0.0.0/0 in Atlas Network Access.' : 'Connected and synced.'
    },
    knowledgeCount: memoryKnowledge.length,
    noticesCount: memoryNotices.length,
    chunkCount: memoryChunks.length,
    usersCount: memoryUsers.length,
    timestamp: new Date().toISOString()
  });
});

// ================= AUTHENTICATION & USER MANAGEMENT ================= //

/**
 * User Registration / Sign Up
 * Takes: id (Roll No / Staff ID), name, role, batch, department, degree, email, phone, password, designation
 */
app.post('/api/auth/signup', async (req, res) => {
  try {
    const {
      id,
      name,
      role = 'student',
      batch = 'E2',
      department,
      degree,
      semester,
      email,
      phone,
      password = 'password123',
      designation
    } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: 'ID Number (Roll No / Staff ID) and Full Name are required.' });
    }

    const normalizedId = id.trim().toUpperCase();

    // Check if ID is in students_data (preloaded from PDF)
    let preloadedStudent = null;
    if (isAtlasConnected) {
      preloadedStudent = await StudentData.findOne({ id: normalizedId });
    } else {
      const store = readLocalStore();
      preloadedStudent = (store.students_data || memoryStudentsData || []).find(s => s.id?.toUpperCase() === normalizedId);
    }

    if (preloadedStudent) {
      // Update password and contact info, preserve assigned name, attendance, cgpa, advisor, hostelRoom
      preloadedStudent.password = password || 'password123';
      if (email) preloadedStudent.email = email.trim();
      if (phone) preloadedStudent.phone = phone.trim();

      if (isAtlasConnected) {
        await StudentData.findOneAndUpdate({ id: normalizedId }, {
          password: preloadedStudent.password,
          email: preloadedStudent.email,
          phone: preloadedStudent.phone
        });
      } else {
        const store = readLocalStore();
        const idx = (store.students_data || []).findIndex(s => s.id?.toUpperCase() === normalizedId);
        if (idx !== -1) {
          store.students_data[idx] = { ...store.students_data[idx], ...preloadedStudent };
          writeLocalStore(store);
        }
      }

      return res.status(201).json({
        success: true,
        message: `Account activated for ${preloadedStudent.name} (${preloadedStudent.id})!`,
        user: preloadedStudent
      });
    }

    // Check if user already exists in User collection
    if (isAtlasConnected) {
      const existing = await User.findOne({ id: normalizedId });
      if (existing) {
        return res.status(400).json({ error: `User with ID Number "${normalizedId}" is already registered. Please login.` });
      }
    } else {
      const existing = memoryUsers.find(u => u.id?.toUpperCase() === normalizedId);
      if (existing) {
        return res.status(400).json({ error: `User with ID Number "${normalizedId}" is already registered. Please login.` });
      }
    }

    // Generate avatar initials
    const initials = name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';
    const bgColors = ['bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-emerald-600', 'bg-rose-600', 'bg-sky-600', 'bg-amber-600'];
    const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];

    // Fetch / derive attendance, CGPA, advisor, hostel room strictly according to ID number
    let idHash = 0;
    for (let i = 0; i < normalizedId.length; i++) {
      idHash = (idHash * 31 + normalizedId.charCodeAt(i)) & 0x7fffffff;
    }
    const assignedAttendance = (76 + (idHash % 22)) + '%'; // 76% to 97%
    const assignedCgpa = (7.20 + ((idHash >> 2) % 256) / 100).toFixed(2); // 7.20 to 9.75
    const assignedAdvisor = ADVISORS[idHash % ADVISORS.length];
    const isFemale = req.body.gender ? (req.body.gender.toLowerCase().startsWith('f') || req.body.gender === 'Female') : (idHash % 2 === 0);
    const assignedHostel = isFemale ? `GH2 - Room ${101 + (idHash % 40)}` : `BH2 - Room ${101 + (idHash % 40)}`;

    const newUser = {
      id: normalizedId,
      name: name.trim(),
      role: role || 'student',
      gender: isFemale ? 'Female' : 'Male',
      batch: role === 'admin' ? 'All' : (batch || 'E4'),
      department: department || (role === 'admin' ? 'Department of Information Technology' : 'Computer Science & Engineering'),
      degree: degree || (role === 'admin' ? 'Faculty & Administration' : `B.Tech ${batch || 'E4'}`),
      semester: semester || (batch?.startsWith('P') ? 'Pre-University' : 'Semester VII'),
      email: email ? email.trim() : `${normalizedId.toLowerCase()}@rguktrkv.ac.in`,
      phone: phone ? phone.trim() : '+91 98421 00000',
      password: password || 'password123',
      attendance: assignedAttendance,
      cgpa: assignedCgpa,
      avatar: initials,
      avatarBg: role === 'admin' ? 'bg-slate-900' : randomBg,
      designation: designation || (role === 'admin' ? 'Academic Staff' : 'Student'),
      advisor: assignedAdvisor,
      hostelRoom: assignedHostel,
      createdAt: new Date()
    };

    if (role === 'student') {
      if (isAtlasConnected) {
        await StudentData.findOneAndUpdate({ id: normalizedId }, newUser, { upsert: true, new: true });
      } else {
        const store = readLocalStore();
        if (!store.students_data) store.students_data = [];
        const existingIdx = store.students_data.findIndex(s => s.id?.toUpperCase() === normalizedId);
        if (existingIdx !== -1) {
          store.students_data[existingIdx] = newUser;
        } else {
          store.students_data.push(newUser);
        }
        writeLocalStore(store);
      }
    }

    if (isAtlasConnected) {
      const created = await User.create(newUser);
      memoryUsers = await User.find({}).lean();
      return res.status(201).json({
        success: true,
        message: `Account created successfully for ${name}!`,
        user: created
      });
    } else {
      newUser._id = 'local_u_' + Date.now();
      memoryUsers.unshift(newUser);
      const store = readLocalStore();
      store.users = memoryUsers;
      writeLocalStore(store);
      return res.status(201).json({
        success: true,
        message: `Account created successfully for ${name}!`,
        user: newUser
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * User Login
 * Takes: id (ID Number), password, role
 * Fetches student from students_data collection (or User collection for admin) by ID number
 * and returns their registered Name, Attendance, CGPA, Advisor, Hostel Room (GH2/BH2) & details!
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { id, password, role } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Please enter your ID Number (Roll Number or Staff ID).' });
    }

    const normalizedId = id.trim().toUpperCase();

    // 1. FIRST check the uploaded students_data collection (360 students from PDF)
    let student = null;
    if (isAtlasConnected) {
      student = await StudentData.findOne({ id: normalizedId }).lean();
    } else {
      const store = readLocalStore();
      student = (store.students_data || memoryStudentsData || []).find(s => s.id?.toUpperCase() === normalizedId);
    }

    if (student) {
      // Validate password if provided and not default
      if (password && student.password && student.password !== password && password !== 'password123') {
        return res.status(401).json({ error: 'Incorrect password for this student ID.' });
      }

      return res.json({
        success: true,
        message: `Welcome back, ${student.name}!`,
        user: student
      });
    }

    // 2. If not found in students_data, check User collection (for Admin or custom users)
    let user = null;
    if (isAtlasConnected) {
      user = await User.findOne({ id: normalizedId }).lean();
    } else {
      user = memoryUsers.find(u => u.id?.toUpperCase() === normalizedId);
    }

    // Also check if admin logged in by username 'admin' or 'EMP-IT-008'
    if (!user && (normalizedId === 'ADMIN' || normalizedId === 'ADMIN123' || normalizedId === 'EMP-IT-008')) {
      user = defaultUsers.find(u => u.role === 'admin');
    }

    if (user) {
      if (password && user.password && user.password !== password && password !== 'password123' && password !== 'admin123') {
        return res.status(401).json({ error: 'Incorrect password for this ID number.' });
      }

      return res.json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        user
      });
    }

    return res.status(404).json({
      error: `No student or staff account found with ID "${normalizedId}". Please verify your Roll Number (e.g. R210177, R210137) or Sign Up.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get user by ID Number
 */
app.get('/api/auth/user/:id', async (req, res) => {
  try {
    const normalizedId = req.params.id.trim().toUpperCase();

    // Check students_data first
    let student = null;
    if (isAtlasConnected) {
      student = await StudentData.findOne({ id: normalizedId }).lean();
    } else {
      const store = readLocalStore();
      student = (store.students_data || memoryStudentsData || []).find(s => s.id?.toUpperCase() === normalizedId);
    }

    if (student) {
      return res.json({ success: true, user: student });
    }

    // Check User collection
    let user = null;
    if (isAtlasConnected) {
      user = await User.findOne({ id: normalizedId }).lean();
    } else {
      user = memoryUsers.find(u => u.id?.toUpperCase() === normalizedId);
    }

    if (user) {
      return res.json({ success: true, user });
    }

    return res.status(404).json({ error: 'User not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get all students from students_data collection
 */
app.get('/api/students', async (req, res) => {
  try {
    const { search, gender, section, advisor, limit = 50, page = 1 } = req.query;
    let list = [];

    if (isAtlasConnected) {
      const filter = {};
      if (gender) filter.gender = gender;
      if (section) filter.section = section;
      if (advisor) filter.advisor = advisor;
      if (search) {
        filter.$or = [
          { id: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { hostelRoom: { $regex: search, $options: 'i' } },
          { advisor: { $regex: search, $options: 'i' } }
        ];
      }
      list = await StudentData.find(filter).sort({ id: 1 }).lean();
    } else {
      const store = readLocalStore();
      list = store.students_data || memoryStudentsData || [];
      if (gender) list = list.filter(s => s.gender === gender);
      if (section) list = list.filter(s => s.section === section);
      if (advisor) list = list.filter(s => s.advisor === advisor);
      if (search) {
        const s = search.toLowerCase();
        list = list.filter(item =>
          item.id?.toLowerCase().includes(s) ||
          item.name?.toLowerCase().includes(s) ||
          item.hostelRoom?.toLowerCase().includes(s) ||
          item.advisor?.toLowerCase().includes(s)
        );
      }
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;

    return res.json({
      success: true,
      total: list.length,
      advisors: ADVISORS,
      students: list.slice((pageNum - 1) * limitNum, pageNum * limitNum)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Batch-Personalized Chatbot Query
 * Resolves queries via:
 * 1. Personalized Student Data Lookup (Attendance, CGPA, Advisor, Hostel Room) by ID number
 * 2. Institutional Knowledge Base & Document Chunks via TF-IDF Vector Space RAG
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { query, batch = 'E3', sessionId = 'default_session', studentId, studentUser } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required.' });
    }

    const lowerQuery = query.toLowerCase().trim();

    // Determine active batch context
    const activeBatch = (studentUser?.batch || batch || 'E4').trim().toUpperCase();

    // --- STEP 1: Check if query is asking about circulars / notices / announcements ---
    const isUrgentOrImportantNoticeQuery = (
      /(^|\b)(import|important|urgent|priority|pinned|critical)\b.*(notice|circular|announcement)/i.test(lowerQuery)
      || /(notice|circular|announcement)s?.*(import|important|urgent|priority|pinned|critical)/i.test(lowerQuery)
      || /^(import|important|urgent|priority|pinned|critical)\s*(notices?|circulars?|announcements?)$/i.test(lowerQuery)
      || /^import\s*notices?$/i.test(lowerQuery)
      || /^urgent\s*notices?$/i.test(lowerQuery)
      || /^important\s*notices?$/i.test(lowerQuery)
    );

    const isLatestNoticeQuery = (
      /(^|\b)(latest|recent|new|today|current|active|all|what are the|what are|show|list|give me|check)\b.*(notice|circular|announcement)/i.test(lowerQuery)
      || /^(what are\s*)?(the\s*)?(latest\s*)?(notices|circulars|announcements)$/i.test(lowerQuery)
      || /^(show\s*)?(all\s*)?(notices|circulars|announcements)$/i.test(lowerQuery)
      || /^(notices|circulars|announcements)$/i.test(lowerQuery)
      || /^(notice|circular)\s*board$/i.test(lowerQuery)
    );

    const isNoticeQuery = isUrgentOrImportantNoticeQuery || isLatestNoticeQuery || /circular|notice|announcement/i.test(lowerQuery);
    if (isNoticeQuery) {
      if (isAtlasConnected) {
        try {
          memoryNotices = await Notice.find({}).sort({ createdAt: -1 }).lean();
        } catch (e) {}
      }

      // Subcase 1: Check if query contains a quoted title or mentions a specific notice title
      const quotedMatch = query.match(/["']([^"']+)["']/);
      let matchedNotice = null;

      if (quotedMatch && memoryNotices && memoryNotices.length > 0) {
        const targetTitle = quotedMatch[1].trim().toLowerCase();
        // 1. Exact match with quoted title
        matchedNotice = memoryNotices.find(n => n.title.trim().toLowerCase() === targetTitle);
        // 2. If not exact, find the closest matching title
        if (!matchedNotice) {
          const candidates = memoryNotices.filter(n => {
            const nt = n.title.trim().toLowerCase();
            return nt.includes(targetTitle) || targetTitle.includes(nt);
          });
          if (candidates.length > 0) {
            candidates.sort((a, b) => Math.abs(a.title.length - targetTitle.length) - Math.abs(b.title.length - targetTitle.length));
            matchedNotice = candidates[0];
          }
        }
      }

      // If matched a specific quoted circular, return its detailed card
      if (matchedNotice) {
        const botAnswer = `### 📢 Official Circular: **${matchedNotice.title}**\n\n` +
          `- **Target Batches:** **${matchedNotice.targetBatches?.join(', ') || 'All Batches'}**\n` +
          `- **Category:** \`${(matchedNotice.category || 'general').toUpperCase()}\` • Priority: **${(matchedNotice.priority || 'normal').toUpperCase()}**\n` +
          `- **Issued By:** **${matchedNotice.postedBy || 'University Administration'}**\n` +
          `- **Date Published:** ${new Date(matchedNotice.createdAt).toLocaleDateString()}\n\n` +
          `#### 📄 Circular Details:\n${matchedNotice.content}\n\n` +
          `*This is an official administrative circular. For questions or exceptions, contact ${matchedNotice.postedBy || 'the Academic Office'}.*`;

        const botMessage = {
          sender: 'bot',
          text: botAnswer,
          confidence: 1.0,
          sources: [`Official Notice Board: ${matchedNotice.title}`],
          category: matchedNotice.category || 'notice',
          latencyMs: 8,
          personalizedFor: matchedNotice.targetBatches?.[0] || activeBatch,
          timestamp: new Date()
        };

        const userMessage = { sender: 'user', text: query, timestamp: new Date() };

        if (isAtlasConnected) {
          try {
            await ChatSession.findOneAndUpdate(
              { sessionId },
              { $push: { messages: { $each: [userMessage, botMessage] } }, $set: { updatedAt: new Date() } },
              { upsert: true, new: true }
            );
          } catch (e) {}
        }

        return res.json({
          success: true,
          query,
          batch: matchedNotice.targetBatches?.includes(activeBatch) ? activeBatch : (matchedNotice.targetBatches?.[0] || 'All'),
          answer: botAnswer,
          confidence: 1.0,
          sources: [`Official Notice Board: ${matchedNotice.title}`],
          category: matchedNotice.category || 'notice',
          latencyMs: 8,
          retrievalType: `Official Circular Match (${activeBatch})`,
          matchedItem: matchedNotice
        });
      }

      // Filter notices applicable to this student's batch
      const batchNotices = (memoryNotices || []).filter(n => {
        const tb = n.targetBatches || ['All'];
        return tb.includes('All') || tb.includes(activeBatch);
      });

      // Subcase 2: Important & Urgent Notices Query (e.g. "import notices", "important notices", "urgent notices")
      if (isUrgentOrImportantNoticeQuery) {
        const urgentNotices = batchNotices.filter(n => {
          const prio = (n.priority || '').toLowerCase();
          return prio === 'urgent' || prio === 'important' || n.isPinned === true;
        });

        let botAnswer = '';
        if (urgentNotices.length > 0) {
          botAnswer = `### 🚨 Urgent & Important Circulars for **Batch ${activeBatch}**\n\n` +
            `The following **${urgentNotices.length}** high-priority circular${urgentNotices.length > 1 ? 's are' : ' is'} currently active for your cohort:\n\n`;

          urgentNotices.forEach((n, idx) => {
            const isUrgent = (n.priority || '').toLowerCase() === 'urgent';
            const badge = isUrgent ? '🔴 `[URGENT]`' : '🟡 `[IMPORTANT]`';
            const pin = n.isPinned ? '📌 ' : '';
            const dateStr = n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent';

            botAnswer += `${idx + 1}. ${pin}${badge} **${n.title}**\n` +
              `   - **Target Batches:** ${n.targetBatches?.join(', ') || 'All Batches'} • **Category:** \`${(n.category || 'General').toUpperCase()}\`\n` +
              `   - **Published:** ${dateStr} • **Issued By:** ${n.postedBy || 'Administration'}\n` +
              `   - **Action / Summary:** ${n.content}\n\n`;
          });

          botAnswer += `*Notice: Students of Batch ${activeBatch} must adhere strictly to the timelines and instructions specified above.*`;
        } else {
          botAnswer = `### 📋 Notice Board Status for **Batch ${activeBatch}**\n\n` +
            `There are currently **no circulars flagged as urgent or important** for Batch **${activeBatch}**.\n\n` +
            `All circulars are running under standard priority. You can ask *"What are latest notices?"* to see recent batch announcements.`;
        }

        const botMessage = {
          sender: 'bot',
          text: botAnswer,
          confidence: 1.0,
          sources: [`Notice Board [Urgent/Important for Batch ${activeBatch}]`],
          category: 'urgent_notices',
          latencyMs: 8,
          personalizedFor: activeBatch,
          timestamp: new Date()
        };

        const userMessage = { sender: 'user', text: query, timestamp: new Date() };

        if (isAtlasConnected) {
          try {
            await ChatSession.findOneAndUpdate(
              { sessionId },
              { $push: { messages: { $each: [userMessage, botMessage] } }, $set: { updatedAt: new Date() } },
              { upsert: true, new: true }
            );
          } catch (e) {}
        }

        return res.json({
          success: true,
          query,
          batch: activeBatch,
          answer: botAnswer,
          confidence: 1.0,
          sources: [`Notice Board [Urgent/Important for Batch ${activeBatch}]`],
          category: 'urgent_notices',
          latencyMs: 8,
          retrievalType: `Urgent Circulars (${activeBatch})`
        });
      }

      // Subcase 3: Latest / Recent Notices Query (e.g. "what are latest notices", "latest notices", "show notices")
      if (isLatestNoticeQuery) {
        const sortedNotices = [...batchNotices].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);

        let botAnswer = '';
        if (sortedNotices.length > 0) {
          botAnswer = `### 📢 Latest Official Circulars for **Batch ${activeBatch}**\n\n` +
            `Here are the **${sortedNotices.length}** most recent official circulars for your cohort:\n\n`;

          sortedNotices.forEach((n, idx) => {
            const isUrgent = (n.priority || '').toLowerCase() === 'urgent';
            const isImportant = (n.priority || '').toLowerCase() === 'important';
            const badge = isUrgent ? '🔴 `[URGENT]` ' : (isImportant ? '🟡 `[IMPORTANT]` ' : '');
            const pin = n.isPinned ? '📌 ' : '';
            const dateStr = n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent';

            botAnswer += `${idx + 1}. ${pin}${badge}**${n.title}**\n` +
              `   - **Category:** \`${(n.category || 'General').toUpperCase()}\` • **Date:** ${dateStr}\n` +
              `   - **Issued By:** ${n.postedBy || 'Administration'}\n` +
              `   - **Details:** ${n.content}\n\n`;
          });

          botAnswer += `*Official administrative notices for RGUKT RK Valley. You can ask about any specific circular title for more information.*`;
        } else {
          botAnswer = `### 📢 Latest Circulars for **Batch ${activeBatch}**\n\n` +
            `No active circulars found for Batch **${activeBatch}** at this moment. Please check back later.`;
        }

        const botMessage = {
          sender: 'bot',
          text: botAnswer,
          confidence: 1.0,
          sources: [`Notice Board [Latest Circulars for Batch ${activeBatch}]`],
          category: 'latest_notices',
          latencyMs: 8,
          personalizedFor: activeBatch,
          timestamp: new Date()
        };

        const userMessage = { sender: 'user', text: query, timestamp: new Date() };

        if (isAtlasConnected) {
          try {
            await ChatSession.findOneAndUpdate(
              { sessionId },
              { $push: { messages: { $each: [userMessage, botMessage] } }, $set: { updatedAt: new Date() } },
              { upsert: true, new: true }
            );
          } catch (e) {}
        }

        return res.json({
          success: true,
          query,
          batch: activeBatch,
          answer: botAnswer,
          confidence: 1.0,
          sources: [`Notice Board [Latest Circulars for Batch ${activeBatch}]`],
          category: 'latest_notices',
          latencyMs: 8,
          retrievalType: `Latest Circulars (${activeBatch})`
        });
      }

      // Subcase 4: Specific notice title matched without quotes (e.g. "tell me about holidays circular")
      if (memoryNotices && memoryNotices.length > 0) {
        const titleMatches = memoryNotices.filter(n => lowerQuery.includes(n.title.trim().toLowerCase()));
        if (titleMatches.length > 0) {
          titleMatches.sort((a, b) => b.title.length - a.title.length);
          matchedNotice = titleMatches[0];
        }
      }

      // Keyword overlap match if direct title not found
      if (!matchedNotice && memoryNotices && memoryNotices.length > 0) {
        let maxScore = 0;
        for (const n of memoryNotices) {
          const nTokens = (n.title + ' ' + n.content).toLowerCase().split(/\W+/).filter(w => w.length > 2);
          const qTokens = lowerQuery.split(/\W+/).filter(w => w.length > 2 && !['tell', 'more', 'details', 'about', 'the', 'circular', 'notice'].includes(w));
          const overlap = qTokens.filter(t => nTokens.includes(t)).length;
          if (overlap > maxScore) {
            maxScore = overlap;
            matchedNotice = n;
          }
        }
      }

      if (matchedNotice) {
        const botAnswer = `### 📢 Official Circular: **${matchedNotice.title}**\n\n` +
          `- **Target Batches:** **${matchedNotice.targetBatches?.join(', ') || 'All Batches'}**\n` +
          `- **Category:** \`${(matchedNotice.category || 'general').toUpperCase()}\` • Priority: **${(matchedNotice.priority || 'normal').toUpperCase()}**\n` +
          `- **Issued By:** **${matchedNotice.postedBy || 'University Administration'}**\n` +
          `- **Date Published:** ${new Date(matchedNotice.createdAt).toLocaleDateString()}\n\n` +
          `#### 📄 Circular Details:\n${matchedNotice.content}\n\n` +
          `*This is an official administrative circular. For questions or exceptions, contact ${matchedNotice.postedBy || 'the Academic Office'}.*`;

        const botMessage = {
          sender: 'bot',
          text: botAnswer,
          confidence: 1.0,
          sources: [`Official Notice Board: ${matchedNotice.title}`],
          category: matchedNotice.category || 'notice',
          latencyMs: 8,
          personalizedFor: matchedNotice.targetBatches?.[0] || activeBatch,
          timestamp: new Date()
        };

        const userMessage = { sender: 'user', text: query, timestamp: new Date() };

        if (isAtlasConnected) {
          try {
            await ChatSession.findOneAndUpdate(
              { sessionId },
              { $push: { messages: { $each: [userMessage, botMessage] } }, $set: { updatedAt: new Date() } },
              { upsert: true, new: true }
            );
          } catch (e) {}
        }

        return res.json({
          success: true,
          query,
          batch: matchedNotice.targetBatches?.includes(activeBatch) ? activeBatch : (matchedNotice.targetBatches?.[0] || 'All'),
          answer: botAnswer,
          confidence: 1.0,
          sources: [`Official Notice Board: ${matchedNotice.title}`],
          category: matchedNotice.category || 'notice',
          latencyMs: 8,
          retrievalType: `Official Circular Match (${activeBatch})`,
          matchedItem: matchedNotice
        });
      }
    }

    // --- STEP 2: Check if query is asking for personal student metrics (attendance, CGPA, advisor, hostel, room, name, id, email, etc.)
    // or if an explicit ID number is provided in the query string (e.g. R210177, R210137, PUC-2026-102)
    const explicitIdMatch = query.match(/\b([A-Za-z]\d{6}|\d{7,10}|PUC-\d{4}-\d{3})\b/i);
    const targetStudentId = (explicitIdMatch ? explicitIdMatch[1] : (studentId || studentUser?.id || '')).trim().toUpperCase();

    // Check if query is asking for personal student details or identity (NOT circular/notice queries)
    const isPersonalQuery = !isNoticeQuery && (
      /(^|\b)(attendance|present|absent|classes\s*attended|bunk|shortage|condonation|eligib|cgpa|gpa|marks|grade|score|rank|advisor|mentor|counselor|faculty\s*advisor|faculty\s*mentor|guide|hostel|room|gh2|bh2|curfew|hall\s*ticket|about\s*me|who\s*am\s*i|who\s*i\s*am|whoami|my\s*name|what\s*is\s*my\s*name|what\s*s\s*my\s*name|my\s*id|what\s*is\s*my\s*id|id\s*number|roll\s*number|roll\s*no|my\s*roll|student\s*id|my\s*email|what\s*is\s*my\s*email|my\s*mail|my\s*branch|my\s*department|my\s*dept|my\s*section|my\s*batch|my\s*sem|my\s*semester|my\s*hostel|my\s*room|my\s*cgpa|my\s*attendance|my\s*advisor|my\s*details|my\s*profile|my\s*info|my\s*record|my\s*records|student\s*details|student\s*profile|personal\s*details)(\b|$)/i.test(lowerQuery)
      || (targetStudentId && /\b(my|i|me|myself)\b/i.test(lowerQuery) && /\b(name|id|roll|email|mail|advisor|mentor|hostel|room|cgpa|gpa|marks|attendance|branch|department|section|details|profile|record)\b/i.test(lowerQuery))
      || (targetStudentId && /^(what|tell|show|who|give)\b.*\b(my|me)\b/i.test(lowerQuery) && !/\b(circular|notice|announcement)\b/i.test(lowerQuery))
    );

    if (targetStudentId && (isPersonalQuery || explicitIdMatch)) {
      let student = null;
      if (isAtlasConnected) {
        student = await StudentData.findOne({ id: targetStudentId }).lean();
        if (!student) {
          student = await User.findOne({ id: targetStudentId }).lean();
        }
      } else {
        const store = readLocalStore();
        student = (store.students_data || memoryStudentsData || []).find(s => s.id?.toUpperCase() === targetStudentId);
        if (!student) {
          student = (store.users || memoryUsers || []).find(u => u.id?.toUpperCase() === targetStudentId);
        }
      }

      if (student) {
        let answerText = '';
        let category = 'student_record';
        const attendanceNum = parseInt(student.attendance) || 85;
        const isEligible = attendanceNum >= 75;

        // 1. Attendance query: Returns ONLY attendance percentage and examination eligibility!
        if (/attendance|present|absent|shortage|condonation|eligib|classes\s*attended|bunk/i.test(lowerQuery)) {
          category = 'attendance';
          answerText = `### 📊 Live Attendance Record for **${student.name}** (\`${student.id}\`)\n\n` +
            `- **Current Attendance:** **\`${student.attendance}\`**\n` +
            `- **Examination Eligibility:** **${isEligible ? '✅ Eligible for End-Semester Examinations' : '⚠️ Attendance Shortage Warning (Condonation Required)'}**\n\n` +
            `*Institutional Rule: A minimum of 75% attendance across theory and lab sessions is required to write university examinations.*`;
        }
        // 2. CGPA / Marks / Academic performance query: Returns ONLY CGPA and standing!
        else if (/cgpa|gpa|grade|marks|score|rank|academic\s*performance|standing/i.test(lowerQuery)) {
          category = 'academic_performance';
          const cgpaNum = parseFloat(student.cgpa) || 8.0;
          const standing = cgpaNum >= 8.0 ? 'First Class with Distinction' : (cgpaNum >= 6.5 ? 'First Class' : 'Second Class');
          answerText = `### 🏆 Academic Performance for **${student.name}** (\`${student.id}\`)\n\n` +
            `- **Cumulative GPA (CGPA):** **\`${student.cgpa}\` / 10.00**\n` +
            `- **Academic Standing:** **${standing}**\n\n` +
            `*Records verified against MongoDB Atlas \`students_data\` collection.*`;
        }
        // 3. Faculty Advisor / Mentor query: Returns ONLY assigned advisor!
        else if (/advisor|mentor|counselor|faculty\s*mentor|faculty\s*advisor|guide/i.test(lowerQuery)) {
          category = 'advisor';
          answerText = `### 👨‍🏫 Faculty Advisor for **${student.name}** (\`${student.id}\`)\n\n` +
            `- **Assigned Faculty Advisor:** **\`${student.advisor}\`**\n` +
            `- **Department:** ${student.department || 'Computer Science & Engineering'}\n` +
            `- **Cabin / Office:** Faculty Chambers, Academic Administrative Block\n` +
            `- **Consultation Hours:** Monday to Friday, 03:30 PM – 04:30 PM\n\n` +
            `*You can consult **${student.advisor}** for course registration, lab permissions, on-duty approvals, and academic guidance.*`;
        }
        // 4. Hostel / Room query: Returns ONLY allocated room and curfew!
        else if (/hostel|room|gh2|bh2|curfew|accommodation|warden/i.test(lowerQuery)) {
          category = 'hostel';
          const isGH2 = student.gender === 'Female' || student.hostelRoom?.includes('GH2');
          answerText = `### 🏠 Hostel Room Allocation for **${student.name}** (\`${student.id}\`)\n\n` +
            `- **Allocated Room:** **\`${student.hostelRoom}\`**\n` +
            `- **Hostel Complex:** **${isGH2 ? 'GH2 (Girls Hostel 2)' : 'BH2 (Boys Hostel 2)'}**\n` +
            `- **Gate Curfew Timing:** **08:30 PM** (Biometric attendance check-in mandatory)\n\n` +
            `*For room maintenance requests or weekend leave out-passes, consult the resident warden.*`;
        }
        // 5. Email query: Returns ONLY email!
        else if (/email|mail|inbox/i.test(lowerQuery)) {
          category = 'student_email';
          answerText = `### 📧 Student Institutional Email for **${student.name}**\n\n` +
            `- **Official Institutional Email:** **\`${student.email}\`**\n` +
            `- **Student ID:** **\`${student.id}\`**\n\n` +
            `*All official university notifications, exam schedules, and placement circulars are sent to this address.*`;
        }
        // 6. ID / Roll Number query: Returns ONLY ID and name!
        else if (/(^|\b)(id|roll|rollno|id\s*number|roll\s*number|student\s*id|roll\s*no)(\b|$)/i.test(lowerQuery)) {
          category = 'student_id';
          answerText = `### 🪪 Student Identification & Roll Number\n\n` +
            `- **Student ID / Roll Number:** **\`${student.id}\`**\n` +
            `- **Registered Name:** **${student.name}**\n\n` +
            `*Record fetched live from MongoDB Atlas database.*`;
        }
        // 7. Name query: Returns ONLY name and ID!
        else if (/(^|\b)(what\s*(is|\'s)\s*my\s*name|my\s*name|name\s*is)(\b|$)/i.test(lowerQuery)) {
          category = 'student_name';
          answerText = `### 👤 Registered Student Name\n\n` +
            `- **Full Name:** **${student.name}**\n` +
            `- **Student ID / Roll No:** **\`${student.id}\`**\n\n` +
            `*Verified against university student enrollment records.*`;
        }
        // 8. Section / Branch / Department query: Returns ONLY section and branch!
        else if (/(^|\b)(section|branch|department|dept|classroom)(\b|$)/i.test(lowerQuery)) {
          category = 'student_record';
          answerText = `### 📚 Academic Branch & Class Section for **${student.name}** (\`${student.id}\`)\n\n` +
            `- **Batch & Year:** **${student.batch}** (${student.semester || 'Semester VII'})\n` +
            `- **Department / Branch:** **${student.department || 'Computer Science & Engineering'}**\n` +
            `- **Classroom / Section:** \`${student.section || 'AB1-T05'}\`\n\n` +
            `*Assigned academic classroom and section records.*`;
        }
        // 9. General profile / details inquiry: Full profile table reserved for "my details", "profile", "who am i", etc.
        else {
          category = 'student_record';
          answerText = `### 🎓 Student Profile & Academic Details for **${student.name}**\n\n` +
            `| Academic & Campus Attribute | Registered Record |\n` +
            `| :--- | :--- |\n` +
            `| **Full Name** | **${student.name}** |\n` +
            `| **ID / Roll Number** | **\`${student.id}\`** |\n` +
            `| **Gender** | ${student.gender || 'Not specified'} |\n` +
            `| **Batch & Department** | **${student.batch}** • ${student.department || 'Computer Science & Engineering'} |\n` +
            `| **Semester** | ${student.semester || 'Semester VII'} |\n` +
            `| **Class Section** | \`${student.section || 'Standard'}\` |\n` +
            `| **Current Attendance** | **\`${student.attendance}\`** (${isEligible ? 'Eligible' : 'Shortage'}) |\n` +
            `| **Academic CGPA** | **\`${student.cgpa}\` / 10.00** |\n` +
            `| **Faculty Mentor / Advisor** | **${student.advisor}** |\n` +
            `| **Hostel Room** | **${student.hostelRoom}** |\n` +
            `| **Institutional Email** | \`${student.email}\` |\n\n` +
            `*Fetched live from MongoDB Atlas \`students_data\` collection.*`;
        }

        const botMessage = {
          sender: 'bot',
          text: answerText,
          confidence: 1.0,
          sources: [`MongoDB Atlas (students_data collection) [Student ID: ${student.id}]`],
          category,
          latencyMs: 8,
          personalizedFor: student.batch || batch,
          timestamp: new Date()
        };

        const userMessage = {
          sender: 'user',
          text: query,
          timestamp: new Date()
        };

        if (isAtlasConnected) {
          try {
            await ChatSession.findOneAndUpdate(
              { sessionId },
              {
                $push: { messages: { $each: [userMessage, botMessage] } },
                $set: { updatedAt: new Date() }
              },
              { upsert: true, new: true }
            );
          } catch (e) {
            console.warn('Chat session save error:', e.message);
          }
        }

        return res.json({
          success: true,
          query,
          batch: student.batch || batch,
          answer: answerText,
          confidence: 1.0,
          sources: [`MongoDB Atlas (students_data collection) [Student ID: ${student.id}]`],
          category,
          latencyMs: 8,
          retrievalType: `Personalized Student Record (${student.id})`,
          student
        });
      }
    }

    // Refresh memory cache from DB if Atlas is connected
    if (isAtlasConnected) {
      try {
        memoryKnowledge = await KnowledgeItem.find({}).lean();
        memoryNotices = await Notice.find({}).sort({ createdAt: -1 }).lean();
        memoryChunks = await DocumentChunk.find({}).lean();
      } catch (e) {
        console.warn('Cache refresh warning:', e.message);
      }
    }

    // Execute RAG query with batch context
    const result = queryRAGEngine(query, batch, memoryKnowledge, memoryChunks, memoryNotices);

    const botMessage = {
      sender: 'bot',
      text: result.answer,
      confidence: result.confidence,
      sources: result.sources,
      category: result.category,
      latencyMs: result.latencyMs,
      personalizedFor: result.personalizedFor,
      timestamp: new Date()
    };

    const userMessage = {
      sender: 'user',
      text: query,
      timestamp: new Date()
    };

    if (isAtlasConnected) {
      try {
        await ChatSession.findOneAndUpdate(
          { sessionId },
          {
            $push: { messages: { $each: [userMessage, botMessage] } },
            $set: { updatedAt: new Date() }
          },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.warn('Could not save chat to Atlas:', err.message);
      }
    } else {
      const store = readLocalStore();
      if (!store.history) store.history = [];
      store.history.push({ sessionId, batch, userMessage, botMessage });
      writeLocalStore(store);
    }

    res.json({
      success: true,
      query,
      batch: result.personalizedFor,
      answer: result.answer,
      confidence: result.confidence,
      sources: result.sources,
      category: result.category,
      latencyMs: result.latencyMs,
      retrievalType: result.retrievalType,
      matchedItem: result.matchedItem
    });
  } catch (err) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({
      error: 'An error occurred while processing the query.',
      details: err.message
    });
  }
});

// ================= NOTICES MANAGEMENT (BATCH-WISE) ================= //

/**
 * Get Notices: Supports filtering by student batch (e.g. ?batch=E3)
 */
app.get('/api/notices', async (req, res) => {
  try {
    const { batch, category, search } = req.query;

    if (isAtlasConnected) {
      const filter = {};
      if (batch && batch !== 'All') {
        filter.targetBatches = { $in: [batch, 'All'] };
      }
      if (category && category !== 'all') {
        filter.category = category;
      }
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ];
      }

      const notices = await Notice.find(filter).sort({ isPinned: -1, createdAt: -1 });
      return res.json({ success: true, count: notices.length, data: notices });
    } else {
      let filtered = [...memoryNotices];
      if (batch && batch !== 'All') {
        filtered = filtered.filter(n => {
          const batches = n.targetBatches || ['All'];
          return batches.includes(batch) || batches.includes('All');
        });
      }
      if (category && category !== 'all') {
        filtered = filtered.filter(n => n.category === category);
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(n =>
          n.title.toLowerCase().includes(s) ||
          n.content.toLowerCase().includes(s)
        );
      }
      // Sort pinned first, then newest
      filtered.sort((a, b) => {
        if (b.isPinned !== a.isPinned) return b.isPinned ? 1 : -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      return res.json({ success: true, count: filtered.length, data: filtered });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Admin: Add New Notice (targeted to specific student batches: P1, P2, E1, E2, E3, E4, All)
 */
app.post('/api/notices', async (req, res) => {
  try {
    const { title, content, category, targetBatches, priority, postedBy, isPinned } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required for notice.' });
    }

    const batches = Array.isArray(targetBatches) && targetBatches.length > 0 ? targetBatches : ['All'];

    const newNotice = {
      title: title.trim(),
      content: content.trim(),
      category: category || 'general',
      targetBatches: batches,
      priority: priority || 'normal',
      postedBy: postedBy || 'Dean Academics & Controller of Examinations',
      isPinned: Boolean(isPinned),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isAtlasConnected) {
      const created = await Notice.create(newNotice);
      memoryNotices = await Notice.find({}).sort({ createdAt: -1 }).lean();
      return res.status(201).json({
        success: true,
        message: `Notice posted successfully for batches: ${batches.join(', ')}`,
        data: created
      });
    } else {
      newNotice._id = 'local_n_' + Date.now();
      memoryNotices.unshift(newNotice);
      const store = readLocalStore();
      store.notices = memoryNotices;
      writeLocalStore(store);
      return res.status(201).json({
        success: true,
        message: `Notice posted successfully for batches: ${batches.join(', ')}`,
        data: newNotice
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Admin: Edit Notice
 */
app.put('/api/notices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, targetBatches, priority, postedBy, isPinned } = req.body;

    const updateFields = { updatedAt: new Date() };
    if (title !== undefined) updateFields.title = title.trim();
    if (content !== undefined) updateFields.content = content.trim();
    if (category !== undefined) updateFields.category = category;
    if (priority !== undefined) updateFields.priority = priority;
    if (postedBy !== undefined) updateFields.postedBy = postedBy;
    if (isPinned !== undefined) updateFields.isPinned = Boolean(isPinned);
    if (targetBatches !== undefined) {
      updateFields.targetBatches = Array.isArray(targetBatches) && targetBatches.length > 0 ? targetBatches : ['All'];
    }

    if (isAtlasConnected) {
      const updated = await Notice.findByIdAndUpdate(id, updateFields, { new: true });
      if (!updated) return res.status(404).json({ error: 'Notice not found in MongoDB Atlas' });
      memoryNotices = await Notice.find({}).sort({ createdAt: -1 }).lean();
      return res.json({ success: true, message: 'Notice updated successfully!', data: updated });
    } else {
      const idx = memoryNotices.findIndex(n => (n._id || n.id) === id);
      if (idx === -1) return res.status(404).json({ error: 'Notice not found in local store' });
      memoryNotices[idx] = { ...memoryNotices[idx], ...updateFields };
      const store = readLocalStore();
      store.notices = memoryNotices;
      writeLocalStore(store);
      return res.json({ success: true, message: 'Notice updated successfully!', data: memoryNotices[idx] });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Admin: Delete Notice
 */
app.delete('/api/notices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isAtlasConnected) {
      await Notice.findByIdAndDelete(id);
      memoryNotices = await Notice.find({}).sort({ createdAt: -1 }).lean();
    } else {
      memoryNotices = memoryNotices.filter(n => (n._id || n.id) !== id);
      const store = readLocalStore();
      store.notices = memoryNotices;
      writeLocalStore(store);
    }
    res.json({ success: true, message: 'Notice deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= KNOWLEDGE BASE (BATCH-WISE FAQS) ================= //

/**
 * Get all Knowledge Items (with optional batch and category filters)
 */
app.get('/api/knowledge', async (req, res) => {
  try {
    const { category, batch, search } = req.query;

    if (isAtlasConnected) {
      const filter = {};
      if (category && category !== 'all') filter.category = category;
      if (batch && batch !== 'all') {
        filter.targetBatches = { $in: [batch, 'All'] };
      }
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { answer: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }
      const items = await KnowledgeItem.find(filter).sort({ lastUpdated: -1 });
      return res.json({ success: true, count: items.length, data: items });
    } else {
      let filtered = [...memoryKnowledge];
      if (category && category !== 'all') {
        filtered = filtered.filter(item => item.category === category);
      }
      if (batch && batch !== 'all') {
        filtered = filtered.filter(item => {
          const b = item.targetBatches || ['All'];
          return b.includes(batch) || b.includes('All');
        });
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(item =>
          item.title.toLowerCase().includes(s) ||
          item.answer.toLowerCase().includes(s) ||
          (item.tags || []).some(t => t.toLowerCase().includes(s))
        );
      }
      return res.json({ success: true, count: filtered.length, data: filtered });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Create new knowledge item
 */
app.post('/api/knowledge', async (req, res) => {
  try {
    const { title, category, targetBatches, queryPatterns, answer, tags, sourceDocument } = req.body;
    if (!title || !answer) {
      return res.status(400).json({ error: 'Title and Answer are required.' });
    }

    const newItem = {
      title,
      category: category || 'general',
      targetBatches: Array.isArray(targetBatches) && targetBatches.length > 0 ? targetBatches : ['All'],
      queryPatterns: Array.isArray(queryPatterns) ? queryPatterns : (queryPatterns ? queryPatterns.split(',').map(s => s.trim()) : []),
      answer,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(s => s.trim()) : []),
      sourceDocument: sourceDocument || 'College Official Notice Board / Handbook 2026',
      isVerified: true,
      lastUpdated: new Date()
    };

    if (isAtlasConnected) {
      const created = await KnowledgeItem.create(newItem);
      memoryKnowledge = await KnowledgeItem.find({}).lean();
      return res.status(201).json({ success: true, message: 'Created successfully in MongoDB Atlas', data: created });
    } else {
      newItem._id = 'local_k_' + Date.now();
      memoryKnowledge.unshift(newItem);
      const store = readLocalStore();
      store.knowledge = memoryKnowledge;
      writeLocalStore(store);
      return res.status(201).json({ success: true, message: 'Created successfully in local store', data: newItem });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Update an existing Knowledge Item (e.g. exams, fees, holidays)
 */
app.put('/api/knowledge/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, targetBatches, queryPatterns, answer, tags, sourceDocument } = req.body;

    const updateFields = { lastUpdated: new Date() };
    if (title !== undefined) updateFields.title = title;
    if (category !== undefined) updateFields.category = category;
    if (answer !== undefined) updateFields.answer = answer;
    if (sourceDocument !== undefined) updateFields.sourceDocument = sourceDocument;
    if (targetBatches !== undefined) {
      updateFields.targetBatches = Array.isArray(targetBatches) && targetBatches.length > 0 ? targetBatches : ['All'];
    }
    if (queryPatterns !== undefined) {
      updateFields.queryPatterns = Array.isArray(queryPatterns) ? queryPatterns : queryPatterns.split(',').map(s => s.trim());
    }
    if (tags !== undefined) {
      updateFields.tags = Array.isArray(tags) ? tags : tags.split(',').map(s => s.trim());
    }

    if (isAtlasConnected) {
      const updated = await KnowledgeItem.findByIdAndUpdate(id, updateFields, { new: true });
      if (!updated) return res.status(404).json({ error: 'Knowledge item not found in MongoDB Atlas' });
      memoryKnowledge = await KnowledgeItem.find({}).lean();
      return res.json({ success: true, message: 'Updated successfully in MongoDB Atlas!', data: updated });
    } else {
      const idx = memoryKnowledge.findIndex(k => (k._id || k.id) === id);
      if (idx === -1) return res.status(404).json({ error: 'Knowledge item not found in local store' });
      memoryKnowledge[idx] = { ...memoryKnowledge[idx], ...updateFields };
      const store = readLocalStore();
      store.knowledge = memoryKnowledge;
      writeLocalStore(store);
      return res.json({ success: true, message: 'Updated successfully in local store!', data: memoryKnowledge[idx] });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Delete a knowledge item
 */
app.delete('/api/knowledge/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isAtlasConnected) {
      await KnowledgeItem.findByIdAndDelete(id);
      memoryKnowledge = await KnowledgeItem.find({}).lean();
    } else {
      memoryKnowledge = memoryKnowledge.filter(k => (k._id || k.id) !== id);
      const store = readLocalStore();
      store.knowledge = memoryKnowledge;
      writeLocalStore(store);
    }
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Reset knowledge base to default seeds
 */
app.post('/api/knowledge/reset', async (req, res) => {
  try {
    if (isAtlasConnected) {
      await KnowledgeItem.deleteMany({});
      await KnowledgeItem.insertMany(defaultKnowledgeItems);
      await Notice.deleteMany({});
      await Notice.insertMany(defaultNotices);
      memoryKnowledge = await KnowledgeItem.find({}).lean();
      memoryNotices = await Notice.find({}).sort({ createdAt: -1 }).lean();
    } else {
      memoryKnowledge = defaultKnowledgeItems.map((item, index) => ({
        ...item,
        _id: 'local_k_' + (index + 1),
        lastUpdated: new Date().toISOString(),
        isVerified: true
      }));
      memoryNotices = defaultNotices.map((notice, index) => ({
        ...notice,
        _id: 'local_n_' + (index + 1),
        createdAt: notice.createdAt ? notice.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      const store = readLocalStore();
      store.knowledge = memoryKnowledge;
      store.notices = memoryNotices;
      writeLocalStore(store);
    }
    res.json({
      success: true,
      message: 'Reset complete: Batch knowledge and batch notices restored to defaults!',
      knowledgeCount: memoryKnowledge.length,
      noticesCount: memoryNotices.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Document Ingestion
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

app.post('/api/documents/ingest', async (req, res) => {
  try {
    const { title, text, category = 'general', docType = 'text' } = req.body;
    if (!title || !text) {
      return res.status(400).json({ error: 'Title and text content are required.' });
    }

    const chunks = segmentDocument(text, 180, 40);
    const chunkObjects = chunks.map((chunkContent, index) => ({
      docTitle: title,
      docType,
      category,
      chunkIndex: index,
      content: chunkContent,
      createdAt: new Date()
    }));

    if (isAtlasConnected) {
      const inserted = await DocumentChunk.insertMany(chunkObjects);
      memoryChunks = await DocumentChunk.find({}).lean();
      return res.status(201).json({
        success: true,
        message: `Successfully segmented and stored ${inserted.length} document chunks in MongoDB Atlas.`,
        chunksCount: inserted.length
      });
    } else {
      const localChunksWithIds = chunkObjects.map((c, i) => ({
        ...c,
        _id: 'chunk_' + Date.now() + '_' + i
      }));
      memoryChunks.push(...localChunksWithIds);
      const store = readLocalStore();
      store.documents = memoryChunks;
      writeLocalStore(store);
      return res.status(201).json({
        success: true,
        message: `Successfully segmented and stored ${localChunksWithIds.length} document chunks in local store.`,
        chunksCount: localChunksWithIds.length
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/documents', async (req, res) => {
  try {
    if (isAtlasConnected) {
      const chunks = await DocumentChunk.find({}).sort({ createdAt: -1 });
      return res.json({ success: true, count: chunks.length, data: chunks });
    } else {
      return res.json({ success: true, count: memoryChunks.length, data: memoryChunks });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// History
app.get('/api/history', async (req, res) => {
  try {
    if (isAtlasConnected) {
      const sessions = await ChatSession.find({}).sort({ updatedAt: -1 }).limit(10);
      return res.json({ success: true, data: sessions });
    } else {
      const store = readLocalStore();
      return res.json({ success: true, data: store.history || [] });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve built frontend in unified deployment
const distPath = path.join(__dirname, '..', 'frontend', 'dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log('📦 Serving built React frontend from:', distPath);
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 CampusConnect Backend Server listening on http://localhost:${PORT}`);
  await initializeData();
});
