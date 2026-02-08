export const API_URL = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || 'http://localhost:3001') : '';

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
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            throw new Error('Session expired');
        }
        if (!response.ok) {
            const error = await response.json();
            const errorMessage = error.details ? `${error.error}: ${error.details} ${error.sqlMessage ? `(SQL: ${error.sqlMessage})` : ''}` : (error.error || 'API Request failed');
            throw new Error(errorMessage);
        }
        return response.json();
    },
    post: async (endpoint: string, body: any) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(body)
        });
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            throw new Error('Session expired');
        }
        if (!response.ok) {
            const error = await response.json();
            const errorMessage = error.details ? `${error.error}: ${error.details} ${error.sqlMessage ? `(SQL: ${error.sqlMessage})` : ''}` : (error.error || 'API Request failed');
            throw new Error(errorMessage);
        }
        return response.json();
    }
};
