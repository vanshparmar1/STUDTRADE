import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API from '../api/axios';

// ─── Context ─────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── LocalStorage helpers ─────────────────────────────────────────────────────
const TOKEN_KEY = 'studtrade_token';
const USER_KEY = 'studtrade_user';

const readStorage = () => {
    try {
        const token = localStorage.getItem(TOKEN_KEY);
        const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
        return { token, user };
    } catch {
        return { token: null, user: null };
    }
};

const writeStorage = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearStorage = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

// ─── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
    // Hydrate state from localStorage on first render
    const [{ token, user }, setAuth] = useState(readStorage);

    const navigate = useNavigate();

    /**
     * logout — clears state and storage, redirects to /login.
     */
    const logout = useCallback(() => {
        clearStorage();
        setAuth({ token: null, user: null });
        navigate('/login', { replace: true });
    }, [navigate]);

    /**
     * refreshUser — fetches the latest user data from the backend.
     * Useful for updating KYC status or other profile changes.
     */
    const refreshUser = useCallback(async () => {
        if (!token) return;
        try {
            const { data } = await API.get('/auth/me');
            if (data.success) {
                const updatedUser = data.data;
                writeStorage(token, updatedUser);
                setAuth({ token, user: updatedUser });
                return updatedUser;
            }
        } catch (err) {
            // 401 logout is now handled globally by the axios interceptor.
            // We just need to handle any additional local logic if necessary.
            if (import.meta.env.DEV) {
                console.warn('refreshUser failed, keeping session if not 401:', err.message);
            }
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            refreshUser();
        }
    }, [token, refreshUser]);

    /**
     * login — call this after a successful register or login API response.
     */
    const login = useCallback((token, userData, redirectTo = '/') => {
        writeStorage(token, userData);
        setAuth({ token, user: userData });
        navigate(redirectTo, { replace: true });
    }, [navigate]);

    /**
     * updateUser — locally update user data without a full refresh (e.g. toggling saved items)
     */
    const updateUser = useCallback((newUserData) => {
        setAuth(prev => {
            if (!prev.user) return prev;
            const merged = { ...prev.user, ...newUserData };
            writeStorage(prev.token, merged);
            return { token: prev.token, user: merged };
        });
    }, []);

    /** Derived convenience flag */
    const isAuthenticated = Boolean(token && user);

    const value = { user, token, isAuthenticated, login, logout, refreshUser, updateUser };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used inside <AuthProvider>');
    }
    return ctx;
}

export default AuthContext;
