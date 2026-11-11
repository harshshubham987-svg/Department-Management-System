import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { enrollmentService } from '../../services/enrollmentService';
import { courseService } from '../../services/courseService';
import { apiCall } from '../../services/api';
import './EnrollmentManagement.css';

const EnrollmentManagement = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [filteredEnrollments, setFilteredEnrollments] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    
    // Stats State
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        completed: 0,
        cancelled: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Search & Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [gradeFilter, setGradeFilter] = useState('');

    // Modal States
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
    
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);

    const [gradeData, setGradeData] = useState({
        grade: ''
    });

    useEffect(() => {
        fetchEnrollments();
        fetchStudents();
        fetchCourses();
    }, []);

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            const data = await enrollmentService.getAllEnrollments();
            const list = data.enrollments || data || [];
            setEnrollments(list);
            setFilteredEnrollments(list);
            calculateStats(list);
        } catch (err) {
            console.error('Error fetching enrollments:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const data = await apiCall('/users?role=Student');
            setStudents(data.users || data || []);
        } catch (err) {
            console.error('Error fetching students:', err.message);
        }
    };

    const fetchCourses = async () => {
        try {
            const data = await courseService.getAllCourses();
            setCourses(data.courses || data || []);
        } catch (err) {
            console.error('Error fetching courses:', err.message);
        }
    };

    const calculateStats = (list) => {
        const total = list.length;
        // 'Enrolled' and 'Active' statuses are included in active count
        const active = list.filter(e => !e.status || e.status === 'Active' || e.status === 'Enrolled').length;
        const completed = list.filter(e => e.status === 'Completed').length;
        const cancelled = list.filter(e => e.status === 'Cancelled' || e.status === 'Dropped').length;
        setStats({ total, active, completed, cancelled });
    };

    // Filter Logic
    useEffect(() => {
        let result = enrollments;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(e => 
                (e.student_name && e.student_name.toLowerCase().includes(term)) ||
                (e.course_name && e.course_name.toLowerCase().includes(term)) ||
                String(e.student_id).includes(term) ||
                String(e.course_id).includes(term)
            );
        }

        if (statusFilter) {
            result = result.filter(e => e.status === statusFilter);
        }

        if (gradeFilter) {
            result = result.filter(e => e.grade && e.grade.toUpperCase() === gradeFilter.toUpperCase());
        }

        setFilteredEnrollments(result);
    }, [searchTerm, statusFilter, gradeFilter, enrollments]);

    // Grade Update Submission
    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        try {
            await enrollmentService.updateGrade(selectedEnrollment.enrollment_id, {
                grade: gradeData.grade
            });
            setIsGradeModalOpen(false);
            setSelectedEnrollment(null);
            setGradeData({ grade: '' });
            fetchEnrollments();
        } catch (err) {
            alert('Failed to update grade: ' + err.message);
        }
    };

    // Delete / Cancel Enrollment
    const handleDelete = async (enrollmentId) => {
        if (window.confirm('Are you sure you want to delete/cancel this enrollment?')) {
            try {
                await enrollmentService.deleteEnrollment(enrollmentId);
                fetchEnrollments();
            } catch (err) {
                alert('Failed to delete enrollment: ' + err.message);
            }
        }
    };

    const openViewModal = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setIsViewModalOpen(true);
    };

    const openGradeModal = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setGradeData({ grade: enrollment.grade || '' });
        setIsGradeModalOpen(true);
    };

    return (
        <DashboardLayout title="Enrollment Management">
            <div className="purple-dashboard-wrapper">
                
                {/* 1. Enrollment Overview Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Enrollments</h3>
                        <p className="stat-number">{stats.total}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Active / Enrolled</h3>
                        <p className="stat-number success">{stats.active}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Completed</h3>
                        <p className="stat-number">{stats.completed}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Cancelled / Dropped</h3>
                        <p className="stat-number warning">{stats.cancelled}</p>
                    </div>
                </div>

                {/* 7. Search & Filters (Creation button removed for view-only admin role) */}
                <div className="department-action-bar">
                    <div className="search-box">
                        <input 
                            type="text" 
                            placeholder="Search by Student Name, ID or Course..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="purple-input"
                        />
                    </div>

                    <div className="filter-box">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="purple-input">
                            <option value="">All Statuses</option>
                            <option value="Enrolled">Enrolled</option>
                            <option value="Active">Active</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="filter-box">
                        <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className="purple-input">
                            <option value="">All Grades</option>
                            <option value="A">Grade A</option>
                            <option value="B">Grade B</option>
                            <option value="C">Grade C</option>
                            <option value="D">Grade D</option>
                            <option value="F">Grade F</option>
                        </select>
                    </div>
                </div>

                {loading && <div className="purple-loading">Loading enrollments...</div>}
                {error && <div className="purple-error">Error: {error}</div>}

                {/* 2. Enrollment List Table */}
                {!loading && !error && (
                    <div className="purple-table-card">
                        <div className="table-responsive">
                            <table className="purple-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Student Name</th>
                                        <th>Student ID</th>
                                        <th>Course Name</th>
                                        <th>Course ID</th>
                                        <th>Enrollment Date</th>
                                        <th>Grade</th>
                                        <th>Attendance</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEnrollments.length === 0 ? (
                                        <tr>
                                            <td colSpan="10" className="empty-table">No enrollments found.</td>
                                        </tr>
                                    ) : (
                                        filteredEnrollments.map((enr) => (
                                            <tr key={enr.enrollment_id}>
                                                <td><span className="code-badge">#{enr.enrollment_id}</span></td>
                                                <td className="dept-name-col">{enr.student_name || students.find(s => s.user_id === enr.student_id)?.full_name || 'N/A'}</td>
                                                <td>#{enr.student_id}</td>
                                                <td>{enr.course_name || courses.find(c => c.course_id === enr.course_id)?.course_name || 'N/A'}</td>
                                                <td>#{enr.course_id}</td>
                                                <td>{enr.enrollment_date ? new Date(enr.enrollment_date).toLocaleDateString() : 'N/A'}</td>
                                                <td><strong>{enr.grade || 'N/A'}</strong></td>
                                                <td>{enr.attendance_percentage !== undefined ? `${enr.attendance_percentage}%` : 'N/A'}</td>
                                                <td>
                                                    <span className={`status-pill ${enr.status === 'Completed' ? 'active' : enr.status === 'Cancelled' ? 'inactive' : 'active'}`}>
                                                        {enr.status || 'Enrolled'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button className="btn-action view" onClick={() => openViewModal(enr)}>View</button>
                                                        <button className="btn-action edit" onClick={() => openGradeModal(enr)}>Grade</button>
                                                        <button className="btn-action delete" onClick={() => handleDelete(enr.enrollment_id)}>Cancel</button>
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

                {/* 5. Grade Management Modal */}
                {isGradeModalOpen && selectedEnrollment && (
                    <div className="modal-backdrop">
                        <div className="purple-modal">
                            <h3>Update Student Grade</h3>
                            <form onSubmit={handleGradeSubmit}>
                                <div className="form-group">
                                    <label>Enrollment ID: #{selectedEnrollment.enrollment_id}</label>
                                    <label>Student: {selectedEnrollment.student_name || 'N/A'}</label>
                                </div>
                                <div className="form-group">
                                    <label>Enter Grade (e.g., A, B, C, O)</label>
                                    <input 
                                        type="text" 
                                        maxLength="5" 
                                        value={gradeData.grade} 
                                        onChange={(e) => setGradeData({ grade: e.target.value })} 
                                        required 
                                        className="purple-input" 
                                        placeholder="Grade"
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setIsGradeModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary-purple">Save Grade</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 4. View Enrollment Modal */}
                {isViewModalOpen && selectedEnrollment && (
                    <div className="modal-backdrop">
                        <div className="purple-modal">
                            <h3>Enrollment Complete Details</h3>
                            <div className="details-grid">
                                <p><strong>Enrollment ID:</strong> #{selectedEnrollment.enrollment_id}</p>
                                <p><strong>Student ID:</strong> #{selectedEnrollment.student_id}</p>
                                <p><strong>Student Name:</strong> {selectedEnrollment.student_name || 'N/A'}</p>
                                <p><strong>Course ID:</strong> #{selectedEnrollment.course_id}</p>
                                <p><strong>Course Name:</strong> {selectedEnrollment.course_name || 'N/A'}</p>
                                <p><strong>Enrollment Date:</strong> {selectedEnrollment.enrollment_date ? new Date(selectedEnrollment.enrollment_date).toLocaleString() : 'N/A'}</p>
                                <p><strong>Grade:</strong> {selectedEnrollment.grade || 'Not Assigned'}</p>
                                <p><strong>Attendance Percentage:</strong> {selectedEnrollment.attendance_percentage !== undefined ? `${selectedEnrollment.attendance_percentage}%` : 'N/A'}</p>
                                <p><strong>Status:</strong> {selectedEnrollment.status || 'Enrolled'}</p>
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

export default EnrollmentManagement;