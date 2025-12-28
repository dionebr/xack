const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const app = express();
const PORT = 3001;

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Path to labs directory (Root of categories)
const LABS_DIR = path.join(__dirname, '../labs');

// Helper to find machine directory recursively (or just 1 level deep)
function findMachinePath(machineId) {
    // 1. Direct check (if machineId already includes category or is flat)
    let candidatePath = path.join(LABS_DIR, machineId);
    if (fs.existsSync(candidatePath)) return candidatePath;

    // 2. Search in 1st level subdirectories (Web, Crypto, docker, etc.)
    try {
        const categories = fs.readdirSync(LABS_DIR).filter(item => {
            return fs.statSync(path.join(LABS_DIR, item)).isDirectory();
        });

        for (const category of categories) {
            candidatePath = path.join(LABS_DIR, category, machineId);
            if (fs.existsSync(candidatePath)) {
                return candidatePath;
            }
        }
    } catch (e) {
        console.error("Error finding machine path:", e);
    }

    return null;
}

// Helper to finding docker-compose.yml
function getDockerComposePath(machinePath) {
    const rootPath = path.join(machinePath, 'docker-compose.yml');
    const envPath = path.join(machinePath, 'env', 'docker-compose.yml');

    if (fs.existsSync(rootPath)) return rootPath;
    if (fs.existsSync(envPath)) return envPath;

    return null;
}

const activeInstances = new Map();
const VPN_API_URL = 'http://192.168.15.103:51821/api/wireguard'; // Updated IP

// Helper to get or create VPN client
async function getOrCreateVpnClient(userId) {
    const clientName = `user_${userId}`;

    try {
        // 1. List clients
        const { data: clients } = await axios.get(`${VPN_API_URL}/client`);

        let client = clients.find(c => c.name === clientName);

        // 2. If not exists, create
        if (!client) {
            console.log(`Creating VPN client for ${clientName}`);
            await axios.post(`${VPN_API_URL}/client`, { name: clientName });

            // Re-fetch clients to get the ID of the newly created client
            const { data: updatedClients } = await axios.get(`${VPN_API_URL}/client`);
            client = updatedClients.find(c => c.name === clientName);

            if (!client) throw new Error("Failed to retrieve created client");
        }

        return client; // Should contain id
    } catch (error) {
        console.error("VPN API Error:", error.message);
        throw error;
    }
}

// Endpoint to get VPN Config
app.get('/api/vpn/config', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    try {
        const client = await getOrCreateVpnClient(userId);

        // 3. Download Config
        // Note: wg-easy returns the config file content directly on this endpoint
        const configRes = await axios.get(`${VPN_API_URL}/client/${client.id}/configuration`, {
            responseType: 'text'
        });

        res.header('Content-Type', 'text/plain');
        res.header('Content-Disposition', `attachment; filename="xack_vpn.conf"`);
        res.send(configRes.data);

    } catch (error) {
        console.error("Failed to generate VPN config:", error);
        res.status(500).json({ error: 'Failed to generate VPN config' });
    }
});

