import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminService } from '../../services/adminService';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                setLoading(true);
                setError('');

                const [statsData, logsData] = await Promise.all([
                    adminService.getDashboardStats(),
                    adminService.getApiLogs()
                ]);

                setStats(statsData.statistics);
                setLogs(logsData.logs || []);
            } catch (err) {
                console.error('Error loading admin dashboard:', err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchAdminData();
        }
    }, [token]);

    if (loading) {
        return (
            <DashboardLayout title="Dashboard Overview">
                <div className="purple-loading">Loading system overview...</div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout title="Dashboard Overview">
                <div className="purple-error">Error: {error}</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Dashboard Overview">
            <div className="purple-dashboard-wrapper">
                
                {/* Action Bar with Department Management Button */}
                <div className="action-bar" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                    <button 
                        className="btn-primary-purple" 
                        onClick={() => navigate('/admin/departments')}
                        style={{
                            backgroundColor: '#7e22ce',
                            color: 'white',
                            border: 'none',
                            padding: '10px 18px',
                            borderRadius: '6px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        Manage Departments
                    </button>
                </div>

                {/* 1. Top Stats Cards Grid */}
                <div className="purple-stats-grid">
                    <div className="purple-card accent-card">
                        <div className="card-header-info">
                            <span className="card-title">Total Users</span>
                        </div>
                        <div className="card-value">{stats?.total_users ?? 0}</div>
                    </div>

                    <div className="purple-card">
                        <div className="card-header-info">
                            <span className="card-title">Departments</span>
                        </div>
                        <div className="card-value">{stats?.total_departments ?? 0}</div>
                    </div>

                    <div className="purple-card">
                        <div className="card-header-info">
                            <span className="card-title">Courses</span>
                        </div>
                        <div className="card-value">{stats?.total_courses ?? 0}</div>
                    </div>

                    <div className="purple-card">
                        <div className="card-header-info">
                            <span className="card-title">Enrollments</span>
                        </div>
                        <div className="card-value">{stats?.total_enrollments ?? 0}</div>
                    </div>
                </div>

                {/* 2. Telemetry Cards */}
                <div className="purple-telemetry-grid">
                    <div className="purple-card">
                        <span className="card-title">Total API Requests</span>
                        <div className="card-value purple-text">{stats?.total_api_requests ?? 0}</div>
                    </div>
                    <div className="purple-card">
                        <span className="card-title">Average Response Latency</span>
                        <div className="card-value purple-text">{stats?.average_response_time_ms ?? 0} <span className="unit">ms</span></div>
                    </div>
                </div>

                {/* 3. API Logs Table */}
                <div className="purple-table-card">
                    <div className="table-card-header">
                        <h3>Recent System API Logs</h3>
                    </div>

                    <div className="table-responsive">
                        <table className="purple-table">
                            <thead>
                                <tr>
                                    <th>HTTP Method</th>
                                    <th>Endpoint Signature</th>
                                    <th>Status</th>
                                    <th>Response Time</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="empty-table">No API logs available.</td>
                                    </tr>
                                ) : (
                                    logs.slice(0, 15).map((log) => (
                                        <tr key={log.log_id}>
                                            <td>
                                                <span className={`method-badge ${log.http_method.toLowerCase()}`}>
                                                    {log.http_method}
                                                </span>
                                            </td>
                                            <td className="endpoint-col">{log.api_endpoint}</td>
                                            <td>
                                                <span className={`status-badge ${log.status_code < 400 ? 'ok' : 'err'}`}>
                                                    {log.status_code}
                                                </span>
                                            </td>
                                            <td>{log.response_time_ms} ms</td>
                                            <td>{new Date(log.timestamp).toLocaleString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;