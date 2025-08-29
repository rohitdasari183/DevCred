import React, {JSX, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import api from "../api/axios";
import {toast} from "react-toastify";
import {FaGithub, FaUserPlus, FaEye} from "react-icons/fa";

// Define User interface for type safety
interface User {
    id: number;
    username: string;
    bio: string;
    github_username: string;
    profile_image: string | null;
}

const UsersList: React.FC = () => {
    // State for users list
    const [users, setUsers] = useState<User[]>([]);
    // Loading state
    const [loading, setLoading] = useState(true);
    // Search query state
    const [search, setSearch] = useState("");

    // Fetch all users from backend API
    const fetchUsers = async () => {
        try {
            const res = await api.get("/api/users/");
            setUsers(res.data);
        } catch (err) {
            toast.error("Failed to load users");
            console.error("Users fetch error:", err); // Show error notification
        } finally {
            setLoading(false);
        }
    };

    // Run fetchUsers once when component mounts
    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle endorsing a user
    const endorseUser = async (id: number, username: string) => {
        try {
            // Send endorsement request to backend
            await api.post("/api/endorsements/", {
                endorsed_user: id,
                endorsed_user_username: username,
            });
            toast.success(`You endorsed ${username}`);
            fetchUsers(); // Refresh user list after endorsement
        } catch (err: any) {
            console.error("Endorsement error:", err.response?.data || err.message);
            toast.error("You cannot endorse yourself");
        }
    };

    const filtered = users.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()));

    // Show loading message while fetching users
    if (loading) return <p className="text-center mt-10 text-yellow-400">Loading users...</p>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-yellow-100 px-6 py-12 pt-28 relative overflow-hidden">
            {/* Golden shimmer background */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.1),transparent_70%)]"></div>
            {/* Subtle background texture */}
            <div className="absolute inset-0 -z-20 bg-[url('https://www.transparenttextures.com/patterns/gplay.png')] opacity-5"></div>
            {/* Title */}
            <h2 className="text-4xl font-extrabold mb-12 text-center bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,215,0,0.6)]">
                Browse & Endorse Developers
            </h2>

            {/* Search bar */}
            <div className="max-w-xl mx-auto mb-12">
                <input
                    type="text"
                    placeholder="🔍 Search developers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl bg-black/70 border border-yellow-500/30 
                     text-yellow-100 placeholder-yellow-600 shadow-lg 
                     focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 
                     transition-all duration-500"
                />
            </div>

            {filtered.length === 0 ? (
                <p className="text-center text-yellow-500">No users found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filtered.map((u) => (
                        <div
                            key={u.id}
                            className="relative group bg-black/70 border border-yellow-700 rounded-2xl 
                         p-6 flex flex-col items-center backdrop-blur-xl
                         shadow-[0_0_25px_rgba(255,215,0,0.15)] 
                         hover:shadow-[0_0_45px_rgba(255,215,0,0.5)] 
                         transition-all duration-500 hover:-translate-y-3"
                        >
                            {/* Golden border glow */}
                            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-yellow-400 group-hover:animate-pulse pointer-events-none"></div>

                            {/* Profile Image */}
                            <img
                                src={u.profile_image || "https://www.gravatar.com/avatar/?d=mp&s=200"}
                                alt={u.username}
                                className="w-24 h-24 rounded-full object-cover border-4 border-yellow-800 
                           group-hover:border-yellow-400 transition-all duration-500 shadow-xl"
                            />

                            {/* Username & Bio */}
                            <h3 className="mt-5 text-xl font-bold text-yellow-200 group-hover:text-yellow-400 transition-all duration-500">
                                {u.username}
                            </h3>
                            <p className="text-sm text-yellow-500 text-center mt-2 line-clamp-3">{u.bio}</p>

                            {/* GitHub */}
                            {u.github_username && (
                                <a
                                    href={`https://github.com/${u.github_username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-200 transition"
                                >
                                    {FaGithub({className: "text-lg"}) as JSX.Element}@{u.github_username}
                                </a>
                            )}

                            {/* Action buttons: Endorse + View Profile */}
                            <div className="mt-6 flex flex-col gap-3 w-full">
                                <button
                                    onClick={() => endorseUser(u.id, u.username)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg 
                             border border-yellow-400 text-yellow-300 font-semibold 
                             bg-gradient-to-r from-transparent to-transparent 
                             hover:from-yellow-500/20 hover:to-yellow-600/40 
                             shadow-md hover:shadow-yellow-500/50 
                             transition-all duration-500"
                                >
                                    {FaUserPlus({className: "text-sm"}) as JSX.Element}
                                    Endorse
                                </button>

                                {/* View Profile button */}
                                <Link
                                    to={`/users/${u.id}`}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg 
                             border border-amber-500 text-amber-300 font-semibold 
                             bg-gradient-to-r from-transparent to-transparent 
                             hover:from-amber-500/20 hover:to-amber-600/40 
                             shadow-md hover:shadow-amber-500/50 
                             transition-all duration-500"
                                >
                                    {FaEye({className: "text-sm"}) as JSX.Element}
                                    View Profile
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UsersList;
