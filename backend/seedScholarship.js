/**
 * seedScholarship.js
 * Updates all 360 students in MongoDB Atlas with:
 *   - scholarship: true (60%) or false (40%)
 *   - govtScholarship: 35000 (scholarship) or 0
 *   - semFeeTotal: 10000 (scholarship student's share) or 55000
 *   - feeDue: random amount between 0 and semFeeTotal (in multiples of 500)
 *   - feeStatus: 'Paid' | 'Partial' | 'Unpaid'
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

// Student schema (minimal - just what we need)
const studentSchema = new mongoose.Schema({}, { strict: false });
const StudentData = mongoose.model('students_data', studentSchema, 'students_data');

function getRandomFeeDue(semFeeTotal) {
  // 50% chance fully paid, 30% partial, 20% fully unpaid
  const roll = Math.random();
  if (roll < 0.50) {
    return 0; // fully paid
  } else if (roll < 0.80) {
    // partial: a random multiple of 500 between 500 and semFeeTotal
    const steps = Math.floor(semFeeTotal / 500);
    const randomSteps = Math.floor(Math.random() * (steps - 1)) + 1;
    return randomSteps * 500;
  } else {
    return semFeeTotal; // fully unpaid
  }
}

async function main() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected!');

  const students = await StudentData.find({}).lean();
  console.log(`Found ${students.length} students. Assigning scholarship & fee data...`);

  let scholarCount = 0;
  let nonScholarCount = 0;
  let bulkOps = [];

  for (let i = 0; i < students.length; i++) {
    const s = students[i];

    // Assign scholarship: ~60% get scholarship
    // Use a deterministic-ish seed from student ID so it stays stable across reruns
    const idNum = parseInt((s.id || '').replace(/\D/g, '').slice(-4)) || i;
    const isScholar = (idNum % 10) < 6; // 0–5 → scholar (60%), 6–9 → non-scholar (40%)

    const govtScholarship = isScholar ? 35000 : 0;
    const semFeeTotal = isScholar ? 10000 : 55000; // what student must pay
    const feeDue = getRandomFeeDue(semFeeTotal);

    let feeStatus = 'Paid';
    if (feeDue === semFeeTotal) feeStatus = 'Unpaid';
    else if (feeDue > 0) feeStatus = 'Partial';

    if (isScholar) scholarCount++; else nonScholarCount++;

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

    // Execute in batches of 100
    if (bulkOps.length === 100) {
      await StudentData.bulkWrite(bulkOps);
      process.stdout.write(`  Updated ${i + 1}/${students.length} students...\r`);
      bulkOps = [];
    }
  }

  // Flush remaining
  if (bulkOps.length > 0) {
    await StudentData.bulkWrite(bulkOps);
  }

  console.log(`\n✅ Done!`);
  console.log(`  📚 Scholarship students (Govt: ₹35,000 | Student pays: ₹10,000/sem): ${scholarCount}`);
  console.log(`  💰 Non-scholarship students (Full fee: ₹55,000/sem): ${nonScholarCount}`);

  // Show sample
  const sample = await StudentData.findOne({ id: 'R210688' }).lean();
  console.log('\nSample (R210688):', JSON.stringify({
    scholarship: sample.scholarship,
    govtScholarship: sample.govtScholarship,
    semFeeTotal: sample.semFeeTotal,
    feeDue: sample.feeDue,
    feeStatus: sample.feeStatus
  }, null, 2));

  await mongoose.disconnect();
  console.log('Disconnected. All done!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
