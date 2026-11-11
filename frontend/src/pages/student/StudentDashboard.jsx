import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';
import './StudentDashboard.css';

const StudentDashboard = () => {
    const { user, updateUser } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('courses');

    // Profile Edit States
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [fullNameInput, setFullNameInput] = useState(user?.full_name || '');
    const [emailInput, setEmailInput] = useState(user?.email || '');

    // Course Enrollment States
    const [availableCourses, setAvailableCourses] = useState([]);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [selectedCourseToEnroll, setSelectedCourseToEnroll] = useState('');

    useEffect(() => {
        if (user?.user_id) {
            fetchStudentData();
            setFullNameInput(user?.full_name || '');
            setEmailInput(user?.email || '');
        }
    }, [user]);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await studentService.getStudentEnrollments(user.user_id);
            setEnrollments(data.enrollments || data || []);
        } catch (err) {
            console.error('Error fetching student dashboard data:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle Drop Course
    const handleDropCourse = async (enrollmentId) => {
        if (!window.confirm('Are you sure you want to drop this course?')) return;
        try {
            await studentService.dropCourse(enrollmentId);
            fetchStudentData();
            alert('Course dropped successfully!');
        } catch (err) {
            alert('Failed to drop course: ' + err.message);
        }
    };

    // Handle Open Enroll Modal & Fetch Courses
    const openEnrollModal = async () => {
        try {
            const data = await studentService.getAllAvailableCourses();
            setAvailableCourses(data.courses || data || []);
            setIsEnrollModalOpen(true);
        } catch (err) {
            alert('Failed to load courses: ' + err.message);
        }
    };

    // Handle Course Enrollment Submit
    const handleEnrollSubmit = async (e) => {
        e.preventDefault();
        try {
            await studentService.enrollInCourse(Number(selectedCourseToEnroll));
            setIsEnrollModalOpen(false);
            setSelectedCourseToEnroll('');
            fetchStudentData();
            alert('Successfully enrolled in the course!');
        } catch (err) {
            alert('Enrollment failed: ' + err.message);
        }
    };

    // Handle Profile Update Submission
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            alert('Profile updated successfully!');
            setIsEditingProfile(false);
        } catch (err) {
            alert('Failed to update profile: ' + err.message);
        }
    };

    // Calculate Stats
    const totalEnrolled = enrollments.length;
    const validAttendances = enrollments.filter(e => e.attendance_percentage !== undefined && e.attendance_percentage !== null);
    const averageAttendance = validAttendances.length > 0 
        ? (validAttendances.reduce((acc, curr) => acc + Number(curr.attendance_percentage), 0) / validAttendances.length).toFixed(1) 
        : 'N/A';
    const gradedCoursesCount = enrollments.filter(e => e.grade && e.grade.trim() !== '').length;

    return (
        <DashboardLayout title="Student Portal">
            <div className="purple-dashboard-wrapper">

                {/* Student Navigation Tabs */}
                <div className="student-tabs">
                    <button className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>Enrolled Courses</button>
                    <button className={`tab-btn ${activeTab === 'grades' ? 'active' : ''}`} onClick={() => setActiveTab('grades')}>Grades & Attendance</button>
                    <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>My Profile</button>
                </div>

                {loading && <div className="purple-loading">Loading student portfolio...</div>}
                {error && <div className="purple-error">Error: {error}</div>}

                {/* Tab 1: Enrolled Courses */}
                {!loading && !error && activeTab === 'courses' && (
                    <>
                        <div className="purple-stats-grid">
                            <div className="purple-card">
                                <div className="card-title">Total Enrolled</div>
                                <div className="card-value">{totalEnrolled}</div>
                            </div>
                            <div className="purple-card">
                                <div className="card-title">Average Attendance</div>
                                <div className="card-value" style={{ color: '#10b981' }}>{averageAttendance !== 'N/A' ? `${averageAttendance}%` : 'N/A'}</div>
                            </div>
                            <div className="purple-card">
                                <div className="card-title">Graded Courses</div>
                                <div className="card-value">{gradedCoursesCount}</div>
                            </div>
                        </div>

                        <div className="purple-table-card" style={{ marginTop: '24px' }}>
                            <div className="table-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3>My Course Registrations</h3>
                                <button className="btn-primary-purple" onClick={openEnrollModal}>+ Enroll New Course</button>
                            </div>
                            <div className="table-responsive">
                                <table className="purple-table">
                                    <thead>
                                        <tr>
                                            <th>Course Code</th>
                                            <th>Course Name</th>
                                            <th>Credits</th>
                                            <th>Semester</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enrollments.length === 0 ? (
                                            <tr><td colSpan="6" className="empty-table">You are not enrolled in any courses yet.</td></tr>
                                        ) : (
                                            enrollments.map(enr => (
                                                <tr key={enr.enrollment_id}>
                                                    <td><span className="code-badge">{enr.course_code}</span></td>
                                                    <td className="dept-name-col">{enr.course_name}</td>
                                                    <td>{enr.credits}</td>
                                                    <td>{enr.semester || 'N/A'}</td>
                                                    <td>
                                                        <span className="status-badge ok">
                                                            {enr.status || 'Enrolled'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className="btn-action delete" onClick={() => handleDropCourse(enr.enrollment_id)}>Drop Course</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* Tab 2: Grades & Attendance */}
                {!loading && !error && activeTab === 'grades' && (
                    <div className="purple-table-card">
                        <div className="table-card-header">
                            <h3>Academic Performance & Attendance</h3>
                        </div>
                        <div className="table-responsive">
                            <table className="purple-table">
                                <thead>
                                    <tr>
                                        <th>Course Code</th>
                                        <th>Course Name</th>
                                        <th>Assigned Grade</th>
                                        <th>Attendance Percentage</th>
                                        <th>Performance Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enrollments.length === 0 ? (
                                        <tr><td colSpan="5" className="empty-table">No academic records found.</td></tr>
                                    ) : (
                                        enrollments.map(enr => (
                                            <tr key={enr.enrollment_id}>
                                                <td><span className="code-badge">{enr.course_code}</span></td>
                                                <td className="dept-name-col">{enr.course_name}</td>
                                                <td><strong>{enr.grade || 'Pending'}</strong></td>
                                                <td>{enr.attendance_percentage !== undefined && enr.attendance_percentage !== null ? `${enr.attendance_percentage}%` : 'N/A'}</td>
                                                <td>
                                                    <span className={`status-badge ${enr.grade ? 'ok' : 'err'}`}>
                                                        {enr.grade ? 'Completed / Graded' : 'In Progress'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab 3: Enhanced Student Profile with Edit Option */}
                {!loading && !error && activeTab === 'profile' && (
                    <div className="profile-container">
                        <div className="purple-table-card profile-card-modern">
                            <div className="profile-header-flex">
                                <div className="profile-avatar-large">
                                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
                                </div>
                                <div className="profile-header-info" style={{ border: 'none', margin: 0, padding: 0 }}>
                                    <h3>{user?.full_name || 'Student'}</h3>
                                    <span className="purple-role-badge">{user?.role || 'Student'}</span>
                                </div>
                                {!isEditingProfile && (
                                    <button className="btn-primary-purple" onClick={() => setIsEditingProfile(true)}>
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            {!isEditingProfile ? (
                                <div className="profile-details-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Full Name</span>
                                        <span className="detail-value">{user?.full_name || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Email Address</span>
                                        <span className="detail-value">{user?.email || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Student ID</span>
                                        <span className="detail-value">#{user?.user_id || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Account Status</span>
                                        <span className="status-badge ok">Active</span>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleProfileUpdate} className="profile-edit-form">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input 
                                            type="text" 
                                            value={fullNameInput} 
                                            onChange={(e) => setFullNameInput(e.target.value)} 
                                            required 
                                            className="purple-input" 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input 
                                            type="email" 
                                            value={emailInput} 
                                            onChange={(e) => setEmailInput(e.target.value)} 
                                            required 
                                            className="purple-input" 
                                        />
                                    </div>
                                    <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                        <button type="button" className="btn-secondary" onClick={() => setIsEditingProfile(false)}>Cancel</button>
                                        <button type="submit" className="btn-primary-purple">Save Changes</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {/* Enroll New Course Modal */}
                {isEnrollModalOpen && (
                    <div className="modal-backdrop">
                        <div className="purple-modal">
                            <h3>Enroll in a New Course</h3>
                            <form onSubmit={handleEnrollSubmit}>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Select Course</label>
                                    <select 
                                        value={selectedCourseToEnroll} 
                                        onChange={(e) => setSelectedCourseToEnroll(e.target.value)} 
                                        required 
                                        className="purple-input"
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                    >
                                        <option value="">-- Choose a course --</option>
                                        {availableCourses.map(course => (
                                            <option key={course.course_id} value={course.course_id}>
                                                {course.course_name} ({course.course_code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button type="button" className="btn-secondary" onClick={() => setIsEnrollModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary-purple">Enroll Now</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default StudentDashboard;