// Endpoint to start a machine
app.post('/api/start-machine', async (req, res) => {
    const { machineId, userId } = req.body;

    console.log(`[START-MACHINE] Request received: machineId=${machineId}, userId=${userId}`);

    if (!machineId || !userId) {
        console.log('[START-MACHINE] Missing parameters');
        return res.status(400).json({ error: 'Missing machineId or userId' });
    }

    const machinePath = findMachinePath(machineId);

    // Security check
    if (!machinePath) {
        return res.status(404).json({ error: `Machine ${machineId} not found in any category` });
    }

    const composeFile = getDockerComposePath(machinePath);
    if (!composeFile) {
        return res.status(500).json({ error: 'docker-compose.yml not found for this machine' });
    }

    // Determine CWD for docker-compose (should be where the file is)
    const composeCwd = path.dirname(composeFile);

    // Generate unique project name (used as container reference)
    // Docker Compose project names must be lowercase
    const projectName = `${machineId.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}_${userId.substring(0, 8)}`;
    const userFlag = `xack{${uuidv4().substring(0, 8)}}`;

    console.log(`Starting machine ${machineId} for user ${userId} with project ${projectName} in ${composeCwd}`);

    // 1. Start with Project Name (-p)
    const upCmd = `docker-compose -f "${composeFile}" -p "${projectName}" up -d`;

    // Env vars passed to compose (still useful if the YAML uses them)
    const env = {
        ...process.env,
        USER_FLAG: userFlag,
        CONTAINER_NAME: projectName,
        HOST_PORT: '8081'
    };

    exec(upCmd, { cwd: composeCwd, env }, (error, stdout, stderr) => {
        console.log(`[START-MACHINE] Docker compose up executed`);
        if (error) {
            console.error(`[START-MACHINE] Up Error: ${error}`);
            console.error(`[START-MACHINE] Stderr: ${stderr}`);

            // Check for common Docker connectivity issues
            if (stderr.includes('error during connect') || stderr.includes('pipe')) {
                return res.status(503).json({
                    error: 'Docker is unreachable',
                    details: 'Please ensure Docker Desktop is running and healthy.'
                });
            }

            return res.status(500).json({ error: 'Failed to start machine', details: stderr });
        }

        // 2. Find Container ID using the same project name
        const psCmd = `docker-compose -f "${composeFile}" -p "${projectName}" ps -q`;

        exec(psCmd, { cwd: composeCwd, env }, (psErr, psStdout, psStderr) => {
            if (psErr || !psStdout.trim()) {
                console.error(`PS Error: ${psErr || 'No container found'}`);
                return res.status(500).json({ error: 'Failed to find started container' });
            }

            // docker-compose ps -q returns one ID per line. We take the first one (assuming 1 main service)
            // If there are multiple, we might need a strategy, but usually the main challenge is relevant.
            // For now, take the first valid ID.
            const containerId = psStdout.trim().split('\n')[0].trim();
            console.log(`Found Container ID: ${containerId}`);

            // 3. Inspect by ID
            const inspectCmd = `docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" ${containerId}`;

            exec(inspectCmd, async (inspErr, inspStdout, inspStderr) => {
                if (inspErr) {
                    console.error(`Inspection error: ${inspErr}`);
                    return res.status(500).json({ error: 'Failed to inspect machine IP' });
                }

                const realIp = inspStdout.trim();
                console.log(`Container ${containerId} has IP: ${realIp}`);

                // Fetch Internal Port from DB
                let internalPort = 8888;
                const { data: challengeData } = await supabase
                    .from('challenges')
                    .select('internal_port')
                    .eq('id', machineId)
                    .single();

                if (challengeData && challengeData.internal_port) {
                    internalPort = challengeData.internal_port;
                }

                const instanceData = {
                    status: 'running',
                    ip: realIp,
                    port: internalPort,
                    containerId: containerId, // Actual Docker ID
                    startTime: new Date().toISOString()
                };

                // Persist Project Name so we can stop it later
                // We reuse docker_container_id field to store the PROJECT NAME (or handle it in stop)
                // Actually, let's store the Project Name in docker_container_id for simplicity in stop-machine reconstruction,
                // OR we just reconstruct it same way using userId + machineId.
                // Let's store the Project Name? No, store the info needed.
                // The 'stop-machine' only receives machineId and userId, so we can REGENERATE the project name without DB.

                const { error: dbError } = await supabase
                    .from('active_instances')
                    .upsert({
                        user_id: userId,
                        challenge_id: machineId,
                        status: 'running',
                        ip_address: instanceData.ip,
                        docker_container_id: containerId, // Storing actual ID for reference
                        flag_user: userFlag,
                        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
                    }, { onConflict: 'user_id' });

                if (dbError) {
                    console.error("Failed to save instance to DB:", dbError);
                }

                res.json(instanceData);
            });
        });
    });
});

