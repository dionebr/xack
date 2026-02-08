require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const { z } = require('zod');

const app = express();
app.set('trust proxy', true); // Melhorado: confia em proxies (Nginx)

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const DB_HOST = process.env.DB_HOST || '127.0.0.1';

console.log(`🔍 DEBUG: Iniciando servidor na porta ${PORT}`);
console.log(`🔍 DEBUG: DB_HOST configurado como: ${DB_HOST}`);
console.log(`🔍 DEBUG: DB_PASSWORD length: ${process.env.DB_PASSWORD?.length || 0}`);
console.log(`🔍 DEBUG: DB_PASSWORD first 5 chars: ${process.env.DB_PASSWORD?.substring(0, 5) || 'UNDEFINED'}`);

if (!JWT_SECRET) {
    console.error('❌ CRITICAL ERROR: JWT_SECRET is not defined in .env');
    process.exit(1);
}

// Logger Setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
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
        logger.error('❌ Database connection failed:', err.message);
    });

// ============ SCHEMAS ============
const loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(6)
});

const submitFlagSchema = z.object({
    flag: z.string().regex(/^XACK\{[a-f0-9]{32}\}$/i),
    machine_id: z.number().or(z.string())
});

// ============ AUTHENTICATION ENDPOINTS ============

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const [existing] = await pool.query(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, password_hash]
        );

        const token = jwt.sign(
            { id: result.insertId, username, email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        logger.info(`User registered: ${username}`);
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: result.insertId, username, email }
        });

    } catch (error) {
        logger.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const result = loginSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        const { username, password } = result.data;

        const [users] = await pool.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        logger.info(`User logged in: ${user.username}`);
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
        logger.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ============ MIDDLEWARE ============

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
}

// ============ CORE API ENDPOINTS ============

// Get All Machines
app.get('/api/machines', authenticateToken, async (req, res) => {
    try {
        const [machines] = await pool.query(`
            SELECT m.*, 
            (SELECT COUNT(*) FROM user_submissions WHERE flag_id IN (SELECT id FROM flags WHERE machine_id = m.id) AND is_correct = TRUE) as solves,
            (SELECT progress FROM user_machine_status WHERE user_id = ? AND machine_id = m.id) as progress
            FROM machines m
            WHERE is_active = TRUE
        `, [req.user.id]);

        res.json({ machines });
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
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

// Global Hacktivity
app.get('/api/hacktivity', async (req, res) => {
    try {
        const [hacktivity] = await pool.query(`
            SELECT us.id, u.username as user, u.avatar_url as avatar, 
                   m.name as machine, f.type as flag_type, f.points, us.created_at
            FROM user_submissions us
            JOIN users u ON us.user_id = u.id
            JOIN flags f ON us.flag_id = f.id
            JOIN machines m ON f.machine_id = m.id
            WHERE us.is_correct = TRUE
            ORDER BY us.created_at DESC
            LIMIT 15
        `);
        res.json({ hacktivity });
    } catch (error) {
        logger.error('Hacktivity error:', error);
        res.status(500).json({ error: 'Failed to fetch hacktivity' });
    }
});

// ============ FLAG SUBMISSION ============

app.post('/api/submit-flag', authenticateToken, async (req, res) => {
    try {
        const validation = submitFlagSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: 'Invalid flag format' });
        }

        const { flag, machine_id } = validation.data;
        const flagHash = flag.match(/\{([a-f0-9]{32})\}/i)[1].toLowerCase();

        const [flags] = await pool.query(
            'SELECT * FROM flags WHERE machine_id = ? AND LOWER(flag_hash) = ?',
            [machine_id, flagHash]
        );

        if (flags.length === 0) {
            await pool.query(
                'INSERT INTO activities (user_id, action_text, points_change) VALUES (?, ?, ?)',
                [req.user.id, `Failed submission on machine #${machine_id}`, '0']
            );
            return res.status(400).json({ error: 'Incorrect flag' });
        }

        const correctFlag = flags[0];

        const [existing] = await pool.query(
            'SELECT * FROM user_submissions WHERE user_id = ? AND flag_id = ? AND is_correct = TRUE',
            [req.user.id, correctFlag.id]
        );

        if (existing.length > 0) return res.status(409).json({ error: 'Flag already submitted' });

        await pool.query(
            'INSERT INTO user_submissions (user_id, flag_id, submitted_flag, is_correct) VALUES (?, ?, ?, TRUE)',
            [req.user.id, correctFlag.id, flag]
        );

        await pool.query(
            'UPDATE users SET total_xp = total_xp + ? WHERE id = ?',
            [correctFlag.points, req.user.id]
        );

        await pool.query(
            'INSERT INTO activities (user_id, action_text, points_change) VALUES (?, ?, ?)',
            [req.user.id, `Captured ${correctFlag.type} flag on ${machine_id}`, `+${correctFlag.points}`]
        );

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
            points: correctFlag.points
        });

    } catch (error) {
        logger.error('Submit flag error:', error);
        res.status(500).json({ error: 'Flag submission failed' });
    }
});

// ============ ORCHESTRATION ============

const { exec } = require('child_process');
const MACHINE_MAP = {
    '1': { slug: 'reader', category: 'web' },
    '3': { slug: 'artemis-i', category: 'web' }
};

app.post('/api/spawn', authenticateToken, (req, res) => {
    const { machine_id } = req.body;
    if (!machine_id || !MACHINE_MAP[machine_id]) {
        return res.status(404).json({ error: 'Machine not configured for auto-spawn' });
    }

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

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => logger.info(`🚀 XACK Backend API running on port ${PORT}`));
