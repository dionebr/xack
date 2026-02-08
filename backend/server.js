const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const { z } = require('zod');
const { exec } = require('child_process');
require('dotenv').config();

const app = express();
app.set('trust proxy', true); // Melhorado: confia em proxies (Nginx)

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const DB_HOST = process.env.DB_HOST || '127.0.0.1';

if (!JWT_SECRET) {
    console.error('❌ CRITICAL ERROR: JWT_SECRET is not defined in .env');
    process.exit(1);
}

// Winston Logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console()
    ]
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiters
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: { error: 'Too many authentication attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    // Trust proxy - use leftmost IP from X-Forwarded-For
    validate: { trustProxy: false }
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per minute
    message: { error: 'Global rate limit exceeded.' },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false }
});

app.use('/api/', apiLimiter);
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

// MySQL Connection Pool
const pool = mysql.createPool({
    host: DB_HOST,
    user: process.env.DB_USER || 'xack_user',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'xack_platform',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection()
    .then(conn => {
        logger.info('✅ Database connected successfully');
        conn.release();
    })
    .catch(err => {
        logger.error('❌ Database connection failed:');
    });

// JWT Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
}

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const [existing] = await pool.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existing.length > 0) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        const token = jwt.sign({ id: result.insertId, username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: result.insertId, username, email } });
    } catch (error) {
        logger.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        logger.info(`User logged in: ${username}`);
        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get Machines
app.get('/api/machines', authenticateToken, async (req, res) => {
    try {
        const [machines] = await pool.query('SELECT * FROM machines WHERE is_active = 1');
        res.json(machines);
    } catch (error) {
        logger.error('Get machines error:', error);
        res.status(500).json({ error: 'Failed to fetch machines' });
    }
});

// Get User Profile & Stats
app.get('/api/user/stats', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, username, email, avatar_url, rank_title, total_xp, level, bio, is_admin FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) return res.status(404).json({ error: 'User not found' });

        const [activities] = await pool.query(
            'SELECT * FROM activities WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
            [req.user.id]
        );

        res.json({ user: users[0], activities });
    } catch (error) {
        logger.error('Get user stats error:', error);
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
});

// Submit Flag
app.post('/api/submit-flag', authenticateToken, async (req, res) => {
    try {
        const { machine_id, flag } = req.body;
        const [flags] = await pool.query('SELECT * FROM flags WHERE machine_id = ? AND flag_value = ?', [machine_id, flag]);

        if (flags.length === 0) return res.status(400).json({ error: 'Invalid flag' });

        const [existing] = await pool.query(
            'SELECT * FROM user_flags WHERE user_id = ? AND flag_id = ?',
            [req.user.id, flags[0].id]
        );

        if (existing.length > 0) return res.status(400).json({ error: 'Flag already submitted' });

        await pool.query('INSERT INTO user_flags (user_id, flag_id) VALUES (?, ?)', [req.user.id, flags[0].id]);
        res.json({ success: true, points: flags[0].points });
    } catch (error) {
        logger.error('Submit flag error:', error);
        res.status(500).json({ error: 'Failed to submit flag' });
    }
});

// Machine Mapping
const MACHINE_MAP = {
    1: { slug: 'reader', category: 'web' },
    2: { slug: 'vault-x', category: 'web' },
    3: { slug: 'artemis-i', category: 'web' }
};

// Spawn Machine
app.post('/api/spawn', authenticateToken, (req, res) => {
    const { machine_id } = req.body;
    if (!machine_id || !MACHINE_MAP[machine_id]) return res.status(404).json({ error: 'Machine not found' });

    const { slug, category } = MACHINE_MAP[machine_id];
    const scriptPath = '/opt/xack/orchestrator/scripts/start-machine.sh';
    const command = `/bin/bash ${scriptPath} ${slug} ${req.user.id} ${category}`;

    logger.info(`Spawning machine ${slug} for user ${req.user.username}`);

    exec(command, (error) => {
        if (error) {
            logger.error(`Spawn error: ${error.message}`);
            return res.status(500).json({ error: 'Failed to spawn machine' });
        }
        res.json({ status: 'spawned', ip: '10.10.11.50' });
    });
});

app.post('/api/terminate', authenticateToken, (req, res) => {
    const { machine_id } = req.body;
    if (!machine_id || !MACHINE_MAP[machine_id]) return res.status(404).json({ error: 'Machine not found' });

    const { slug } = MACHINE_MAP[machine_id];
    const scriptPath = '/opt/xack/orchestrator/scripts/stop-machine.sh';
    const command = `/bin/bash ${scriptPath} ${slug} ${req.user.id}`;

    logger.info(`Terminating machine ${slug} for user ${req.user.username}`);

    exec(command, (error) => {
        if (error) {
            logger.error(`Terminate error: ${error.message}`);
            return res.status(500).json({ error: 'Failed' });
        }
        res.json({ status: 'terminated' });
    });
});

// VPN Configuration Endpoint
app.get('/api/vpn', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const scriptPath = '/opt/xack/orchestrator/network/generate-vpn.sh';

        logger.info(`Generating VPN config for user ${req.user.username}`);

        exec(`/bin/bash ${scriptPath} ${userId}`, (error, stdout, stderr) => {
            if (error) {
                logger.error('VPN generation error:', { error: error.message, stderr });
                return res.status(500).json({ error: 'Failed to generate VPN configuration' });
            }

            // Set headers for file download
            res.setHeader('Content-Type', 'application/x-openvpn-profile');
            res.setHeader('Content-Disposition', `attachment; filename="xack-user-${userId}.ovpn"`);
            res.send(stdout);
        });
    } catch (error) {
        logger.error('VPN endpoint error:', error);
        res.status(500).json({ error: 'Failed to process VPN request' });
    }
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Start Server
app.listen(PORT, () => {
    logger.info(`🚀 XACK Backend API running on port ${PORT}`);
});
