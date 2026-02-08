const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

console.log('--- DIAGNOSTIC START ---');

const password = process.env.DB_PASSWORD || 'XackUser2026!@#';
console.log(`Password length: ${password.length} characters`);
console.log(`First char: ${password[0]}, Last char: ${password[password.length - 1]}`);

async function tryConnect(host) {
    console.log(`\nTesting connection to host: ${host}...`);
    const dbConfig = {
        host: host,
        user: process.env.DB_USER || 'xack_user',
        password: password,
        database: process.env.DB_NAME || 'xack_platform'
    };

    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log(`   ✅ SUCCESS connecting to ${host}!`);
        await connection.end();
        return true;
    } catch (error) {
        console.log(`   ❌ FAILED connecting to ${host}: ${error.code} - ${error.message}`);
        return false;
    }
}

async function test() {
    try {
        const local = await tryConnect('localhost');
        const ip = await tryConnect('127.0.0.1');

        if (!local && !ip) {
            console.error('\n--- ALL CONNECTIONS FAILED ---');
            process.exit(1);
        }

        console.log('\n--- AT LEAST ONE CONNECTION SUCCEEDED ---');
        console.log('Use key "DB_HOST" in .env with the working host (localhost or 127.0.0.1)');
        process.exit(0);

    } catch (error) {
        console.error('--- UNEXPECTED ERROR ---');
        console.error(error);
        process.exit(1);
    }
}

test();
