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
const VPN_API_URL = 'http://localhost:51821/api/wireguard'; // Localhost access for API

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

    try {
        // 1. Get Challenge Type & Config
        const { data: challenge, error: challengeError } = await supabase
            .from('challenges')
            .select('type, internal_port, config')
            .eq('id', machineId)
            .single();

        if (challengeError || !challenge) {
            return res.status(404).json({ error: 'Challenge not found in DB' });
        }

        const machinePath = findMachinePath(machineId);
        if (!machinePath) {
            return res.status(404).json({ error: `Machine files not found for ${machineId}` });
        }

        // ==========================================
        // STRATEGY: VM (Vagrant)
        // ==========================================
        if (challenge.type === 'vm') {
            console.log(`[START-MACHINE] Detected VM type for ${machineId}`);

            const vagrantFile = path.join(machinePath, 'Vagrantfile');
            if (!fs.existsSync(vagrantFile)) {
                return res.status(500).json({ error: 'Vagrantfile not found' });
            }

            // A) Insert 'starting' status immediately
            await supabase
                .from('active_instances')
                .upsert({
                    user_id: userId,
                    challenge_id: machineId,
                    status: 'starting', // Frontend should poll for this
                    ip_address: null,
                    docker_container_id: `vagrant_${machineId}_${userId}`,
                    expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
                }, { onConflict: 'user_id' });

            // B) Return Response IMMEDIATELY to split the HTTP request
            res.json({
                status: 'starting',
                message: 'VM provisioning has started in background. Please wait.'
            });

            // C) Start Vagrant in Background (Fire and Forget from HTTP perspective)
            console.log(`[START-MACHINE] Executing 'vagrant up' in ${machinePath} (Background)`);
            const upCmd = `vagrant up`; // Consider adding timeout handling if needed

            exec(upCmd, { cwd: machinePath }, async (error, stdout, stderr) => {
                if (error) {
                    console.error(`[START-MACHINE] Vagrant Up Error: ${error}`);
                    console.error(`[START-MACHINE] Stderr: ${stderr}`);

                    // Update DB to failed or remove instance
                    await supabase
                        .from('active_instances')
                        .delete()
                        .eq('user_id', userId)
                        .eq('challenge_id', machineId);

                    return;
                }

                console.log(`[START-MACHINE] Vagrant up successful`);

                // Determine IP - Default for BlackDomain/ADAZ
                let vmIp = '10.10.10.10';
                if (challenge.config && challenge.config.static_ip) {
                    vmIp = challenge.config.static_ip;
                }
                const vmPort = challenge.internal_port || 80;

                // Update DB to 'running'
                const { error: upsertError } = await supabase
                    .from('active_instances')
                    .upsert({
                        user_id: userId,
                        challenge_id: machineId,
                        status: 'running',
                        ip_address: vmIp,
                        docker_container_id: `vagrant_${machineId}_${userId}`,
                        flag_user: 'xack{user_flag_in_files}',
                        expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
                    }, { onConflict: 'user_id' });

                if (upsertError) {
                    console.error("Failed to update instance to RUNNING:", upsertError);
                } else {
                    console.log(`[START-MACHINE] VM ${machineId} is now RUNNING!`);
                }
            });

            return;
        }

        // ==========================================
        // STRATEGY: DOCKER
        // ==========================================
        // fallback to existing Docker logic
        const composeFile = getDockerComposePath(machinePath);
        if (!composeFile) {
            return res.status(500).json({ error: 'docker-compose.yml not found' });
        }

        const composeCwd = path.dirname(composeFile);
        const projectName = `${machineId.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}_${userId.substring(0, 8)}`;
        const userFlag = `xack{${uuidv4().substring(0, 8)}}`;

        console.log(`Starting machine ${machineId} for user ${userId} with project ${projectName} in ${composeCwd}`);

        const upCmd = `docker-compose -f "${composeFile}" -p "${projectName}" up -d`;
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
                if (stderr.includes('error during connect') || stderr.includes('pipe')) {
                    return res.status(503).json({
                        error: 'Docker is unreachable',
                        details: 'Please ensure Docker Desktop is running and healthy.'
                    });
                }
                return res.status(500).json({ error: 'Failed to start machine', details: stderr });
            }

            const psCmd = `docker-compose -f "${composeFile}" -p "${projectName}" ps -q`;
            exec(psCmd, { cwd: composeCwd, env }, (psErr, psStdout, psStderr) => {
                if (psErr || !psStdout.trim()) {
                    return res.status(500).json({ error: 'Failed to find started container' });
                }
                const containerId = psStdout.trim().split('\n')[0].trim();

                const inspectCmd = `docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" ${containerId}`;
                exec(inspectCmd, async (inspErr, inspStdout, inspStderr) => {
                    if (inspErr) {
                        return res.status(500).json({ error: 'Failed to inspect machine IP' });
                    }
                    const realIp = inspStdout.trim();
                    const internalPort = challenge.internal_port || 8888;

                    const instanceData = {
                        status: 'running',
                        ip: realIp,
                        port: internalPort,
                        containerId: containerId,
                        startTime: new Date().toISOString()
                    };

                    await supabase
                        .from('active_instances')
                        .upsert({
                            user_id: userId,
                            challenge_id: machineId,
                            status: 'running',
                            ip_address: instanceData.ip,
                            docker_container_id: containerId,
                            flag_user: userFlag,
                            expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
                        }, { onConflict: 'user_id' });

                    res.json(instanceData);
                });
            });
        });

    } catch (err) {
        console.error("Start Machine Global Error:", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
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

        if (flags) {
            for (const [key, value] of Object.entries(flags)) {
                if (submittedFlag === value) {
                    type = key;
                    break;
                }
            }
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
app.post('/api/stop-machine', async (req, res) => {
    const { machineId, userId } = req.body;

    const machinePath = findMachinePath(machineId);
    if (!machinePath) {
        return res.status(404).json({ error: 'Machine not found' });
    }

    // 1. Check Challenge Type from DB (Optional but good for cleanliness)
    // For stop, we can check if Vagrantfile exists or if Docker
    // Let's trust structure.

    const vagrantFile = path.join(machinePath, 'Vagrantfile');
    const isVagrant = fs.existsSync(vagrantFile);

    if (isVagrant) {
        console.log(`[STOP-MACHINE] Suspending VM ${machineId}... (Warm Standby)`);

        // Use SUSPEND instead of HALT for fast resume
        const stopCmd = 'vagrant suspend';

        exec(stopCmd, { cwd: machinePath }, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Vagrant Suspend Error: ${error}`);
                // If suspend fails, try halt? Just log for now.
            } else {
                console.log(`[STOP-MACHINE] VM Suspended successfully.`);
            }

            // Allow DB update even if error to ensure UI reflects 'offline'
            await supabase.from('active_instances').delete().eq('user_id', userId).eq('challenge_id', machineId);
            res.json({ status: 'stopped' });
        });
        return;
    }

    // Docker Logic
    const composeFile = getDockerComposePath(machinePath);
    if (!composeFile) {
        // If it's not vagrant and not docker, what is it?
        return res.status(500).json({ error: 'No execution method found (Vagrant/Docker)' });
    }

    // Reconstruct Project Name
    const projectName = `${machineId.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}_${userId.substring(0, 8)}`;
    const composeCwd = path.dirname(composeFile);

    const cmd = `docker-compose -f "${composeFile}" -p "${projectName}" down`;
    exec(cmd, { cwd: composeCwd }, async (error, stdout, stderr) => {
        if (error) {
            console.error(`Exec error: ${error}`);
            return res.status(500).json({ error: 'Failed to stop' });
        }
        await supabase.from('active_instances').delete().eq('user_id', userId).eq('challenge_id', machineId);
        res.json({ status: 'stopped' });
    });
});

// Endpoint to HARD RESET a machine
app.post('/api/reset-machine', async (req, res) => {
    const { machineId, userId } = req.body;
    console.log(`[RESET-MACHINE] Request for ${machineId}`);

    const machinePath = findMachinePath(machineId);
    if (!machinePath) return res.status(404).json({ error: 'Machine not found' });

    // Check Type
    const vagrantFile = path.join(machinePath, 'Vagrantfile');
    const isVagrant = fs.existsSync(vagrantFile);

    if (isVagrant) {
        // 1. Mark as RESETTING in DB (optional, helps UI polling)
        // Actually, we just want to kill it.

        // 2. Destroy
        console.log(`[RESET-MACHINE] Destroying VM (Force)...`);
        exec('vagrant destroy -f', { cwd: machinePath }, async (err, stdout, stderr) => {
            if (err) console.error(`Destroy error: ${err}`);

            // 3. Clean DB
            await supabase.from('active_instances').delete().eq('user_id', userId).eq('challenge_id', machineId);

            // 4. Return success (Frontend will call Start after this)
            res.json({ status: 'reset_complete', message: 'VM Destroyed' });
        });
        return;
    }

    // Docker Reset = Stop + Start (managed by frontend usually, or we can explicit down here)
    // Reuse stop logic
    const composeFile = getDockerComposePath(machinePath);
    if (composeFile) {
        const projectName = `${machineId.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}_${userId.substring(0, 8)}`;
        const composeCwd = path.dirname(composeFile);
        exec(`docker-compose -f "${composeFile}" -p "${projectName}" down`, { cwd: composeCwd }, async () => {
            await supabase.from('active_instances').delete().eq('user_id', userId).eq('challenge_id', machineId);
            res.json({ status: 'reset_complete' });
        });
        return;
    }

    res.status(500).json({ error: 'Unsupported type for reset' });
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
