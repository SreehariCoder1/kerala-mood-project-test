import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const apiUrl = import.meta.env.PROD ? '/api/auth' : 'http://localhost:5000/api/auth';

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            // Check for token in URL (from OAuth redirect)
            const params = new URLSearchParams(window.location.search);
            const urlToken = params.get('token');
            const urlError = params.get('error');

            if (urlError) {
                console.error('OAuth error:', urlError);
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }

            if (urlToken) {
                localStorage.setItem('token', urlToken);
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            const token = localStorage.getItem('token');
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const response = await axios.get(`${apiUrl}/me`);
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    };

    const register = async (username, email, password) => {
        const response = await axios.post(`${apiUrl}/register`, {
            username,
            email,
            password
        });
        localStorage.setItem('token', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setUser(response.data.user);
        return response.data;
    };

    const login = async (email, password) => {
        const response = await axios.post(`${apiUrl}/login`, {
            email,
            password
        });
        localStorage.setItem('token', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setUser(response.data.user);
        return response.data;
    };

    const logout = async () => {
        try {
            await axios.post(`${apiUrl}/logout`);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
        }
    };

    const value = {
        user,
        loading,
        register,
        login,
        logout,
        checkAuth
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
