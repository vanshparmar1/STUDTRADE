import axios from 'axios';
import toast from 'react-hot-toast';

// ─── Constants ─────────────────────────────────────────────────────────────
const TOKEN_KEY = 'studtrade_token';
const USER_KEY = 'studtrade_user';

/**
 * In dev: VITE_API_URL is unset → baseURL = '/api' → Vite proxy forwards to localhost:5000
 * In prod: VITE_API_URL = 'https://your-app.up.railway.app' → requests go directly to Railway
 */
const BASE_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api';

// Create instance
const API = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // required for cookies / credentials (also satisfies CORS credentials mode)
});

// ─── Request Interceptor ───────────────────────────────────────────────────
/**
 * Automatically attach the Authorization header if a token exists in localStorage.
 */
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor ──────────────────────────────────────────────────
/**
 * Handle 401 Unauthorized globally:
 * 1. Clear local session.
 * 2. Redirect to login.
 * 3. Show a descriptive toast.
 * 
 * Handle other errors:
 * 1. Extract error message from API response.
 * 2. Show toast.
 */
API.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response ? error.response.status : null;
        const message = error.response?.data?.message || error.message || 'Something went wrong';

        if (status === 401) {
            // Clear storage
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);

            // Notify
            toast.error('Session expired. Please login again.');

            // Redirect — using window.location for a hard reset to clear all state
            // Only redirect if we're not already on the login/register pages
            if (!['/login', '/register', '/verify-email'].includes(window.location.pathname)) {
                window.location.href = '/login';
            }
        } else {
            // Show toast for other errors (except for specific cases where we might want silent handling)
            // We can add logic here to filter out certain errors if needed.
            toast.error(message);
        }

        return Promise.reject(error);
    }
);

export default API;
