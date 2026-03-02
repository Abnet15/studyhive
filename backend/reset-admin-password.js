/**
 * Reset Admin Password Script
 * 
 * Usage:
 *   node reset-admin-password.js                    # resets to default "password"
 *   node reset-admin-password.js myNewPassword123   # resets to custom password
 * 
 * Uses the existing .env database configuration.
 */

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '.env') });

const ADMIN_EMAIL = 'admin@studyhive.com';
const NEW_PASSWORD = process.argv[2] || 'password';

async function resetPassword() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'studyhive',
        });

        console.log('✅ Connected to database');

        // Check if admin exists
        const [rows] = await connection.execute(
            'SELECT id, email, role FROM users WHERE email = ?',
            [ADMIN_EMAIL]
        );

        if (rows.length === 0) {
            console.error(`❌ No user found with email: ${ADMIN_EMAIL}`);
            process.exit(1);
        }

        const admin = rows[0];
        console.log(`📋 Found user: id=${admin.id}, email=${admin.email}, role=${admin.role}`);

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(NEW_PASSWORD, salt);

        // Update the password
        await connection.execute(
            'UPDATE users SET password_hash = ? WHERE email = ?',
            [hash, ADMIN_EMAIL]
        );

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
        if (connection) await connection.end();
    }
}

resetPassword();
