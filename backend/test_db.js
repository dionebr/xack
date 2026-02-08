const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

console.log('--- DIAGNOSTIC START ---');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'xack_user',
    password: process.env.DB_PASSWORD || 'XackUser2026!@#',
    database: process.env.DB_NAME || 'xack_platform'
};

console.log(`Configured to connect to: ${dbConfig.user}@${dbConfig.host}/${dbConfig.database}`);

async function test() {
    try {
        console.log('1. Testing Database Connection...');
        const connection = await mysql.createConnection(dbConfig);
        console.log('   ✅ Connection successful!');

        console.log('2. Checking "users" table...');
        const [rows] = await connection.execute('SELECT count(*) as count FROM users');
        console.log(`   ✅ Table exists. User count: ${rows[0].count}`);

        console.log('3. Testing Password Hashing (bcrypt)...');
        const hash = await bcrypt.hash('testpassword', 10);
        console.log('   ✅ Bcrypt hash generated successfully.');

        console.log('4. Testing JWT Signing...');
        const token = jwt.sign({ id: 1, test: true }, 'secret', { expiresIn: '1h' });
        console.log('   ✅ JWT token generated successfully.');

        console.log('--- DIAGNOSTIC PASS ---');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('--- DIAGNOSTIC FAIL ---');
        console.error('Error Details:', error);
        process.exit(1);
    }
}

test();
