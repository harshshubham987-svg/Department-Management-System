import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import Courses from './pages/admin/Courses';
import UserManagement from './pages/admin/UserManagement';
import EnrollmentManagement from './pages/admin/EnrollmentManagement';


function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Default Redirect */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    
                    {/* Public Auth Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Role-Protected Dashboards */}
                    <Route 
                        path="/admin/dashboard" 
                        element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/admin/departments" 
                        element={
                            <ProtectedRoute allowedRoles={['Admin']}>
                            <DepartmentManagement />
                            </ProtectedRoute>
                        } 
                    />
                    {/* // AppRoutes ya Routes ke andar yeh route add karein: */}
                    <Route path="/admin/courses" element={<Courses />} />

                    {/* // Route inside App.jsx: */}
                    <Route path="/admin/users" element={<UserManagement />} />

                    {/* // Inside routes: */}
                    <Route path="/admin/enrollments" element={<EnrollmentManagement />} />
                    <Route 
                        path="/teacher/dashboard" 
                        element={
                            <ProtectedRoute allowedRoles={['Teacher']}>
                                <TeacherDashboard />
                            </ProtectedRoute>
                        } 
                    />
                    <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                    <Route 
                        path="/student/dashboard" 
                        element={
                            <ProtectedRoute allowedRoles={['Student']}>
                                <StudentDashboard />
                            </ProtectedRoute>
                        } 
                    />
                    {/* // Route setup: */}
                    <Route path="/student/dashboard" element={<StudentDashboard />} />

                    {/* Fallback Catch-all */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;