import { apiCall } from './api';

export const departmentService = {
    async getAllDepartments() {
        return apiCall('/departments');
    },

    async getDepartmentById(deptId) {
        return apiCall(`/departments/${deptId}`);
    },

    async createDepartment(deptData) {
        return apiCall('/departments', {
            method: 'POST',
            body: JSON.stringify(deptData) // Ensure object is converted to JSON string
        });
    },

    async updateDepartment(deptId, deptData) {
        return apiCall(`/departments/${deptId}`, {
            method: 'PUT',
            body: JSON.stringify(deptData) // Ensure object is converted to JSON string
        });
    }
};