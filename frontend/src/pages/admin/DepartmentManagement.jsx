import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { departmentService } from '../../services/departmentService';
import { apiCall } from '../../services/api';
import './DepartmentManagement.css';

const DepartmentManagement = () => {
    const [departments, setDepartments] = useState([]);
    const [filteredDepts, setFilteredDepts] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    
    const [selectedDept, setSelectedDept] = useState(null);
    const [formData, setFormData] = useState({
        dept_name: '',
        dept_code: '',
        head_of_department: '',
        location: '',
        contact_email: ''
    });

    // Fetch Departments and Teachers on Mount
    useEffect(() => {
        fetchDepartments();
        fetchTeachers();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const data = await departmentService.getAllDepartments();
            setDepartments(data.departments || data);
            setFilteredDepts(data.departments || data);
        } catch (err) {
            console.error('Error fetching departments:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch and filter registered teachers from database
    const fetchTeachers = async () => {
        try {
            const data = await apiCall('/users');
            const allUsers = data.users || data || [];
            const teacherList = allUsers.filter(u => u.role === 'Teacher');
            setTeachers(teacherList);
        } catch (err) {
            console.error('Error fetching teachers list:', err.message);
        }
    };

    // Search and Filter logic
    useEffect(() => {
        const filtered = departments.filter(dept => 
            dept.dept_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.dept_code.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredDepts(filtered);
    }, [searchTerm, departments]);

    // Handle Form Input Change & Auto-fill Email
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'head_of_department') {
            const selectedTeacher = teachers.find(t => t.full_name === value);
            setFormData({
                ...formData,
                head_of_department: value,
                contact_email: selectedTeacher ? selectedTeacher.email : formData.contact_email
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Add Department Submission
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await departmentService.createDepartment(formData);
            setIsAddModalOpen(false);
            setFormData({ dept_name: '', dept_code: '', head_of_department: '', location: '', contact_email: '' });
            fetchDepartments();
        } catch (err) {
            alert('Failed to add department: ' + err.message);
        }
    };

    // Edit Department Submission
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await departmentService.updateDepartment(selectedDept.dept_id, formData);
            setIsEditModalOpen(false);
            setSelectedDept(null);
            fetchDepartments();
        } catch (err) {
            alert('Failed to update department: ' + err.message);
        }
    };

    // Open Edit Modal with existing data
    const openEditModal = (dept) => {
        setSelectedDept(dept);
        setFormData({
            dept_name: dept.dept_name || '',
            dept_code: dept.dept_code || '',
            head_of_department: dept.head_of_department || '',
            location: dept.location || '',
            contact_email: dept.contact_email || ''
        });
        setIsEditModalOpen(true);
    };

    // Open View Modal
    const openViewModal = (dept) => {
        setSelectedDept(dept);
        setIsViewModalOpen(true);
    };

    return (
        <DashboardLayout title="Department Management">
            <div className="purple-dashboard-wrapper">
                
                {/* Action Bar: Search & Add Button */}
                <div className="department-action-bar">
                    <div className="search-box">
                        <input 
                            type="text" 
                            placeholder="Search by Department Name or Code..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="purple-input"
                        />
                    </div>
                    <button 
                        className="btn-primary-purple" 
                        onClick={() => {
                            setFormData({ dept_name: '', dept_code: '', head_of_department: '', location: '', contact_email: '' });
                            setIsAddModalOpen(true);
                        }}
                    >
                        + Add New Department
                    </button>
                </div>

                {/* Error / Loading State */}
                {loading && <div className="purple-loading">Loading departments...</div>}
                {error && <div className="purple-error">Error: {error}</div>}

                {/* Departments Table */}
                {!loading && !error && (
                    <div className="purple-table-card">
                        <div className="table-responsive">
                            <table className="purple-table">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Department Name</th>
                                        <th>Head of Dept</th>
                                        <th>Location</th>
                                        <th>Staff / Students</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDepts.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="empty-table">No departments found.</td>
                                        </tr>
                                    ) : (
                                        filteredDepts.map((dept) => (
                                            <tr key={dept.dept_id}>
                                                <td><span className="code-badge">{dept.dept_code}</span></td>
                                                <td className="dept-name-col">{dept.dept_name}</td>
                                                <td>{dept.head_of_department || 'N/A'}</td>
                                                <td>{dept.location || 'N/A'}</td>
                                                <td>{dept.total_staff ?? 0} / {dept.total_students ?? 0}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button className="btn-action view" onClick={() => openViewModal(dept)}>View</button>
                                                        <button className="btn-action edit" onClick={() => openEditModal(dept)}>Edit</button>
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

                {/* Add Department Modal */}
                {isAddModalOpen && (
                    <div className="modal-backdrop">
                        <div className="purple-modal">
                            <h3>Add New Department</h3>
                            <form onSubmit={handleAddSubmit}>
                                <div className="form-group">
                                    <label>Department Name</label>
                                    <input type="text" name="dept_name" value={formData.dept_name} onChange={handleInputChange} required className="purple-input" />
                                </div>
                                <div className="form-group">
                                    <label>Department Code</label>
                                    <input type="text" name="dept_code" value={formData.dept_code} onChange={handleInputChange} required className="purple-input" />
                                </div>
                                <div className="form-group">
                                    <label>Head of Department (Teacher)</label>
                                    <select 
                                        name="head_of_department" 
                                        value={formData.head_of_department} 
                                        onChange={handleInputChange} 
                                        className="purple-input"
                                    >
                                        <option value="">Select Head of Department</option>
                                        {teachers.map((teacher) => (
                                            <option key={teacher.user_id || teacher.email} value={teacher.full_name}>
                                                {teacher.full_name} ({teacher.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Location / Building</label>
                                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="purple-input" />
                                </div>
                                <div className="form-group">
                                    <label>Contact Email</label>
                                    <input type="email" name="contact_email" value={formData.contact_email} onChange={handleInputChange} className="purple-input" />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary-purple">Create Department</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Department Modal */}
                {isEditModalOpen && (
                    <div className="modal-backdrop">
                        <div className="purple-modal">
                            <h3>Edit Department</h3>
                            <form onSubmit={handleEditSubmit}>
                                <div className="form-group">
                                    <label>Department Name</label>
                                    <input type="text" name="dept_name" value={formData.dept_name} onChange={handleInputChange} required className="purple-input" />
                                </div>
                                <div className="form-group">
                                    <label>Department Code</label>
                                    <input type="text" name="dept_code" value={formData.dept_code} onChange={handleInputChange} required className="purple-input" />
                                </div>
                                <div className="form-group">
                                    <label>Head of Department (Teacher)</label>
                                    <select 
                                        name="head_of_department" 
                                        value={formData.head_of_department} 
                                        onChange={handleInputChange} 
                                        className="purple-input"
                                    >
                                        <option value="">Select Head of Department</option>
                                        {teachers.map((teacher) => (
                                            <option key={teacher.user_id || teacher.email} value={teacher.full_name}>
                                                {teacher.full_name} ({teacher.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Location / Building</label>
                                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="purple-input" />
                                </div>
                                <div className="form-group">
                                    <label>Contact Email</label>
                                    <input type="email" name="contact_email" value={formData.contact_email} onChange={handleInputChange} className="purple-input" />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary-purple">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* View Department Details Modal */}
                {isViewModalOpen && selectedDept && (
                    <div className="modal-backdrop">
                        <div className="purple-modal">
                            <h3>Department Details</h3>
                            <div className="details-grid">
                                <p><strong>ID:</strong> {selectedDept.dept_id}</p>
                                <p><strong>Name:</strong> {selectedDept.dept_name}</p>
                                <p><strong>Code:</strong> {selectedDept.dept_code}</p>
                                <p><strong>Head of Dept:</strong> {selectedDept.head_of_department || 'N/A'}</p>
                                <p><strong>Location:</strong> {selectedDept.location || 'N/A'}</p>
                                <p><strong>Contact Email:</strong> {selectedDept.contact_email || 'N/A'}</p>
                                <p><strong>Total Staff:</strong> {selectedDept.total_staff ?? 0}</p>
                                <p><strong>Total Students:</strong> {selectedDept.total_students ?? 0}</p>
                                <p><strong>Created At:</strong> {new Date(selectedDept.created_at).toLocaleString()}</p>
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

export default DepartmentManagement;