import { apiCall } from './api';

export const studentService = {
    async getStudentEnrollments(studentId) {
        return apiCall(`/enrollments/student/${studentId}`);
    },

    async dropCourse(enrollmentId) {
        return apiCall(`/enrollments/${enrollmentId}`, {
            method: 'DELETE'
        });
    },

    async getAllAvailableCourses() {
        return apiCall('/courses');
    },

    async enrollInCourse(courseId) {
        return apiCall('/enrollments', {
            method: 'POST',
            body: JSON.stringify({ course_id: courseId })
        });
    }
};