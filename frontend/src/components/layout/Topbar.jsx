import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './Topbar.css';

const Topbar = ({ title }) => {
    const { user } = useAuth();

    return (
        <header className="purple-topbar">
            {/* Left side: Page Title & User Email */}
            <div className="topbar-left">
                <h2>{title}</h2>
                <span className="topbar-user-email">{user?.email || 'admin@college.edu'}</span>
            </div>

            {/* Right side: User Name & Avatar Icon */}
            <div className="topbar-right">
                <div className="user-texts">
                    <span className="u-name">{user?.full_name || 'Admin Boss'}</span>
                    <span className="u-role-label">{user?.role || 'Administrator'}</span>
                </div>
                <div className="purple-avatar">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
                </div>
            </div>
        </header>
    );
};

export default Topbar;