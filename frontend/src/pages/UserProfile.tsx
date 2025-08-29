import React, {JSX, useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import api from "../api/axios";
import {toast} from "react-toastify";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import {FaGithub, FaThumbsUp, FaUsers} from "react-icons/fa";

// Video type
interface Video {
    id: number;
    title: string;
    description: string;
    video_file: string;
    uploaded_at: string;
}

// User profile type (includes videos + scores)
interface UserProfileData {
    id: number;
    username: string;
    bio: string;
    github_username: string;
    profile_image: string | null;
    contribution_score: number;
    endorsement_score: number;
    videos: Video[];
}

const UserProfile: React.FC = () => {
    const {id} = useParams<{id: string}>(); // Get :id from route
    const navigate = useNavigate();

    // State for user profile data
    const [user, setUser] = useState<UserProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    //Fetch single user profile by ID
    const fetchUser = async () => {
        if (!id) {
            toast.error("No user id provided in URL");
            setLoading(false);
            return;
        }
        try {
            //Private API endpoint
            const res = await api.get(`/api/users/private/${id}/`);
            console.log("API response:", res.data);
            setUser(res.data);
        } catch (err) {
            toast.error("Failed to load user profile");
        } finally {
            setLoading(false);
        }
    };

    // Run fetchUser when component mounts or when `id` changes
    useEffect(() => {
        fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Show loader while fetching
    if (loading) return <p className="text-center mt-10 text-slate-400">Loading profile...</p>;

    // Show error if no user found
    if (!user) return <p className="text-center mt-10 text-red-400">User not found.</p>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100 px-6 py-10 pt-36">
            <div className="relative max-w-4xl mx-auto">
                {/* Close button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute -top-12 right-0 px-5 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 
                     text-white font-semibold hover:opacity-90 shadow-lg 
                     hover:shadow-red-500/40 transition-all duration-300"
                >
                    ✕ Close
                </button>

                {/* Profile card */}
                <div className="flex items-center gap-8 bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl hover:shadow-teal-500/20 transition">
                    {/* Avatar */}
                    <img
                        src={user.profile_image || "https://www.gravatar.com/avatar/?d=mp&s=200"}
                        alt={user.username}
                        className="w-28 h-28 rounded-full object-cover border-4 border-teal-500 shadow-md"
                    />
                    {/* Username + Bio */}
                    <div>
                        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                            {user.username}
                        </h2>
                        <p className="text-slate-400 mt-1">{user.bio}</p>

                        {/* GitHub link (mandatory) */}
                        {!!user.github_username && (
                            <a
                                href={`https://github.com/${user.github_username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-teal-400 transition"
                            >
                                {FaGithub({className: "text-xl"}) as JSX.Element}@{user.github_username}
                            </a>
                        )}
                    </div>
                </div>

                {/* Scores grid */}
                <div className="grid grid-cols-2 gap-6 mt-8">
                    {/* Endorsement Score */}
                    <div className="flex flex-col items-center bg-slate-900/70 p-6 rounded-xl border border-slate-800 shadow-lg hover:border-teal-400 hover:shadow-teal-500/30 transition duration-300">
                        {FaThumbsUp({className: "text-3xl text-green-400 mb-2"}) as JSX.Element}
                        <span className="text-sm text-slate-400">Endorsement Score</span>
                        <p className="text-2xl font-bold text-white">{user.endorsement_score}</p>
                    </div>
                    {/* Contribution Score */}
                    <div className="flex flex-col items-center bg-slate-900/70 p-6 rounded-xl border border-slate-800 shadow-lg hover:border-blue-400 hover:shadow-blue-500/30 transition duration-300">
                        {FaUsers({className: "text-3xl text-blue-400 mb-2"}) as JSX.Element}
                        <span className="text-sm text-slate-400">Contribution Score</span>
                        <p className="text-2xl font-bold text-white">{user.contribution_score}</p>
                    </div>
                </div>

                {/* Mentoring Videos Section */}
                <div className="mt-10">
                    <h3 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                        🎥 Mentoring Videos
                    </h3>
                    {/* If no videos */}
                    {user.videos.length === 0 ? (
                        <p className="text-slate-500">No videos uploaded.</p>
                    ) : (
                        <div className="space-y-8">
                            {/* Render each video */}
                            {user.videos.map((v) => (
                                <div
                                    key={v.id}
                                    className="bg-slate-900/70 backdrop-blur-lg border border-slate-800 rounded-2xl p-6 shadow-md hover:shadow-emerald-500/20 hover:border-emerald-400 transition"
                                >
                                    <h4 className="text-xl font-bold text-white">{v.title}</h4>
                                    <p className="text-sm text-slate-400 mt-1">{v.description}</p>
                                    {/* Plyr video player */}
                                    <div className="w-full max-w-3xl mx-auto rounded-xl overflow-hidden bg-black flex justify-center mt-5">
                                        <Plyr
                                            source={{
                                                type: "video",
                                                sources: [{src: v.video_file, type: "video/mp4"}],
                                            }}
                                            options={{
                                                controls: [
                                                    "play",
                                                    "progress",
                                                    "current-time",
                                                    "mute",
                                                    "volume",
                                                    "fullscreen",
                                                ],
                                            }}
                                            style={{
                                                width: "100%",
                                                height: "auto",
                                                maxHeight: "80vh",
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Uploaded: {new Date(v.uploaded_at).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
