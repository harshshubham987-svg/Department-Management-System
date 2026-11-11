const departmentService = require('../services/departmentService');

const departmentController = {
    // 1. GET /api/departments – Fetch all departments
    async getAllDepartments(req, res) {
        try {
            const departments = await departmentService.getAllDepartments();
            return res.status(200).json({
                count: departments.length,
                departments
            });
        } catch (err) {
            console.error('Error fetching departments:', err.message);
            return res.status(500).json({ error: 'Internal server error while fetching departments.' });
        }
    },

    // 2. GET /api/departments/:dept_id – Fetch single department by ID
    async getDepartmentById(req, res) {
        try {
            const { dept_id } = req.params;
            const parsedId = Number(dept_id);

            if (!Number.isInteger(parsedId) || parsedId <= 0) {
                return res.status(400).json({ error: 'Invalid department ID format.' });
            }

            const department = await departmentService.getDepartmentById(parsedId);
            if (!department) {
                return res.status(404).json({ error: 'Department not found.' });
            }

            return res.status(200).json({ department });
        } catch (err) {
            console.error('Error fetching department:', err.message);
            return res.status(500).json({ error: 'Internal server error while fetching department.' });
        }
    },

    // 3. POST /api/departments – Create new department (Admin-only)
    async createDepartment(req, res) {
        try {
            const { dept_name, dept_code, head_of_department, location, contact_email } = req.body;

            // Strict Data Type Validation
            if (dept_name !== undefined && typeof dept_name !== 'string') {
                return res.status(400).json({ error: 'Department name must be a string.' });
            }
            if (dept_code !== undefined && typeof dept_code !== 'string') {
                return res.status(400).json({ error: 'Department code must be a string.' });
            }

            const trimmedName = dept_name ? dept_name.trim() : '';
            const trimmedCode = dept_code ? dept_code.trim().toUpperCase() : '';
            const trimmedHod = head_of_department ? head_of_department.trim() : null;
            const trimmedLocation = location ? location.trim() : null;
            const trimmedEmail = contact_email ? contact_email.trim() : null;

            if (!trimmedName || !trimmedCode) {
                return res.status(400).json({ error: 'Department name and code are required fields.' });
            }

            if (trimmedName.length > 100 || trimmedCode.length > 50) {
                return res.status(400).json({ error: 'Name cannot exceed 100 chars and code cannot exceed 50 chars.' });
            }

            const newDepartment = await departmentService.createDepartment({
                dept_name: trimmedName,
                dept_code: trimmedCode,
                head_of_department: trimmedHod,
                location: trimmedLocation,
                contact_email: trimmedEmail
            });

            return res.status(201).json({
                message: 'Department created successfully',
                department: newDepartment
            });
        } catch (err) {
            console.error('Error creating department:', err.message);
            if (err.code === '23505' || err.message.includes('unique constraint')) {
                return res.status(409).json({ error: 'Department with this code or name already exists.' });
            }
            return res.status(500).json({ error: 'Internal server error during department creation.' });
        }
    },

    // 4. PUT /api/departments/:dept_id – Update department (Admin-only)
    async updateDepartment(req, res) {
        try {
            const { dept_id } = req.params;
            const parsedId = Number(dept_id);
            const { dept_name, dept_code, head_of_department, location, contact_email } = req.body;

            if (!Number.isInteger(parsedId) || parsedId <= 0) {
                return res.status(400).json({ error: 'Invalid department ID format.' });
            }

            // Strict Data Type Validation for Updates
            if (dept_name !== undefined && typeof dept_name !== 'string') {
                return res.status(400).json({ error: 'Department name must be a string.' });
            }
            if (dept_code !== undefined && typeof dept_code !== 'string') {
                return res.status(400).json({ error: 'Department code must be a string.' });
            }

            const currentDept = await departmentService.getDepartmentById(parsedId);
            if (!currentDept) {
                return res.status(404).json({ error: 'Department not found.' });
            }

            const updatedName = dept_name !== undefined ? dept_name.trim() : currentDept.dept_name;
            const updatedCode = dept_code !== undefined ? dept_code.trim().toUpperCase() : currentDept.dept_code;
            const updatedHod = head_of_department !== undefined ? (head_of_department ? head_of_department.trim() : null) : currentDept.head_of_department;
            const updatedLocation = location !== undefined ? (location ? location.trim() : null) : currentDept.location;
            const updatedEmail = contact_email !== undefined ? (contact_email ? contact_email.trim() : null) : currentDept.contact_email;

            if (!updatedName || !updatedCode) {
                return res.status(400).json({ error: 'Department name and code cannot be empty.' });
            }

            if (updatedName.length > 100 || updatedCode.length > 50) {
                return res.status(400).json({ error: 'Name cannot exceed 100 chars and code cannot exceed 50 chars.' });
            }

            const updatedDepartment = await departmentService.updateDepartment(parsedId, {
                dept_name: updatedName,
                dept_code: updatedCode,
                head_of_department: updatedHod,
                location: updatedLocation,
                contact_email: updatedEmail
            });

            return res.status(200).json({
                message: 'Department updated successfully',
                department: updatedDepartment
            });
        } catch (err) {
            console.error('Error updating department:', err.message);
            if (err.code === '23505' || err.message.includes('unique constraint')) {
                return res.status(409).json({ error: 'Department with this code or name already exists.' });
            }
            return res.status(500).json({ error: 'Internal server error during department update.' });
        }
    }
};

module.exports = departmentController;