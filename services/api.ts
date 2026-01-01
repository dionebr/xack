
import { CONFIG } from '../config';

export const api = {
    async startMachine(machineId: string, userId: string) {
        const response = await fetch(`${CONFIG.API_URL}/start-machine`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ machineId, userId }),
        });

        if (!response.ok) {
            throw new Error('Failed to start machine');
        }

        return response.json();
    },

    async stopMachine(machineId: string, userId: string) {
        const response = await fetch(`${CONFIG.API_URL}/stop-machine`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ machineId, userId }),
        });

        if (!response.ok) {
            throw new Error('Failed to stop machine');
        }

        return response.json();
    },

    async resetMachine(machineId: string, userId: string) {
        const response = await fetch(`${CONFIG.API_URL}/reset-machine`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ machineId, userId }),
        });

        if (!response.ok) {
            throw new Error('Failed to reset machine');
        }

        return response.json();
    },

    async submitFlag(machineId: string, userId: string, flag: string) {
        const response = await fetch(`${CONFIG.API_URL}/submit-flag`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ machineId, userId, flag }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to submit flag');
        }

        return response.json();
    }
};
