import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const role = user?.role || 'Student'; // Default role fallback

    return (
        <aside className="purple-sidebar">
            <div className="sidebar-brand">
                <h2>DeptManager</h2>
                <span className="purple-role-badge">{role}</span>
            </div>
            
            <nav className="purple-menu">
                {/* Common / Dashboard Link */}
                <Link to='/admin/dashboard' className="purple-menu-item">
                    Dashboard
                </Link>

                {/* Admin Specific Links */}
                {role === 'Admin' && (
                    <>
                        

                        <Link to="/admin/departments" className="purple-menu-item">
                            Departments
                        </Link>
                        <Link to="/admin/courses" className="purple-menu-item">
                            Courses
                        </Link>
                        <Link to="/admin/users" className="purple-menu-item">
                            Users
                        </Link>
                        <Link to="/admin/enrollments" className="purple-menu-item">
                            Enrollments
                        </Link>
                    </>
                )}

                {/* Teacher Specific Links */}
                {role === 'Teacher' && (
                    <Link to="/teacher/dashboard" className="purple-menu-item">
                        
                    </Link>
                )}

                
            </nav>

            <div className="sidebar-footer">
                <button onClick={logout} className="purple-logout-btn">
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;