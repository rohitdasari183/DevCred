import React, {useState, useContext} from "react";
import {useNavigate, Link} from "react-router-dom";
import {toast} from "react-toastify";
import {AuthContext} from "../context/AuthContext";

const Login: React.FC = () => {
    const auth = useContext(AuthContext)!; // Access global authentication context
    const navigate = useNavigate(); // For navigation after login

    // Form state (username + password)
    const [form, setForm] = useState({username: "", password: ""});
    const [loading, setLoading] = useState(false); // Show loading state while logging in

    // Update form fields on change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm({...form, [e.target.name]: e.target.value});

    // Handle login request
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await auth.login(form.username, form.password); // Call login function from context
            toast.success("Welcome back!");
            navigate("/dashboard"); // Redirect user after login
        } catch (err: any) {
            toast.error(err.response?.data?.detail || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-hidden">
            {/* Decorative glowing background orbs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>

            {/* Login Card */}
            <div className="relative z-10 bg-gray-900/80 backdrop-blur-2xl border border-emerald-800 rounded-2xl shadow-2xl p-8 w-full max-w-md hover:shadow-cyan-500/40 transition-all duration-500">
                <h2 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-lime-400 mb-8 tracking-wide animate-fade-in">
                    Welcome Back
                </h2>
                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <input
                            name="username"
                            placeholder="Username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 group-hover:border-cyan-400"
                        />
                        {/* Fancy underline effect */}
                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                    </div>
                    <div className="relative group">
                        {/* Password input */}
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 group-hover:border-emerald-400"
                        />
                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-cyan-400 to-lime-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                    </div>
                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold p-4 rounded-lg shadow-lg hover:shadow-lime-400/40 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
                <p className="text-sm text-center mt-8 text-gray-400">
                    Don’t have an account? {/* Link to Sign Up */}
                    <Link
                        to="/signup"
                        className="text-cyan-400 hover:text-emerald-400 transition-colors duration-300 underline-offset-4 hover:underline"
                    >
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
