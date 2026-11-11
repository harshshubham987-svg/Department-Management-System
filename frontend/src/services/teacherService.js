import { apiCall } from './api';

export const teacherService = {
    async getAssignedCourses() {
        return apiCall('/courses');
    },

    async getEnrollments() {
        return apiCall('/enrollments');
    },

    async updateGrade(enrollmentId, gradeData) {
        return apiCall(`/enrollments/${enrollmentId}/grade`, {
            method: 'PUT',
            body: JSON.stringify(gradeData)
        });
    },

    // frontend/src/services/teacherService.js mein yeh update karo:
    async updateAttendance(enrollmentId, attendanceData) {
        // Backend ka existing updateGrade/Attendance endpoint use karo
        return apiCall(`/enrollments/${enrollmentId}/grade`, {
            method: 'PUT',
            body: JSON.stringify(attendanceData) // e.g. { attendance_percentage: 85 }
        });
    }
};