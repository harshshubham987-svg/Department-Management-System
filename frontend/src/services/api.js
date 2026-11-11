const API_BASE_URL = 'https://department-management-system-ulhw.onrender.com/api';

export const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('accessToken');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const contentType = response.headers.get("content-type");

        let data = null;
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            try {
                data = text ? JSON.parse(text) : null;
            } catch (e) {
                data = { error: text || response.statusText };
            }
        }

        if (!response.ok) {
            throw new Error(data?.error || response.statusText || 'API request failed');
        }

        return data;
    } catch (err) {
        console.error(`API Error [${endpoint}]:`, err.message);
        throw err;
    }
};