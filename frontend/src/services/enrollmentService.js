import { apiCall } from './api';

export const enrollmentService = {
    // Get all enrollments (or admin view)
    async getAllEnrollments() {
        return apiCall('/enrollments');
    },

    // Get enrollments by student ID
    async getEnrollmentsByStudent(studentId) {
        return apiCall(`/enrollments/student/${studentId}`);
    },

    // Create new enrollment
    async createEnrollment(enrollmentData) {
        return apiCall('/enrollments', {
            method: 'POST',
            body: JSON.stringify(enrollmentData)
        });
    },

    // Update grade for an enrollment
    async updateGrade(enrollmentId, gradeData) {
        return apiCall(`/enrollments/${enrollmentId}/grade`, {
            method: 'PUT',
            body: JSON.stringify(gradeData)
        });
    },

    // Delete / Cancel enrollment
    async deleteEnrollment(enrollmentId) {
        return apiCall(`/enrollments/${enrollmentId}`, {
            method: 'DELETE'
        });
    }
};