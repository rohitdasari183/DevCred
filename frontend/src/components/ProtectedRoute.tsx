// src/components/ProtectedRoute.tsx
import React, {JSX, useContext} from "react";
import {Navigate} from "react-router-dom";
import {AuthContext} from "../context/AuthContext";

// - Higher-order component for route protection
// - Wraps any route/page that should only be accessible to logged-in users
const ProtectedRoute = ({children}: {children: JSX.Element}) => {
    const auth = useContext(AuthContext); // Get authentication state from context

    // If AuthContext is missing, redirect to login
    if (!auth) return <Navigate to="/login" replace />;

    // Show loading state while checking authentication
    if (auth.loading) return <div className="p-6">Loading...</div>;

    // If no user is logged in, redirect to login
    if (!auth.user) return <Navigate to="/login" replace />;

    // Otherwise, allow access to the protected page
    return children;
};

export default ProtectedRoute;
