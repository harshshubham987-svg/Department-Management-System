import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restore session on page refresh
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse stored user:', e);
                localStorage.clear();
            }
        }
        setLoading(false);
    }, []);

    const login = (accessToken, refreshToken, userData) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(accessToken);
        setUser(userData);
    };

    // Inside AuthContext logout function:
const logout = () => {
        try {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        } catch (e) {
            console.error('Error clearing storage:', e);
        }
        setToken(null);
        setUser(null);
    };

    // Inside user initialization state reader:
    let initialUser = null;
    try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            initialUser = JSON.parse(savedUser);
        }
    } catch (e) {
        console.error('Invalid user JSON in storage, clearing keys.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }
    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);