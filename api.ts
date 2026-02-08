const API_URL = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || 'http://localhost:3001') : '';

export const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const api = {
    get: async (endpoint: string) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: getAuthHeader()
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API Request failed');
        }
        return response.json();
    },
    post: async (endpoint: string, body: any) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API Request failed');
        }
        return response.json();
    }
};