// Endpoint to submit flag
app.post('/api/submit-flag', async (req, res) => {
    const { userId, machineId, flag } = req.body;

    console.log("Submit Flag Request:", { userId, machineId, flag });

    if (!userId || !machineId || !flag) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        console.log('[SUBMIT-FLAG] Fetching challenge data...');

        // 1. Get Challenge Flags from challenges table
        const { data: challenge, error: challengeError } = await supabase
            .from('challenges')
            .select('config, points')
            .eq('id', machineId)
            .single();

        if (challengeError || !challenge) {
            console.error('[SUBMIT-FLAG] Challenge not found:', challengeError);
            return res.status(404).json({ error: 'Challenge not found' });
        }

        console.log('[SUBMIT-FLAG] Challenge config:', challenge.config);

        // 2. Validate Flag
        let type = null;
        const submittedFlag = flag.trim();
        const flags = challenge.config?.flags || {};

        if (flags.user && submittedFlag === flags.user) {
            type = 'user';
        } else if (flags.root && submittedFlag === flags.root) {
            type = 'root';
        }

        if (!type) {
            console.log('[SUBMIT-FLAG] Incorrect flag submitted');
            return res.json({ success: false, message: 'Incorrect Flag' });
        }

        console.log(`[SUBMIT-FLAG] Correct ${type} flag!`);

        // 3. Register Solve (Check duplicate is handled by DB constraint)
        const points = type === 'root' ? (challenge.points || 100) : Math.floor((challenge.points || 100) / 2);

        const { error: solveError } = await supabase
            .from('solves')
            .insert({
                user_id: userId,
                challenge_id: machineId,
                flag_type: type,
                submitted_flag: flag,
                points_awarded: points
            });

        if (solveError) {
            console.error('[SUBMIT-FLAG] Solve error:', solveError);
            if (solveError.code === '23505') { // Unique violation
                return res.json({ success: true, message: 'Correct! (Already solved)', firstBlood: false });
            }
            console.error(solveError);
            return res.status(500).json({ error: 'Database error recording solve' });
        }

        // 4. Update Score (Optional Trigger on DB, but can do here if needed)
        // ...

        return res.json({ success: true, message: 'Flag Captured!', points, type });

    } catch (e) {
        console.error("Submit error:", e);
        res.status(500).json({ error: 'Server error' });
    }
});

// Endpoint to stop a machine
app.post('/api/stop-machine', (req, res) => {
    const { machineId, userId } = req.body;

    // Use helper to find path
    const machinePath = findMachinePath(machineId);

    if (!machinePath) {
        return res.status(404).json({ error: 'Machine not found' });
    }

    // Reconstruct Project Name
    const projectName = `${machineId.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}_${userId.substring(0, 8)}`;

    const composeFile = getDockerComposePath(machinePath);
    if (!composeFile) {
        return res.status(500).json({ error: 'docker-compose.yml not found' });
    }
    const composeCwd = path.dirname(composeFile);

    // Logic to stop using Project Name
    const cmd = `docker-compose -f "${composeFile}" -p "${projectName}" down`;

    exec(cmd, { cwd: composeCwd }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Exec error: ${error}`);
            return res.status(500).json({ error: 'Failed to stop' });
        }
        res.json({ status: 'stopped' });
    });
});

// Endpoint to get machine walkthrough
app.get('/api/machine/:id/walkthrough', (req, res) => {
    const { id } = req.params;
    const machinePath = findMachinePath(id);

    if (!machinePath) {
        return res.status(404).json({ error: 'Machine not found' });
    }

    const walkthroughPath = path.join(machinePath, 'walkthrough.md');
    if (!fs.existsSync(walkthroughPath)) {
        return res.status(404).json({ error: 'Walkthrough not found for this machine' });
    }

    try {
        const content = fs.readFileSync(walkthroughPath, 'utf8');
        res.json({ content });
    } catch (e) {
        console.error("Error reading walkthrough:", e);
        res.status(500).json({ error: 'Failed to read walkthrough' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
