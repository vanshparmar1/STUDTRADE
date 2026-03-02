import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute
 * Wraps a page component and redirects to /login if the user is not
 * authenticated. After login, the user is sent back to the page they
 * originally tried to visit (via `state.from`).
 *
 * Usage:
 *   <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children, requiredRole }) {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    // Not logged in → redirect to /login, remember where they came from
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role check (optional) — redirect home with a 403-style state
    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/" state={{ unauthorized: true }} replace />;
    }

    return children;
}
