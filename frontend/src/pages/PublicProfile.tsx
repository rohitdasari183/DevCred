import React, {JSX, useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import axios from "axios";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import {FaGithub, FaShareAlt, FaCopy, FaTimesCircle} from "react-icons/fa";

// Video object type
interface Video {
    id: number;
    title: string;
    description: string;
    video_file: string;
    uploaded_at: string;
}

//Public profile user type
interface PublicUser {
    id: number;
    username: string;
    bio: string;
    github_username: string;
    profile_image: string | null;
    contribution_score: number;
    endorsement_score: number;
    videos: Video[];
}

const PublicProfile: React.FC = () => {
    const {username} = useParams<{username: string}>();
    const [user, setUser] = useState<PublicUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [showShare, setShowShare] = useState(false);
    const navigate = useNavigate();

    //Fetch public profile when component mounts or username changes
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/users/public/${username}/`);
                setUser(res.data);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [username]);

    //Loading / Not found states
    if (loading) return <p className="text-center text-slate-400 mt-10">Loading profile...</p>;
    if (!user) return <p className="text-center text-red-400 mt-10">Profile not found</p>;

    const shareLink = `${window.location.origin}/profile/public/${user.username}`;

    // Copy share link to clipboard
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            alert("✅ Profile link copied to clipboard!");
        } catch {
            alert("❌ Failed to copy link");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100 px-6 py-10 pt-36">
            <div className="max-w-5xl mx-auto">
                {/* Profile Header */}
                <div className="flex items-center gap-8 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg relative">
                    {/* Avatar */}
                    <img
                        src={user.profile_image || "https://www.gravatar.com/avatar/?d=mp&s=200"}
                        alt={user.username}
                        className="w-28 h-28 rounded-full object-cover border-4 border-cyan-400 shadow-md"
                    />
                    {/* Basic Info */}
                    <div>
                        <h2 className="text-3xl font-bold text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.55)]">
                            {user.username}
                        </h2>
                        <p className="text-slate-400 mt-1">{user.bio}</p>
                        {/* GitHub link */}
                        {user.github_username && (
                            <a
                                href={`https://github.com/${user.github_username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-2 group"
                            >
                                {
                                    FaGithub({
                                        className:
                                            "text-5xl mb-2 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.55)] group-hover:scale-110 transition-transform duration-300",
                                    }) as JSX.Element
                                }
                                <span className="text-slate-300 hover:text-cyan-400">@{user.github_username}</span>
                            </a>
                        )}
                    </div>

                    {/* Share Button */}
                    <button
                        onClick={() => setShowShare(true)}
                        className="absolute top-4 right-4 bg-cyan-500/20 p-3 rounded-full hover:bg-cyan-500/30 transition"
                    >
                        {
                            FaShareAlt({
                                className: "text-cyan-400 text-xl",
                            }) as JSX.Element
                        }
                    </button>
                </div>

                {/* Scores Section */}
                <div className="grid grid-cols-2 gap-6 mt-8">
                    <div className="bg-slate-900/70 p-6 rounded-xl border border-slate-800 text-center group hover:scale-105 transition">
                        <span className="text-slate-400 text-sm">Endorsements</span>
                        <p className="text-2xl font-bold text-cyan-300">{user.endorsement_score}</p>
                    </div>
                    <div className="bg-slate-900/70 p-6 rounded-xl border border-slate-800 text-center group hover:scale-105 transition">
                        <span className="text-slate-400 text-sm">Contributions</span>
                        <p className="text-2xl font-bold text-cyan-300">{user.contribution_score}</p>
                    </div>
                </div>

                {/* Videos Section */}
                <div className="mt-10">
                    <h3 className="text-xl font-semibold text-cyan-400 mb-4">🎥 Mentoring Videos</h3>
                    {user.videos.length === 0 ? (
                        <p className="text-slate-500">No videos uploaded.</p>
                    ) : (
                        <div className="space-y-6">
                            {user.videos.map((v) => (
                                <div
                                    key={v.id}
                                    className="bg-slate-900/70 border border-slate-800 rounded-lg p-4 group hover:scale-[1.01] transition"
                                >
                                    <h4 className="font-bold text-lg">{v.title}</h4>
                                    <p className="text-slate-400 text-sm">{v.description}</p>

                                    {/* Plyr video player (YouTube/Reel style) */}
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

                                    <p className="text-xs text-slate-500 mt-1">
                                        Uploaded {new Date(v.uploaded_at).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Share Modal */}
            {showShare && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-slate-900 p-6 rounded-xl shadow-xl max-w-lg w-full border border-slate-700 text-center">
                        <h2 className="text-xl font-bold text-cyan-400 mb-4">Share Your Profile</h2>
                        <p className="text-slate-300 mb-4 break-all">{shareLink}</p>
                        <div className="flex justify-center gap-4">
                            {/* Copy & Close buttons */}
                            <button
                                onClick={handleCopy}
                                className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                                {
                                    FaCopy({
                                        className: "text-cyan-400 text-xl",
                                    }) as JSX.Element
                                }{" "}
                                Copy Link
                            </button>
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                                {
                                    FaTimesCircle({
                                        className: "text-cyan-400 text-xl",
                                    }) as JSX.Element
                                }{" "}
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicProfile;
