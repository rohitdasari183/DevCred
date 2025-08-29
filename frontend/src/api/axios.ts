import axios from "axios";

// Create a custom axios instance pointing to your Django backend
const instance = axios.create({
    baseURL: "http://localhost:8000", // Django backend base URL
});

// Intercept every request before it is sent
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    // Endpoints that don't require authentication
    const publicPaths = ["/api/users/signup/", "/api/auth/login/"];

    // check if current request URL matches any public path
    const isPublic = publicPaths.some((path) => config.url?.includes(path));

    if (token && !isPublic) {
        // attach token only for protected endpoints
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        // ensure no Authorization header is sent for public requests
        delete config.headers.Authorization;
    }

    return config;
});

export default instance;
