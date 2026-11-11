import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { departmentService } from '../../services/departmentService';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        department_id: '',
        role: 'Student'
    });
    
    const [departments, setDepartments] = useState([]);
    const [deptLoading, setDeptLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const data = await departmentService.getAllDepartments();
                const deptList = Array.isArray(data) ? data : (data.departments || []);
                setDepartments(deptList);
            } catch (err) {
                console.error('Error fetching departments:', err.message);
                setError('Could not load departments list. Please refresh the page.');
            } finally {
                setDeptLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await authService.register({
                ...formData,
                department_id: formData.department_id ? Number(formData.department_id) : null
            });

            setSuccess('Account created successfully! Redirecting...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card register-card">
                <div className="auth-header">
                    <h2>Get Started</h2>
                    <p>Create your Department Management account</p>
                </div>

                {error && <div className="auth-alert error">{error}</div>}
                {success && <div className="auth-alert success">{success}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-row">
                        <div className="input-group">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                name="full_name" 
                                value={formData.full_name} 
                                onChange={handleChange} 
                                placeholder="John Doe"
                                required 
                            />
                        </div>
                        <div className="input-group">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                placeholder="name@example.com"
                                required 
                            />
                        </div>
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <label>Password</label>
                            <input 
                                type="password" 
                                name="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                placeholder="••••••••"
                                required 
                            />
                        </div>
                        <div className="input-group">
                            <label>Phone Number</label>
                            <input 
                                type="text" 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleChange} 
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <label>Department</label>
                            <select 
                                name="department_id" 
                                value={formData.department_id} 
                                onChange={handleChange} 
                                required
                            >
                                <option value="">
                                    {deptLoading ? 'Loading departments...' : 'Select Department'}
                                </option>
                                {departments.map((dept) => (
                                    <option key={dept.dept_id} value={dept.dept_id}>
                                        {dept.dept_name} ({dept.dept_code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Role</label>
                            <select name="role" value={formData.role} onChange={handleChange} required>
                                <option value="Student">Student</option>
                                <option value="Teacher">Teacher</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? <span className="spinner"></span> : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Sign In</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;