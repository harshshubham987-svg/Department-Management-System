import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { userService } from '../../services/userService';
import { departmentService } from '../../services/departmentService';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    
    // Stats State
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        activeUsers: 0,
        inactiveUsers: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Search & Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Modal States
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
        fetchDepartments();
        fetchStats();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getAllUsers();
            const userList = data.users || data || [];
            setUsers(userList);
            setFilteredUsers(userList);
        } catch (err) {
            console.error('Error fetching users:', err.message);
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

    const fetchStats = async () => {
        try {
            const data = await userService.getAdminDashboardStats();
            if (data) {
                setStats({
                    totalUsers: data.totalUsers || data.total_users || 0,
                    totalStudents: data.totalStudents || data.total_students || 0,
                    totalTeachers: data.totalTeachers || data.total_teachers || 0,
                    activeUsers: data.activeUsers || data.active_users || 0,
                    inactiveUsers: data.inactiveUsers || data.inactive_users || 0
                });
            }
        } catch (err) {
            console.error('Error fetching stats:', err.message);
        }
    };

    // Filter Logic (Search, Role, Department, Status)
    useEffect(() => {
        let result = users;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(u => 
                (u.full_name && u.full_name.toLowerCase().includes(term)) ||
                (u.email && u.email.toLowerCase().includes(term))
            );
        }

        if (roleFilter) {
            result = result.filter(u => u.role === roleFilter);
        }

        if (deptFilter) {
            result = result.filter(u => String(u.department_id) === String(deptFilter));
        }

        if (statusFilter !== '') {
            const isActiveBool = statusFilter === 'true';
            result = result.filter(u => u.is_active === isActiveBool);
        }

        setFilteredUsers(result);
    }, [searchTerm, roleFilter, deptFilter, statusFilter, users]);

    const openViewModal = (user) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    return (
        <DashboardLayout title="User Management">
            <div className="purple-dashboard-wrapper">
                
                {/* 1. Users Dashboard Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Users</h3>
                        <p className="stat-number">{stats.totalUsers || users.length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Students</h3>
                        <p className="stat-number">{stats.totalStudents || users.filter(u => u.role === 'Student').length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Teachers</h3>
                        <p className="stat-number">{stats.totalTeachers || users.filter(u => u.role === 'Teacher').length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Active Users</h3>
                        <p className="stat-number success">{stats.activeUsers || users.filter(u => u.is_active !== false).length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Inactive Users</h3>
                        <p className="stat-number warning">{stats.inactiveUsers || users.filter(u => u.is_active === false).length}</p>
                    </div>
                </div>

                {/* 4. Search & Filter Bar */}
                <div className="department-action-bar">
                    <div className="search-box">
                        <input 
                            type="text" 
                            placeholder="Search by Name or Email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="purple-input"
                        />
                    </div>

                    <div className="filter-box">
                        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="purple-input">
                            <option value="">All Roles</option>
                            <option value="Admin">Admin</option>
                            <option value="Teacher">Teacher</option>
                            <option value="Student">Student</option>
                        </select>
                    </div>

                    <div className="filter-box">
                        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="purple-input">
                            <option value="">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept.dept_id} value={dept.dept_id}>{dept.dept_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-box">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="purple-input">
                            <option value="">All Statuses</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                </div>

                {loading && <div className="purple-loading">Loading users...</div>}
                {error && <div className="purple-error">Error: {error}</div>}

                {/* 2. Users List Table */}
                {!loading && !error && (
                    <div className="purple-table-card">
                        <div className="table-responsive">
                            <table className="purple-table">
                                <thead>
                                    <tr>
                                        <th>User ID</th>
                                        <th>Full Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Department</th>
                                        <th>Phone</th>
                                        <th>Status</th>
                                        <th>Created At</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="empty-table">No users found matching your criteria.</td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.user_id}>
                                                <td><span className="code-badge">#{user.user_id}</span></td>
                                                <td className="dept-name-col">{user.full_name}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <span className={`role-badge ${user.role ? user.role.toLowerCase() : 'student'}`}>
                                                        {user.role || 'Student'}
                                                    </span>
                                                </td>
                                                <td>{user.department_name || departments.find(d => d.dept_id === user.department_id)?.dept_name || 'N/A'}</td>
                                                <td>{user.phone || 'N/A'}</td>
                                                <td>
                                                    <span className={`status-pill ${user.is_active === false ? 'inactive' : 'active'}`}>
                                                        {user.is_active === false ? 'Inactive' : 'Active'}
                                                    </span>
                                                </td>
                                                <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button className="btn-action view" onClick={() => openViewModal(user)}>View</button>
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

                {/* 3. User Details Modal (Password Hash excluded securely) */}
                {isViewModalOpen && selectedUser && (
                    <div className="modal-backdrop">
                        <div className="purple-modal">
                            <h3>User Profile Details</h3>
                            <div className="details-grid">
                                <p><strong>User ID:</strong> #{selectedUser.user_id}</p>
                                <p><strong>Full Name:</strong> {selectedUser.full_name}</p>
                                <p><strong>Email Address:</strong> {selectedUser.email}</p>
                                <p><strong>Role:</strong> {selectedUser.role || 'Student'}</p>
                                <p><strong>Department:</strong> {selectedUser.department_name || departments.find(d => d.dept_id === selectedUser.department_id)?.dept_name || 'N/A'}</p>
                                <p><strong>Phone Number:</strong> {selectedUser.phone || 'N/A'}</p>
                                <p><strong>Account Status:</strong> {selectedUser.is_active === false ? 'Inactive' : 'Active'}</p>
                                <p><strong>Account Created:</strong> {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString() : 'N/A'}</p>
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

export default UserManagement;