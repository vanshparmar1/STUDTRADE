import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
            const { data } = await axios.get('http://localhost:5000/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.success) {
                const updatedUser = data.data;
                writeStorage(token, updatedUser);
                setAuth({ token, user: updatedUser });
                return updatedUser;
            }
        } catch (err) {
            // Only logout on a definitive 401 from the server.
            // Network errors (backend down, ECONNREFUSED, etc.) should NOT
            // log the user out — just fail silently so the cached session persists.
            if (err.response && err.response.status === 401) {
                logout();
            } else {
                console.warn('refreshUser failed (non-401), keeping session:', err.message);
            }
        }
    }, [token, logout]);

    /**
     * login — call this after a successful register or login API response.
     */
    const login = useCallback((token, userData, redirectTo = '/') => {
        writeStorage(token, userData);
        setAuth({ token, user: userData });
        navigate(redirectTo, { replace: true });
    }, [navigate]);

    /** Derived convenience flag */
    const isAuthenticated = Boolean(token && user);

    const value = { user, token, isAuthenticated, login, logout, refreshUser };

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
