import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { teacherService } from '../../services/teacherService';
import { useAuth } from '../../context/AuthContext';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('overview'); // overview, courses, students, grades

    // Grade Modal State
    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);
    const [gradeInput, setGradeInput] = useState('');

    // Attendance Modal State
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [attendanceInput, setAttendanceInput] = useState('');

    useEffect(() => {
        fetchTeacherData();
    }, []);

    const fetchTeacherData = async () => {
        try {
            setLoading(true);
            const courseData = await teacherService.getAssignedCourses();
            const enrollmentData = await teacherService.getEnrollments();
            
            const allCourses = courseData.courses || courseData || [];
            const allEnrollments = enrollmentData.enrollments || enrollmentData || [];

            // If teacher, filter courses where instructor_id matches logged-in user
            const assignedCourses = user?.role === 'Teacher' 
                ? allCourses.filter(c => c.instructor_id === user.user_id) 
                : allCourses;

            setCourses(assignedCourses);
            setEnrollments(allEnrollments);
        } catch (err) {
            console.error('Error loading teacher dashboard:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Stats
    const totalAssignedCourses = courses.length;
    
    // Filter enrollments belonging to teacher's courses
    const assignedCourseIds = courses.map(c => c.course_id);
    const relevantEnrollments = enrollments.filter(e => assignedCourseIds.includes(e.course_id));
    
    const totalEnrolledStudents = relevantEnrollments.length;
    
    const pendingGradesCount = relevantEnrollments.filter(e => !e.grade || e.grade.trim() === '').length;
    
    const validAttendances = relevantEnrollments.filter(e => e.attendance_percentage !== undefined && e.attendance_percentage !== null);
    const averageAttendance = validAttendances.length > 0 
        ? (validAttendances.reduce((acc, curr) => acc + Number(curr.attendance_percentage), 0) / validAttendances.length).toFixed(1) 
        : 'N/A';

    // Handle Grade Submission
    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        try {
            await teacherService.updateGrade(selectedEnrollment.enrollment_id, { grade: gradeInput });
            setIsGradeModalOpen(false);
            setSelectedEnrollment(null);
            setGradeInput('');
            fetchTeacherData();
            alert('Grade updated successfully!');
        } catch (err) {
            alert('Failed to update grade: ' + err.message);
        }
    };

    // Handle Attendance Submission
    const handleAttendanceSubmit = async (e) => {
        e.preventDefault();
        try {
            await teacherService.updateAttendance(selectedEnrollment.enrollment_id, {
                attendance_percentage: Number(attendanceInput)
            });
            setIsAttendanceModalOpen(false);
            setSelectedEnrollment(null);
            setAttendanceInput('');
            fetchTeacherData();
            alert('Attendance updated successfully!');
        } catch (err) {
            alert('Failed to update attendance: ' + err.message);
        }
    };

    const openGradeModal = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setGradeInput(enrollment.grade || '');
        setIsGradeModalOpen(true);
    };

    const openAttendanceModal = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setAttendanceInput(enrollment.attendance_percentage || '');
        setIsAttendanceModalOpen(true);
    };

    return (
        <DashboardLayout title="Teacher Portal">
            <div className="purple-dashboard-wrapper">

                {/* Navigation Tabs */}
                <div className="teacher-tabs">
                    <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
                    <button className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>My Courses</button>
                    <button className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>Student Management</button>
                    <button className={`tab-btn ${activeTab === 'grades' ? 'active' : ''}`} onClick={() => setActiveTab('grades')}>Grade & Attendance</button>
                </div>

                {loading && <div className="purple-loading">Loading teacher portal data...</div>}
                {error && <div className="purple-error">Error: {error}</div>}

                {!loading && !error && activeTab === 'overview' && (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Assigned Courses</h3>
                                <p className="stat-number">{totalAssignedCourses}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Total Enrolled Students</h3>
                                <p className="stat-number">{totalEnrolledStudents}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Average Attendance</h3>
                                <p className="stat-number success">{averageAttendance !== 'N/A' ? `${averageAttendance}%` : 'N/A'}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Pending Grade Updates</h3>
                                <p className="stat-number warning">{pendingGradesCount}</p>
                            </div>
                        </div>

                        <div className="purple-table-card" style={{ marginTop: '24px' }}>
                            <h3 style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', margin: 0 }}>Quick Summary: Assigned Courses</h3>
                            <table className="purple-table">
                                <thead>
                                    <tr>
                                        <th>Course Code</th>
                                        <th>Course Name</th>
                                        <th>Credits</th>
                                        <th>Semester</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.length === 0 ? (
                                        <tr><td colSpan="4" className="empty-table">No courses assigned currently.</td></tr>
                                    ) : (
                                        courses.map(c => (
                                            <tr key={c.course_id}>
                                                <td><span className="code-badge">{c.course_code}</span></td>
                                                <td className="dept-name-col">{c.course_name}</td>
                                                <td>{c.credits}</td>
                                                <td>{c.semester || 'N/A'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {!loading && !error && activeTab === 'courses' && (
                    <div className="purple-table-card">
                        <table className="purple-table">
                            <thead>
                                <tr>
                                    <th>Course Code</th>
                                    <th>Course Name</th>
                                    <th>Department</th>
                                    <th>Credits</th>
                                    <th>Semester</th>
                                    <th>Max Capacity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.length === 0 ? (
                                    <tr><td colSpan="6" className="empty-table">No assigned courses found.</td></tr>
                                ) : (
                                    courses.map(c => (
                                        <tr key={c.course_id}>
                                            <td><span className="code-badge">{c.course_code}</span></td>
                                            <td className="dept-name-col">{c.course_name}</td>
                                            <td>{c.dept_name || 'N/A'}</td>
                                            <td>{c.credits}</td>
                                            <td>{c.semester || 'N/A'}</td>
                                            <td>{c.max_capacity}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && !error && activeTab === 'students' && (
                    <div className="purple-table-card">
                        <table className="purple-table">
                            <thead>
                                <tr>
                                    <th>Enrollment ID</th>
                                    <th>Student Name</th>
                                    <th>Student ID</th>
                                    <th>Course ID</th>
                                    <th>Enrollment Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {relevantEnrollments.length === 0 ? (
                                    <tr><td colSpan="6" className="empty-table">No students enrolled in your courses.</td></tr>
                                ) : (
                                    relevantEnrollments.map(enr => (
                                        <tr key={enr.enrollment_id}>
                                            <td><span className="code-badge">#{enr.enrollment_id}</span></td>
                                            <td className="dept-name-col">{enr.student_name || 'Student #' + enr.student_id}</td>
                                            <td>#{enr.student_id}</td>
                                            <td>#{enr.course_id}</td>
                                            <td>{enr.enrollment_date ? new Date(enr.enrollment_date).toLocaleDateString() : 'N/A'}</td>
                                            <td><span className="status-pill active">{enr.status || 'Active'}</span></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && !error && activeTab === 'grades' && (
                    <div className="purple-table-card">
                        <table className="purple-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Student Name</th>
                                    <th>Course ID</th>
                                    <th>Grade</th>
                                    <th>Attendance</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {relevantEnrollments.length === 0 ? (
                                    <tr><td colSpan="6" className="empty-table">No enrollments available for grading.</td></tr>
                                ) : (
                                    relevantEnrollments.map(enr => (
                                        <tr key={enr.enrollment_id}>
                                            <td><span className="code-badge">#{enr.enrollment_id}</span></td>
                                            <td className="dept-name-col">{enr.student_name || 'Student #' + enr.student_id}</td>
                                            <td>#{enr.course_id}</td>
                                            <td><strong>{enr.grade || 'Not Graded'}</strong></td>
                                            <td>{enr.attendance_percentage !== undefined ? `${enr.attendance_percentage}%` : 'N/A'}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="btn-action edit" onClick={() => openGradeModal(enr)}>Update Grade</button>
                                                    <button className="btn-action view" onClick={() => openAttendanceModal(enr)}>Attendance</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Grade Update Modal */}
                {isGradeModalOpen && selectedEnrollment && (
                    <div className="modal-backdrop">
                        <div className="purple-modal">
                            <h3>Update Student Grade</h3>
                            <form onSubmit={handleGradeSubmit}>
                                <div className="form-group">
                                    <label>Enrollment ID: #{selectedEnrollment.enrollment_id}</label>
                                    <label>Student: {selectedEnrollment.student_name || `ID #${selectedEnrollment.student_id}`}</label>
                                </div>
                                <div className="form-group">
                                    <label>Grade (e.g. A, B, C, O)</label>
                                    <input 
                                        type="text" 
                                        maxLength="5" 
                                        value={gradeInput} 
                                        onChange={(e) => setGradeInput(e.target.value)} 
                                        required 
                                        className="purple-input" 
                                        placeholder="Enter grade"
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

                {/* Attendance Update Modal */}
                {isAttendanceModalOpen && selectedEnrollment && (
                    <div className="modal-backdrop">
                        <div className="purple-modal">
                            <h3>Update Student Attendance</h3>
                            <form onSubmit={handleAttendanceSubmit}>
                                <div className="form-group">
                                    <label>Enrollment ID: #{selectedEnrollment.enrollment_id}</label>
                                    <label>Student: {selectedEnrollment.student_name || `ID #${selectedEnrollment.student_id}`}</label>
                                </div>
                                <div className="form-group">
                                    <label>Attendance Percentage (0 - 100)</label>
                                    <input 
                                        type="number" 
                                        min="0" 
                                        max="100" 
                                        value={attendanceInput} 
                                        onChange={(e) => setAttendanceInput(e.target.value)} 
                                        required 
                                        className="purple-input" 
                                        placeholder="Enter percentage (e.g. 85)"
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setIsAttendanceModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary-purple">Save Attendance</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default TeacherDashboard;