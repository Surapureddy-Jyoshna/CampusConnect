/**
 * seedScholarship.js
 * Updates all 360 students in data/local_store.json AND MongoDB Atlas (if connected) with:
 *   - scholarship: true (60%) or false (40%)
 *   - govtScholarship: 35000 (scholarship) or 0
 *   - semFeeTotal: 10000 (scholarship student's share) or 55000 (non-scholarship)
 *   - feeDue: random amount between 0 and semFeeTotal (in multiples of 500)
 *   - feeStatus: 'Paid' | 'Partial' | 'Unpaid'
 *   - feeSem: 'Semester VII (Odd 2026-27)'
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const LOCAL_DB_PATH = join(__dirname, '..', 'data', 'local_store.json');

// Pseudo-random deterministic fee due generator using student id
function getDeterministicFeeDue(id, semFeeTotal) {
  const num = parseInt((id || '').replace(/\D/g, '').slice(-3)) || 17;
  const mod = num % 10;
  if (mod < 4) {
    // 40% Paid
    return 0;
  } else if (mod < 8) {
    // 40% Partial
    const stepCount = Math.floor(semFeeTotal / 1000);
    const chosenSteps = (num % (stepCount - 1)) + 1;
    return chosenSteps * 1000;
  } else {
    // 20% Unpaid
    return semFeeTotal;
  }
}

async function main() {
  console.log('--- 1. Updating local store (data/local_store.json) ---');
  let localStudentsUpdated = 0;
  let scholarCount = 0;
  let nonScholarCount = 0;

  if (fs.existsSync(LOCAL_DB_PATH)) {
    const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
    const store = JSON.parse(raw);

    if (Array.isArray(store.students_data)) {
      store.students_data = store.students_data.map((s, i) => {
        const idNum = parseInt((s.id || '').replace(/\D/g, '').slice(-4)) || i;
        const isScholar = (idNum % 10) < 6; // 60% scholarship, 40% non-scholarship

        const govtScholarship = isScholar ? 35000 : 0;
        const semFeeTotal = isScholar ? 10000 : 55000;
        const feeDue = getDeterministicFeeDue(s.id, semFeeTotal);

        let feeStatus = 'Paid';
        if (feeDue === semFeeTotal) feeStatus = 'Unpaid';
        else if (feeDue > 0) feeStatus = 'Partial';

        if (isScholar) scholarCount++;
        else nonScholarCount++;

        return {
          ...s,
          scholarship: isScholar,
          govtScholarship,
          semFeeTotal,
          feeDue,
          feeStatus,
          feeSem: 'Semester VII (Odd 2026-27)'
        };
      });

      // Also update users array if matching student id exists
      if (Array.isArray(store.users)) {
        store.users = store.users.map(u => {
          const match = store.students_data.find(s => s.id?.toUpperCase() === u.id?.toUpperCase());
          if (match) {
            return {
              ...u,
              scholarship: match.scholarship,
              govtScholarship: match.govtScholarship,
              semFeeTotal: match.semFeeTotal,
              feeDue: match.feeDue,
              feeStatus: match.feeStatus,
              feeSem: match.feeSem
            };
          }
          return u;
        });
      }

      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(store, null, 2), 'utf8');
      localStudentsUpdated = store.students_data.length;
      console.log(`✅ Updated ${localStudentsUpdated} students in data/local_store.json!`);
      console.log(`  📚 Scholarship: ${scholarCount} (Govt: ₹35,000 | Student pays: ₹10,000/sem)`);
      console.log(`  💰 Non-Scholarship: ${nonScholarCount} (Student pays: ₹55,000/sem)`);

      const sample = store.students_data.find(x => x.id === 'R210688');
      if (sample) {
        console.log('\nSample Student (R210688):', JSON.stringify({
          id: sample.id,
          name: sample.name,
          scholarship: sample.scholarship,
          govtScholarship: sample.govtScholarship,
          semFeeTotal: sample.semFeeTotal,
          feeDue: sample.feeDue,
          feeStatus: sample.feeStatus
        }, null, 2));
      }
    }
  }

  // --- 2. Attempt MongoDB Atlas sync ---
  console.log('\n--- 2. Attempting MongoDB Atlas sync ---');
  if (process.env.MONGODB_URI) {
    try {
      console.log('Connecting to MongoDB Atlas (5s timeout)...');
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ Connected to MongoDB Atlas!');

      const studentSchema = new mongoose.Schema({}, { strict: false });
      const StudentData = mongoose.model('students_data', studentSchema, 'students_data');
      const students = await StudentData.find({}).lean();

      if (students.length > 0) {
        let bulkOps = [];
        for (let i = 0; i < students.length; i++) {
          const s = students[i];
          const idNum = parseInt((s.id || '').replace(/\D/g, '').slice(-4)) || i;
          const isScholar = (idNum % 10) < 6;
          const govtScholarship = isScholar ? 35000 : 0;
          const semFeeTotal = isScholar ? 10000 : 55000;
          const feeDue = getDeterministicFeeDue(s.id, semFeeTotal);

          let feeStatus = 'Paid';
          if (feeDue === semFeeTotal) feeStatus = 'Unpaid';
          else if (feeDue > 0) feeStatus = 'Partial';

          bulkOps.push({
            updateOne: {
              filter: { _id: s._id },
              update: {
                $set: {
                  scholarship: isScholar,
                  govtScholarship,
                  semFeeTotal,
                  feeDue,
                  feeStatus,
                  feeSem: 'Semester VII (Odd 2026-27)'
                }
              }
            }
          });

          if (bulkOps.length === 100) {
            await StudentData.bulkWrite(bulkOps);
            bulkOps = [];
          }
        }
        if (bulkOps.length > 0) {
          await StudentData.bulkWrite(bulkOps);
        }
        console.log(`✅ Synced ${students.length} students to MongoDB Atlas!`);
      }

      await mongoose.disconnect();
    } catch (err) {
      console.warn('⚠️ Atlas sync skipped (network/whitelist):', err.message);
      console.log('ℹ️ Local persistence store is fully updated and active.');
    }
  }

  console.log('\n🎉 All seeding tasks complete!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
