import React, { createContext, useState, useEffect, ReactNode } from "react";
import axios from "../api/axios";

// User type that matches your Django backend fields
interface User {
  id?: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  address?: string;
  date_of_birth?: string;
  github_username?: string;
  bio?: string;
  profile_image?: string;
}

// Shape of the authentication context
interface AuthContextType {
  user: User | null;  // current logged-in user
  loading: boolean;  // loading state while fetching
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (data: any) => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create Context (default = undefined so we know if it's missing)
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps the entire app
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);    // store logged-in user
  const [loading, setLoading] = useState<boolean>(true); // track loading

    // Refresh the logged-in user from backend (/me/ endpoint)
  const refreshUser = async () => {
    const token = localStorage.getItem("token");  // token saved in localStorage
    if (!token) {
      // no token → user is logged out
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      // Ask backend who the current user is
      const res = await axios.get("/api/users/me/");
      setUser(res.data);
    } catch (err: any) {
      // Token is invalid or expired
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Log in a user and save token
  const login = async (username: string, password: string) => {
    const res = await axios.post("/api/auth/login/", { username, password });
    const { access } = res.data;   // backend returns { access: "JWT..." }
    localStorage.setItem("token", access);  // save JWT in localStorage
    await refreshUser();  // update user state after login
  };

  // Log out a user (clear token + reset user)
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // Sign up new user (supports FormData for profile image)
  const signup = async (data: any) => {
    let config: any = { headers: {} };

    // if profile image is uploaded → use multipart/form-data
    if (data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else {
      config.headers["Content-Type"] = "application/json";
    }
    await axios.post("/api/users/signup/", data, config);
  };

  // On first render, check if there's a user (auto-login if token exists)
  useEffect(() => {
    refreshUser();
  }, []);

  // Provide auth state + actions to the entire app
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
