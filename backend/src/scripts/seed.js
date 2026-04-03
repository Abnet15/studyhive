/**
 * StudyHive MongoDB Seed Script
 * Run: node src/scripts/seed.js
 * Creates demo departments, courses, admin user, and student users.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const User = require('../models/User.model');
const Department = require('../models/Department.model');
const Course = require('../models/Course.model');
const Badge = require('../models/Badge.model');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/studyhive';

async function seed() {
  console.log('[Seed] Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('[Seed] Connected.');

  // ── Clear existing data ──
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Course.deleteMany({}),
    Badge.deleteMany({}),
  ]);
  console.log('[Seed] Cleared existing data.');

  // ── Departments ──
  const departments = await Department.insertMany([
    { name: 'Software Engineering' },
    { name: 'Computer Science' },
    { name: 'Information Technology' },
    { name: 'Electrical Engineering' },
    { name: 'Civil Engineering' },
  ]);
  console.log(`[Seed] Created ${departments.length} departments.`);

  const seDept = departments[0];
  const csDept = departments[1];

  // ── Users ──
  const passwordHash = await bcrypt.hash('password', 10);

  const admin = await User.create({
    fullName: 'Admin User',
    email: 'admin@studyhive.com',
    password_hash: passwordHash,
    role: 'admin',
    department_id: seDept._id,
    academic_year: 4,
  });

  const alem = await User.create({
    fullName: 'Alem Tadesse',
    email: 'alem@example.com',
    password_hash: passwordHash,
    role: 'student',
    department_id: seDept._id,
    academic_year: 3,
  });

  const sara = await User.create({
    fullName: 'Sara Mengistu',
    email: 'sara@example.com',
    password_hash: passwordHash,
    role: 'student',
    department_id: csDept._id,
    academic_year: 2,
  });

  console.log(`[Seed] Created 3 users (admin, alem, sara). Password for all: "password"`);

  // ── Courses ──
  const courses = await Course.insertMany([
    { title: 'Data Structures & Algorithms', code: 'CS201', department_id: csDept._id },
    { title: 'Software Engineering Principles', code: 'SE301', department_id: seDept._id },
    { title: 'Database Systems', code: 'CS301', department_id: csDept._id },
    { title: 'Web Development', code: 'SE201', department_id: seDept._id },
    { title: 'Operating Systems', code: 'CS401', department_id: csDept._id },
    { title: 'Artificial Intelligence', code: 'CS402', department_id: csDept._id },
    { title: 'Computer Networks', code: 'IT301', department_id: departments[2]._id },
    { title: 'Circuit Analysis', code: 'EE201', department_id: departments[3]._id },
  ]);
  console.log(`[Seed] Created ${courses.length} courses.`);

  // ── Badges ──
  const badges = await Badge.insertMany([
    { name: 'First Upload', description: 'Uploaded your first material', criteria: 'upload_1', iconUrl: '🎯' },
    { name: 'Contributor', description: 'Uploaded 5 materials', criteria: 'upload_5', iconUrl: '⭐' },
    { name: 'Scholar', description: 'Uploaded 10 materials', criteria: 'upload_10', iconUrl: '🏆' },
    { name: 'Helpful', description: 'Received 10 downloads on a single material', criteria: 'downloads_10', iconUrl: '💡' },
    { name: 'Guru', description: 'Average rating above 4.5', criteria: 'rating_4.5', iconUrl: '🧠' },
  ]);
  console.log(`[Seed] Created ${badges.length} badges.`);

  // Award "First Upload" to admin
  badges[0].users.push(admin._id);
  await badges[0].save();

  console.log('\n✅ Seed complete!');
  console.log('───────────────────────────────────');
  console.log('Login Credentials:');
  console.log('  Admin:  admin@studyhive.com / password');
  console.log('  Alem:   alem@example.com / password');
  console.log('  Sara:   sara@example.com / password');
  console.log('───────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] FATAL ERROR:', err);
  process.exit(1);
});
