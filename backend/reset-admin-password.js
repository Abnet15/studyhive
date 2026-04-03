/**
 * Reset Admin Password Script (MongoDB version)
 * 
 * Usage:
 *   node reset-admin-password.js                    # resets to default "password"
 *   node reset-admin-password.js myNewPassword123   # resets to custom password
 * 
 */

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '.env') });

const User = require('./src/models/User.model');

const ADMIN_EMAIL = 'admin@studyhive.com';
const NEW_PASSWORD = process.argv[2] || 'password';

async function resetPassword() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studyhive';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Check if admin exists
        const admin = await User.findOne({ email: ADMIN_EMAIL });

        if (!admin) {
            console.error(`❌ No user found with email: ${ADMIN_EMAIL}`);
            process.exit(1);
        }

        console.log(`📋 Found user: id=${admin._id}, email=${admin.email}, role=${admin.role}`);

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(NEW_PASSWORD, salt);

        // Update the password
        admin.password_hash = hash;
        await admin.save();

        console.log('');
        console.log('🎉 Password reset successfully!');
        console.log(`   Email:    ${ADMIN_EMAIL}`);
        console.log(`   Password: ${NEW_PASSWORD}`);
        console.log('');
        console.log('You can now log in to the admin dashboard.');

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

resetPassword();
