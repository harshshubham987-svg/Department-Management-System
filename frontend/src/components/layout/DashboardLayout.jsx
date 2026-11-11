import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './DashboardLayout.css';

const DashboardLayout = ({ children, title }) => {
    return (
        <div className="dashboard-layout-container">
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="dashboard-content-wrapper">
                <Topbar title={title} />
                
                <main className="dashboard-page-body">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;