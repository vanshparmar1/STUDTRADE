import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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
     * login — call this after a successful register or login API response.
     * @param {string} token
     * @param {object} userData
     * @param {string} [redirectTo='/']
     */
    const login = useCallback((token, userData, redirectTo = '/') => {
        writeStorage(token, userData);
        setAuth({ token, user: userData });
        navigate(redirectTo, { replace: true });
    }, [navigate]);

    /**
     * logout — clears state and storage, redirects to /login.
     */
    const logout = useCallback(() => {
        clearStorage();
        setAuth({ token: null, user: null });
        navigate('/login', { replace: true });
    }, [navigate]);

    /** Derived convenience flag */
    const isAuthenticated = Boolean(token && user);

    const value = { user, token, isAuthenticated, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
/**
 * useAuth — consume auth context anywhere in the component tree.
 * @returns {{ user, token, isAuthenticated, login, logout }}
 */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used inside <AuthProvider>');
    }
    return ctx;
}

export default AuthContext;
