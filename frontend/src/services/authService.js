import { apiCall } from './api';

export const authService = {
    async login(credentials) {
        return apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    async register(userData) {
        return apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async refreshToken(refreshToken) {
        return apiCall('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken })
        });
    }
};