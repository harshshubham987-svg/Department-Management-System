const courseService = require('../services/courseService');

const courseController = {
    async getAllCourses(req, res) {
        try {
            const courses = await courseService.getAllCourses();
            return res.status(200).json({
                count: courses.length,
                courses
            });
        } catch (err) {
            console.error('Error fetching courses:', err.message);
            return res.status(500).json({ error: 'Internal server error while fetching courses.' });
        }
    },

    async createCourse(req, res) {
        try {
            const { course_name, course_code, dept_id, instructor_id, credits, semester, max_capacity } = req.body;

            if (course_name !== undefined && typeof course_name !== 'string') {
                return res.status(400).json({ error: 'Course name must be a string.' });
            }
            if (course_code !== undefined && typeof course_code !== 'string') {
                return res.status(400).json({ error: 'Course code must be a string.' });
            }

            const trimmedTitle = course_name ? course_name.trim() : '';
            const trimmedCode = course_code ? course_code.trim().toUpperCase() : '';

            if (!trimmedTitle || !trimmedCode || dept_id === undefined || instructor_id === undefined) {
                return res.status(400).json({ error: 'Course name, code, dept_id, and instructor_id are required fields.' });
            }

            // Validate department existence
            const parsedDeptId = Number(dept_id);
            const deptCheck = await courseService.getDepartmentById(parsedDeptId);
            if (!deptCheck) {
                return res.status(400).json({ error: 'Provided dept_id does not exist.' });
            }

            // Validate instructor existence and role
            const parsedInstructorId = Number(instructor_id);
            const instructorCheck = await courseService.getUserById(parsedInstructorId);
            if (!instructorCheck) {
                return res.status(400).json({ error: 'Provided instructor_id does not exist.' });
            }
            if (instructorCheck.role !== 'Teacher') {
                return res.status(400).json({ error: 'Assigned user must have the Teacher role.' });
            }

            // Check duplicate course code
            const existingCourse = await courseService.getCourseByCode(trimmedCode);
            if (existingCourse) {
                return res.status(409).json({ error: 'Course with this code already exists.' });
            }

            const newCourse = await courseService.createCourse({
                course_name: trimmedTitle,
                course_code: trimmedCode,
                dept_id: parsedDeptId,
                instructor_id: parsedInstructorId,
                credits: credits ? Number(credits) : 3,
                semester: semester ? semester.trim() : 'Fall',
                max_capacity: max_capacity ? Number(max_capacity) : 50
            });

            return res.status(201).json({
                message: 'Course created successfully',
                course: newCourse
            });
        } catch (err) {
            console.error('Error creating course:', err.message);
            if (err.code === '23505' || err.message.includes('unique constraint')) {
                return res.status(409).json({ error: 'Course with this code already exists.' });
            }
            return res.status(500).json({ error: 'Internal server error during course creation.' });
        }
    },

    async updateCourse(req, res) {
        try {
            const { id } = req.params;
            const { course_name, course_code, credits, semester, max_capacity } = req.body;

            const parsedId = Number(id);
            if (!Number.isInteger(parsedId) || parsedId <= 0) {
                return res.status(400).json({ error: 'Invalid course ID format.' });
            }

            const updatedCourse = await courseService.updateCourse(parsedId, {
                course_name: course_name ? course_name.trim() : undefined,
                course_code: course_code ? course_code.trim().toUpperCase() : undefined,
                credits: credits !== undefined ? Number(credits) : undefined,
                semester: semester ? semester.trim() : undefined,
                max_capacity: max_capacity !== undefined ? Number(max_capacity) : undefined
            });

            if (!updatedCourse) {
                return res.status(404).json({ error: 'Course not found.' });
            }

            return res.status(200).json({
                message: 'Course updated successfully',
                course: updatedCourse
            });
        } catch (err) {
            console.error('Error updating course:', err.message);
            if (err.code === '23505') {
                return res.status(409).json({ error: 'Course with this code already exists.' });
            }
            return res.status(500).json({ error: 'Internal server error while updating course.' });
        }
    },

    async deleteCourse(req, res) {
        try {
            const { id } = req.params;
            const parsedId = Number(id);

            const deletedCourse = await courseService.deleteCourse(parsedId);
            if (!deletedCourse) {
                return res.status(404).json({ error: 'Course not found.' });
            }

            return res.status(200).json({
                message: 'Course deleted successfully',
                course: deletedCourse
            });
        } catch (err) {
            console.error('Error deleting course:', err.message);
            return res.status(500).json({ error: 'Internal server error while deleting course.' });
        }
    }
};

module.exports = courseController;