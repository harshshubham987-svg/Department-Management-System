import { apiCall } from './api';

export const adminService = {
    async getDashboardStats() {
        return apiCall('/admin/dashboard-stats');
    },

    async getApiLogs() {
        return apiCall('/admin/api-logs');
    }
};