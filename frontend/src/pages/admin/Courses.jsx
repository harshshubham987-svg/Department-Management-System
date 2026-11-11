import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { courseService } from '../../services/courseService';
import { departmentService } from '../../services/departmentService';
import { apiCall } from '../../services/api';
import './Courses.css';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Search & Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDeptFilter, setSelectedDeptFilter] = useState('');

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    
    const [selectedCourse, setSelectedCourse] = useState(null);

    // Form Data State
    const [formData, setFormData] = useState({
        course_name: '',
        course_code: '',
        dept_id: '',
        instructor_id: '',
        credits: 3,
        semester: '',
        max_capacity: 50
    });

    // Fetch initial data on mount
    useEffect(() => {
        fetchCourses();
        fetchDepartments();
        fetchTeachers();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const data = await courseService.getAllCourses();
            setCourses(data.courses || data);
            setFilteredCourses(data.courses || data);
        } catch (err) {
            console.error('Error fetching courses:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const data = await departmentService.getAllDepartments();
            setDepartments(data.departments || data);
        } catch (err) {
            console.error('Error fetching departments:', err.message);
        }
    };

    const fetchTeachers = async () => {
        try {
            const data = await apiCall('/users?role=Teacher');
            setTeachers(data.users || data || []);
        } catch (err) {
            console.error('Error fetching teachers:', err.message);
        }
    };

    // Search and Filter Logic
    useEffect(() => {
        let result = courses;

        if (searchTerm) {
            result = result.filter(c => 
                c.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.course_code.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedDeptFilter) {
            result = result.filter(c => String(c.dept_id) === String(selectedDeptFilter));
        }

        setFilteredCourses(result);
    }, [searchTerm, selectedDeptFilter, courses]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Add Course Submission
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await courseService.createCourse({
                ...formData,
                dept_id: Number(formData.dept_id),
                instructor_id: formData.instructor_id ? Number(formData.instructor_id) : null,
                credits: Number(formData.credits),
                max_capacity: Number(formData.max_capacity)
            });
            setIsAddModalOpen(false);
            setFormData({
                course_name: '',
                course_code: '',
                dept_id: '',
                instructor_id: '',
                credits: 3,
                semester: '',
                max_capacity: 50
            });
            fetchCourses();
        } catch (err) {
            alert('Failed to add course: ' + err.message);
        }
    };

    // Edit Course Submission
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await courseService.updateCourse(selectedCourse.course_id, {
                ...formData,
                dept_id: Number(formData.dept_id),
                instructor_id: formData.instructor_id ? Number(formData.instructor_id) : null,
                credits: Number(formData.credits),
                max_capacity: Number(formData.max_capacity)
            });
            setIsEditModalOpen(false);
            setSelectedCourse(null);
            fetchCourses();
        } catch (err) {
            alert('Failed to update course: ' + err.message);
        }
    };

    // Delete Course Handler
    const handleDelete = async (courseId) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await courseService.deleteCourse(courseId);
                fetchCourses();
            } catch (err) {
                alert('Failed to delete course: ' + err.message);
            }
        }
    };

    // Open Edit Modal
    const openEditModal = (course) => {
        setSelectedCourse(course);
        setFormData({
            course_name: course.course_name || '',
            course_code: course.course_code || '',
            dept_id: course.dept_id || '',
            instructor_id: course.instructor_id || '',
            credits: course.credits || 3,
            semester: course.semester || '',
            max_capacity: course.max_capacity || 50
        });
        setIsEditModalOpen(true);
    };

    const openViewModal = (course) => {
        setSelectedCourse(course);
        setIsViewModalOpen(true);
    };

    return (
        <DashboardLayout title="Course Management">
            <div className="purple-dashboard-wrapper">
                
                {/* Action Bar */}
                <div className="department-action-bar">
                    <div className="search-box">
                        <input 
                            type="text" 
                            placeholder="Search by Course Name or Code..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="purple-input"
                        />
                    </div>
                    
                    <div className="filter-box">
                        <select 
                            value={selectedDeptFilter} 
                            onChange={(e) => setSelectedDeptFilter(e.target.value)}
                            className="purple-input"
                        >
                            <option value="">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept.dept_id} value={dept.dept_id}>
                                    {dept.dept_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button 
                        className="btn-primary-purple" 
                        onClick={() => {
                            setFormData({
                                course_name: '',
                                course_code: '',
                                dept_id: '',
                                instructor_id: '',
                                credits: 3,
                                semester: '',
                                max_capacity: 50
                            });
                            setIsAddModalOpen(true);
                        }}
                    >
                        + Add New Course
                    </button>
                </div>

                {loading && <div className="purple-loading">Loading courses...</div>}
                {error && <div className="purple-error">Error: {error}</div>}

                {/* Courses Table */}
                {!loading && !error && (
                    <div className="purple-table-card">
                        <div className="table-responsive">
                            <table className="purple-table">
                                <thead>
                                    <tr>
                                        <th>Course Code</th>
                                        <th>Course Name</th>
                                        <th>Department</th>
                                        <th>Instructor</th>
                                        <th>Credits</th>
                                        <th>Semester</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCourses.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="empty-table">No courses found.</td>
                                        </tr>
                                    ) : (
                                        filteredCourses.map((course) => (
                                            <tr key={course.course_id}>
                                                <td><span className="code-badge">{course.course_code}</span></td>
                                                <td className="dept-name-col">{course.course_name}</td>
                                                <td>{course.dept_name || departments.find(d => d.dept_id === course.dept_id)?.dept_name || 'N/A'}</td>
                                                <td>{course.instructor_name || teachers.find(t => t.user_id === course.instructor_id)?.full_name || 'Unassigned'}</td>
                                                <td>{course.credits}</td>
                                                <td>{course.semester || 'N/A'}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button className="btn-action view" onClick={() => openViewModal(course)}>View</button>
                                                        <button className="btn-action edit" onClick={() => openEditModal(course)}>Edit</button>
                                                        <button className="btn-action delete" onClick={() => handleDelete(course.course_id)}>Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Add Course Modal */}
                {isAddModalOpen && (
                    <div className="modal-backdrop">
                        <div className="purple-modal">
                            <h3>Add New Course</h3>
                            <form onSubmit={handleAddSubmit}>
                                <div className="form-group">
                                    <label>Course Name</label>
                                    <input type="text" name="course_name" value={formData.course_name} onChange={handleInputChange} required className="purple-input" />
                                </div>
                                <div className="form-group">
                                    <label>Course Code</label>
                                    <input type="text" name="course_code" value={formData.course_code} onChange={handleInputChange} required className="purple-input" />
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <select name="dept_id" value={formData.dept_id} onChange={handleInputChange} required className="purple-input">
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept.dept_id} value={dept.dept_id}>{dept.dept_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Instructor (Teacher)</label>
                                    <select name="instructor_id" value={formData.instructor_id} onChange={handleInputChange} className="purple-input">
                                        <option value="">Select Instructor</option>
                                        {teachers.map(teacher => (
                                            <option key={teacher.user_id} value={teacher.user_id}>{teacher.full_name} ({teacher.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Credits</label>
                                    <input type="number" name="credits" value={formData.credits} onChange={handleInputChange} min="1" max="10" required className="purple-input" />
                                </div>
                                <div className="form-group">
                                    <label>Semester</label>
                                    <input type="text" name="semester" value={formData.semester} onChange={handleInputChange} placeholder="e.g. Fall 2026" className="purple-input" />
                                </div>
                                <div className="form-group">
                                    <label>Max Capacity</label>
                                    <input type="number" name="max_capacity" value={formData.max_capacity} onChange={handleInputChange} min="1" required className="purple-input" />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary-purple">Create Course</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Course Modal */}
                {isEditModalOpen && (
                    <div className="modal-backdrop">
                        <div className="purple-modal">
                            <h3>Edit Course</h3>
                            <form onSubmit={handleEditSubmit}>
                                <div className="form-group">
                                    <label>Course Name</label>
                                    <input type="text" name="course_name" value={formData.course_name} onChange={handleInputChange} required className="purple-input" />
                                </div>
                                <div className="form-group">
                                    <label>Course Code</label>
                                    <input type="text" name="course_code" value={formData.course_code} onChange={handleInputChange} required className="purple-input" />
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <select name="dept_id" value={formData.dept_id} onChange={handleInputChange} required className="purple-input">
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept.dept_id} value={dept.dept_id}>{dept.dept_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Instructor (Teacher)</label>
                                    <select name="instructor_id" value={formData.instructor_id} onChange={handleInputChange} className="purple-input">
                                        <option value="">Select Instructor</option>
                                        {teachers.map(teacher => (
                                            <option key={teacher.user_id} value={teacher.user_id}>{teacher.full_name} ({teacher.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Credits</label>
                                    <input type="number" name="credits" value={formData.credits} onChange={handleInputChange} min="1" max="10" required className="purple-input" />
                                </div>
                                <div className="form-group">
                                    <label>Semester</label>
                                    <input type="text" name="semester" value={formData.semester} onChange={handleInputChange} className="purple-input" />
                                </div>
                                <div className="form-group">
                                    <label>Max Capacity</label>
                                    <input type="number" name="max_capacity" value={formData.max_capacity} onChange={handleInputChange} min="1" required className="purple-input" />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary-purple">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* View Course Details Modal */}
                {isViewModalOpen && selectedCourse && (
                    <div className="modal-backdrop">
                        <div className="purple-modal">
                            <h3>Course Details</h3>
                            <div className="details-grid">
                                <p><strong>ID:</strong> {selectedCourse.course_id}</p>
                                <p><strong>Course Name:</strong> {selectedCourse.course_name}</p>
                                <p><strong>Course Code:</strong> {selectedCourse.course_code}</p>
                                <p><strong>Department ID:</strong> {selectedCourse.dept_id}</p>
                                <p><strong>Instructor ID:</strong> {selectedCourse.instructor_id || 'Not Assigned'}</p>
                                <p><strong>Credits:</strong> {selectedCourse.credits}</p>
                                <p><strong>Semester:</strong> {selectedCourse.semester || 'N/A'}</p>
                                <p><strong>Max Capacity:</strong> {selectedCourse.max_capacity}</p>
                                <p><strong>Enrolled Students:</strong> {selectedCourse.enrolled_students ?? 0}</p>
                                <p><strong>Created At:</strong> {new Date(selectedCourse.created_at).toLocaleString()}</p>
                            </div>
                            <div className="modal-actions" style={{ marginTop: '20px' }}>
                                <button type="button" className="btn-primary-purple" onClick={() => setIsViewModalOpen(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default Courses;