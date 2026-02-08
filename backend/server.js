const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'xack_secret_key_change_in_production';

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'xack_user',
    password: process.env.DB_PASSWORD || 'XackUser2026!@#',
    database: process.env.DB_NAME || 'xack_platform',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection()
    .then(conn => {
        console.log('✅ Database connected successfully');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
    });

// ============ AUTHENTICATION ENDPOINTS ============

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user exists
        const [existing] = await pool.query(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, password_hash]
        );

        // Generate token
        const token = jwt.sign(
            { id: result.insertId, username, email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: result.insertId, username, email }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find user
        const [users] = await pool.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar_url: user.avatar_url,
                rank_title: user.rank_title,
                total_xp: user.total_xp,
                level: user.level
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get User Profile (Protected)
app.get('/api/user', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, username, email, avatar_url, rank_title, total_xp, level, bio, is_admin, is_verified, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: users[0] });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// ============ MIDDLEWARE ============

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// ============ FLAG SUBMISSION ============

// Submit Flag
app.post('/api/submit-flag', authenticateToken, async (req, res) => {
    try {
        const { flag, machine_id } = req.body;

        if (!flag || !machine_id) {
            return res.status(400).json({ error: 'Flag and machine_id are required' });
        }

        // Validate flag format: XACK{32-char-hex}
        const flagRegex = /^XACK\{[a-f0-9]{32}\}$/i;
        if (!flagRegex.test(flag)) {
            return res.status(400).json({
                error: 'Invalid flag format. Expected: XACK{hash}',
                example: 'XACK{e99a18c428cb38d5f260853678922e03}'
            });
        }

        // Extract hash from flag
        const flagHash = flag.match(/\{([a-f0-9]{32})\}/i)[1].toLowerCase();

        // Find matching flag in database
        const [flags] = await pool.query(
            'SELECT * FROM flags WHERE machine_id = ? AND LOWER(flag_hash) = ?',
            [machine_id, flagHash]
        );

        if (flags.length === 0) {
            // Record incorrect submission
            await pool.query(
                'INSERT INTO user_submissions (user_id, flag_id, submitted_flag, is_correct) VALUES (?, NULL, ?, FALSE)',
                [req.user.id, flag]
            );
            return res.status(400).json({ error: 'Incorrect flag' });
        }

        const correctFlag = flags[0];

        // Check if already submitted
        const [existing] = await pool.query(
            'SELECT * FROM user_submissions WHERE user_id = ? AND flag_id = ? AND is_correct = TRUE',
            [req.user.id, correctFlag.id]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'Flag already submitted' });
        }

        // Record correct submission
        await pool.query(
            'INSERT INTO user_submissions (user_id, flag_id, submitted_flag, is_correct) VALUES (?, ?, ?, TRUE)',
            [req.user.id, correctFlag.id, flag]
        );

        // Update user XP and machine status
        await pool.query(
            'UPDATE users SET total_xp = total_xp + ? WHERE id = ?',
            [correctFlag.points, req.user.id]
        );

        // Update machine progress
        const updateField = correctFlag.type === 'User' ? 'user_flag_captured' : 'root_flag_captured';
        await pool.query(
            `INSERT INTO user_machine_status (user_id, machine_id, ${updateField}, progress) 
       VALUES (?, ?, TRUE, ?) 
       ON DUPLICATE KEY UPDATE ${updateField} = TRUE, progress = GREATEST(progress, ?)`,
            [req.user.id, machine_id, correctFlag.type === 'Root' ? 100 : 50, correctFlag.type === 'Root' ? 100 : 50]
        );

        res.json({
            success: true,
            message: `${correctFlag.type} flag captured!`,
            points: correctFlag.points,
            flag_type: correctFlag.type
        });

    } catch (error) {
        console.error('Submit flag error:', error);
        res.status(500).json({ error: 'Flag submission failed' });
    }
});

// ============ HEALTH CHECK ============

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'XACK Backend API is running' });
});

// ============ ORCHESTRATION ENDPOINTS ============

const { exec } = require('child_process');

// Map database IDs to file system paths
const MACHINE_MAP = {
    '1': { slug: 'reader', category: 'web' }, // Example
    '3': { slug: 'artemis-i', category: 'web' }
};

// Spawn Machine
app.post('/api/spawn', authenticateToken, (req, res) => {
    const { machine_id } = req.body;

    if (!machine_id || !MACHINE_MAP[machine_id]) {
        return res.status(404).json({ error: 'Machine not found or not configured for auto-spawn' });
    }

    const { slug, category } = MACHINE_MAP[machine_id];
    const user_id = req.user.id;

    const scriptPath = '/opt/xack/orchestrator/scripts/start-machine.sh';
    const command = `/bin/bash ${scriptPath} ${slug} ${user_id} ${category}`;

    console.log(`Executing: ${command}`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Spawn error: ${error.message}`);
            return res.status(500).json({ error: 'Failed to spawn machine', details: stderr });
        }

        // Extract IP from stdout if possible, or just return success
        // The script prints "Access URL: http://localhost:PORT"
        console.log(`Spawn stdout: ${stdout}`);

        res.json({
            status: 'spawned',
            message: 'Machine started successfully',
            ip: '10.10.11.50' // Artemis I static IP for this challenge style, or dynamic if we want
            // For Artemis I, the challenge description says "10.10.11.50", but the docker setup 
            // uses localhost ports. We might need to handle this discrepancy.
            // For now, let's assume the user wants the "simulation" to feel like 10.10.11.50
        });
    });
});

// Terminate Machine
app.post('/api/terminate', authenticateToken, (req, res) => {
    const { machine_id } = req.body;

    if (!machine_id || !MACHINE_MAP[machine_id]) {
        return res.status(404).json({ error: 'Machine not found' });
    }

    const { slug } = MACHINE_MAP[machine_id];
    const user_id = req.user.id;

    const scriptPath = '/opt/xack/orchestrator/scripts/stop-machine.sh';
    const command = `/bin/bash ${scriptPath} ${slug} ${user_id}`;

    console.log(`Executing: ${command}`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Terminate error: ${error.message}`);
            return res.status(500).json({ error: 'Failed to terminate machine', details: stderr });
        }

        res.json({ status: 'terminated', message: 'Machine stopped successfully' });
    });
});

// Generate VPN
app.get('/api/vpn', authenticateToken, (req, res) => {
    const user_id = req.user.id;
    const scriptPath = '/opt/xack/orchestrator/network/generate-vpn.sh';
    const command = `/bin/bash ${scriptPath} ${user_id}`;

    console.log(`Generating VPN for user ${user_id}`);

    exec(command, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
            console.error(`VPN Gen error: ${error.message}`);
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({ error: 'Failed to generate VPN configuration' });
        }

        // stdout contains the .ovpn content
        res.setHeader('Content-Type', 'application/x-openvpn-profile');
        res.setHeader('Content-Disposition', `attachment; filename="xack-user-${user_id}.ovpn"`);
        res.send(stdout);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 XACK Backend API running on port ${PORT}`);
});
