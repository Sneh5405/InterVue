import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// Queue to hold failed requests during token refresh to avoid concurrent refresh token rotation race conditions
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(api(prom.config));
        }
    });
    failedQueue = [];
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialize user from local storage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Setup Axios Interceptors for Token Refresh
    useEffect(() => {
        const responseInterceptor = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                const url = originalRequest?.url || '';
                const isAuthRequest = url.includes('/login') || url.includes('/logout') || url.includes('/refresh-token');

                if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRequest) {
                    originalRequest._retry = true;

                    if (isRefreshing) {
                        return new Promise((resolve, reject) => {
                            failedQueue.push({ resolve, reject, config: originalRequest });
                        });
                    }

                    isRefreshing = true;

                    return new Promise((resolve, reject) => {
                        api.post('/refresh-token')
                            .then(() => {
                                isRefreshing = false;
                                processQueue(null);
                                resolve(api(originalRequest));
                            })
                            .catch((refreshError) => {
                                isRefreshing = false;
                                processQueue(refreshError);
                                logout(); // If refresh fails, force logout
                                reject(refreshError);
                            });
                    });
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/login', { email, password });
        const { user } = response.data;

        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return user;
    };

    const signup = async (data) => {
        // Signup is handled mostly by the component, but we could add auto-login logic here
        // For now, keeping it basic
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
