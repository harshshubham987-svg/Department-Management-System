import { apiCall } from './api';

export const userService = {
    // Get all users (supports optional filters like ?role=Teacher)
    async getAllUsers(queryString = '') {
        return apiCall(`/users${queryString}`);
    },

    // Get specific user profile by ID
    async getUserById(userId) {
        return apiCall(`/users/${userId}`);
    },

    // Get admin dashboard statistics
    async getAdminDashboardStats() {
        return apiCall('/admin/dashboard-stats');
    }
};