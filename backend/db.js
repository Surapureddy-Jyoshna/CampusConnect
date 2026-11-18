import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const LOCAL_DB_PATH = path.join(__dirname, '..', 'data', 'local_store.json');

// Ensure data dir exists
const dataDir = path.dirname(LOCAL_DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export let isAtlasConnected = false;
export let connectionError = null;

// Connect to MongoDB Atlas
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️ MONGODB_URI is not set in .env. Running in local persistence mode.');
    return;
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isAtlasConnected = true;
    connectionError = null;
    console.log('✅ Connected to MongoDB Atlas successfully!');
  } catch (err) {
    isAtlasConnected = false;
    connectionError = err.message;
    console.warn('⚠️ MongoDB Atlas connection notice:', err.message);
    console.warn('ℹ️ Running with persistent local database sync. Once IP is whitelisted on Atlas, it connects automatically.');
  }
}

// Local store fallback helpers
export function readLocalStore() {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const content = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Error reading local store:', e.message);
  }
  return { knowledge: [], documents: [], history: [] };
}

export function writeLocalStore(data) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing local store:', e.message);
  }
}

