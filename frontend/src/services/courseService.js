import { apiCall } from './api';

export const courseService = {
    async getAllCourses() {
        return apiCall('/courses');
    },

    async createCourse(courseData) {
        return apiCall('/courses', {
            method: 'POST',
            body: JSON.stringify(courseData)
        });
    },

    async updateCourse(courseId, courseData) {
        return apiCall(`/courses/${courseId}`, {
            method: 'PUT',
            body: JSON.stringify(courseData)
        });
    },

    async deleteCourse(courseId) {
        return apiCall(`/courses/${courseId}`, {
            method: 'DELETE'
        });
    }
};