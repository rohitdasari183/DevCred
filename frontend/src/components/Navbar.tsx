// src/components/Navbar.tsx
import React, {JSX, useContext, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {FaUser, FaSignOutAlt} from "react-icons/fa";
import {AuthContext} from "../context/AuthContext";

const Navbar: React.FC = () => {
    const auth = useContext(AuthContext)!; // access authentication state/context
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false); // controls dropdown menu visibility

    // Handles user logout
    const handleLogout = () => {
        auth.logout(); // clear auth state (token/user)
        navigate("/login"); // redirect to login page
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
            <div className="flex justify-between items-center max-w-7xl mx-auto px-6 py-4">
                {/* Brand */}
                <Link
                    to="/"
                    className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-pink-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent drop-shadow-lg hover:opacity-90 transition"
                >
                    DevCred
                </Link>

                {/* Main Navigation (hidden on mobile) */}
                <div className="hidden md:flex space-x-10 font-semibold">
                    <Link to="/dashboard" className="relative text-slate-300 hover:text-white transition group">
                        Dashboard
                        {/* underline animation effect */}
                        <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-cyan-400 to-pink-400 rounded-full transition-all group-hover:w-full"></span>
                    </Link>
                    <Link to="/resume" className="relative text-slate-300 hover:text-white transition group">
                        Resume Generator
                        <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-amber-400 to-purple-400 rounded-full transition-all group-hover:w-full"></span>
                    </Link>
                </div>

                {/* Auth Section (depends on whether user is logged in) */}
                <div className="relative flex items-center space-x-4">
                    {auth.user ? (
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center space-x-2 px-3 py-2 rounded-full border border-slate-700 bg-slate-900/70 backdrop-blur-lg hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(34,211,238,0.6)] transition"
                            >
                                <span className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-sm font-bold text-black">
                                    {auth.user.username?.charAt(0).toUpperCase() || "U"}
                                </span>
                            </button>

                            {/* Dropdown menu */}
                            {menuOpen && (
                                <div className="absolute right-0 mt-3 w-44 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-xl shadow-lg py-2 text-slate-300 animate-fade-in">
                                    <Link
                                        to="/dashboard"
                                        className="block px-4 py-2 hover:bg-slate-800/60 rounded-md transition"
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        to={`/profile/public/${auth.user.username}`}
                                        className="block px-4 py-2 hover:bg-slate-800/60 rounded-md transition"
                                    >
                                        Share Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full px-4 py-2 hover:bg-slate-800/60 rounded-md transition"
                                    >
                                        {
                                            FaSignOutAlt({
                                                className: "mr-2 text-rose-400",
                                            }) as JSX.Element
                                        }
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Not logged-in: show Login button
                        <Link
                            to="/login"
                            className="flex items-center px-5 py-2 rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-purple-500 text-black font-semibold hover:opacity-90 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)] transition"
                        >
                            {
                                FaUser({
                                    className: "mr-2",
                                }) as JSX.Element
                            }
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
