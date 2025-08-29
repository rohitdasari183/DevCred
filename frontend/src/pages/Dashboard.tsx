import React, {JSX, useEffect, useState} from "react";
import axios from "../api/axios";
import {toast} from "react-toastify";
import {Link} from "react-router-dom";
import {FaUsers, FaThumbsUp, FaGithub, FaVideo, FaFileAlt} from "react-icons/fa";

/** Shape of the data returned from the dashboard API */
interface DashboardData {
    username: string;
    github_username: string;
    email: string;
    contribution_score: number;
    endorsement_score: number;
    video_contributions: number;
    resume_generated: boolean;
    github_repo_count: number;
    unread_count: number;
}

const Dashboard: React.FC = () => {
    /** State to hold all dashboard stats */
    const [data, setData] = useState<DashboardData | null>(null);
    /** Loading flag for first API call */
    const [loading, setLoading] = useState(true);
    /** Separate state to store unread messages count */
    const [unread, setUnread] = useState<number>(0);

    /** Fetch dashboard data + unread messages count */
    const fetchDashboard = async () => {
        try {
            // Fetch main dashboard data
            const res = await axios.get("/api/users/dashboard/");
            setData(res.data);

            // Fetch unread messages count
            const unreadRes = await axios.get("/api/messaging/messages/unread_count/");
            setUnread(unreadRes.data.unread_count);
        } catch (error) {
            toast.error("Failed to load dashboard"); // Show error toast
            console.error("Dashboard fetch error:", error);
        } finally {
            setLoading(false);
        }
    };
    /** Run on mount: fetch dashboard and set up polling */
    useEffect(() => {
        fetchDashboard();

        // Poll unread count every 10 seconds
        const interval = setInterval(async () => {
            try {
                const res = await axios.get("/api/messaging/messages/unread_count/");
                setUnread(res.data.unread_count);
            } catch (err) {
                console.error("Unread fetch error:", err);
            }
        }, 10000);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, []);

    /** Show loading state */
    if (loading)
        return <p className="text-center mt-20 text-cyan-300/80 text-lg animate-pulse">Loading dashboard...</p>;

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#0f172a] to-[#1a1a1a]">
            {/* Neon background blobs (for aesthetics) */}
            <div className="absolute top-0 -left-40 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[140px] animate-pulse"></div>
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px]"></div>

            <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24">
                {/* Welcome banner */}
                <h2 className="text-center text-5xl font-extrabold mb-14 bg-gradient-to-r from-pink-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent drop-shadow-lg tracking-tight animate-fade-in">
                    Welcome back, {data?.username}
                </h2>

                {/* Stats Grid (each card links to a feature) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Contribution Score Card */}
                    <Link
                        to="/contributions"
                        className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 shadow-lg hover:shadow-teal-500/40 border border-teal-500/20 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]"
                    >
                        <div className="flex flex-col items-center text-center">
                            {/* Icon */}
                            {
                                FaUsers({
                                    className:
                                        "text-5xl mb-4 text-teal-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.55)] group-hover:scale-110 transition-transform duration-300",
                                }) as JSX.Element
                            }
                            <h3 className="text-lg font-semibold text-slate-200">Contribution Score</h3>
                            {/* Score Value */}
                            <p className="text-4xl font-extrabold mt-2 bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
                                {data?.contribution_score}
                            </p>
                            <span className="mt-3 text-sm text-slate-400">View &amp; Add Contributions</span>
                        </div>
                    </Link>

                    {/* Endorsements Card */}
                    <Link
                        to="/users"
                        className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 shadow-lg hover:shadow-emerald-400/40 border border-emerald-500/20 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]"
                    >
                        <div className="flex flex-col items-center text-center">
                            {
                                FaThumbsUp({
                                    className:
                                        "text-5xl mb-4 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.55)] group-hover:scale-110 transition-transform duration-300",
                                }) as JSX.Element
                            }
                            <h3 className="text-lg font-semibold text-slate-200">Endorsements</h3>
                            <p className="text-4xl font-extrabold mt-2 bg-gradient-to-r from-emerald-300 to-lime-300 bg-clip-text text-transparent">
                                {data?.endorsement_score}
                            </p>
                            <span className="mt-3 text-sm text-slate-400">View User Profiles &amp; Endorse</span>
                        </div>
                    </Link>

                    {/* GitHub Repositories Card */}
                    <a
                        href={`https://github.com/${data?.github_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 shadow-lg hover:shadow-cyan-400/40 border border-cyan-500/20 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]"
                    >
                        <div className="flex flex-col items-center text-center">
                            {
                                FaGithub({
                                    className:
                                        "text-5xl mb-4 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.55)] group-hover:scale-110 transition-transform duration-300",
                                }) as JSX.Element
                            }
                            <h3 className="text-lg font-semibold text-slate-200">GitHub Repositories</h3>
                            <p className="text-4xl font-extrabold mt-2 bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                                {data?.github_repo_count}
                            </p>
                            <span className="mt-3 text-sm text-slate-400">View on GitHub</span>
                        </div>
                    </a>

                    {/* Mentoring Videos Card */}
                    <Link
                        to="/videos"
                        className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 shadow-lg hover:shadow-indigo-400/40 border border-indigo-500/20 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]"
                    >
                        <div className="flex flex-col items-center text-center">
                            {
                                FaVideo({
                                    className:
                                        "text-5xl mb-4 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.55)] group-hover:scale-110 transition-transform duration-300",
                                }) as JSX.Element
                            }
                            <h3 className="text-lg font-semibold text-slate-200">Mentoring Videos</h3>
                            <p className="text-4xl font-extrabold mt-2 bg-gradient-to-r from-indigo-300 to-pink-300 bg-clip-text text-transparent">
                                {data?.video_contributions}
                            </p>
                            <span className="mt-3 text-sm text-slate-400">Upload / View Videos</span>
                        </div>
                    </Link>

                    {/* Resume Card */}
                    <Link
                        to="/resume"
                        className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 shadow-lg hover:shadow-amber-400/40 border border-amber-500/20 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]"
                    >
                        <div className="flex flex-col items-center text-center">
                            {
                                FaFileAlt({
                                    className: `text-5xl mb-4 ${
                                        data?.resume_generated
                                            ? "text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.55)]"
                                            : "text-slate-500"
                                    } group-hover:scale-110 transition-transform duration-300`,
                                }) as JSX.Element
                            }
                            <h3 className="text-lg font-semibold text-slate-200">Resume Generation</h3>
                            <span className="mt-3 text-sm text-slate-400">Generate Your Resume</span>
                        </div>
                    </Link>

                    {/* Messages Card */}
                    <Link
                        to="/messages"
                        className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 shadow-lg hover:shadow-rose-400/40 border border-rose-500/20 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]"
                    >
                        <div className="flex flex-col items-center text-center">
                            <span className="text-5xl mb-4 text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.55)] group-hover:scale-110 transition-transform duration-300">
                                💬
                            </span>
                            <h3 className="text-lg font-semibold text-slate-200">Messages</h3>
                            <p className="text-4xl font-extrabold mt-2 bg-gradient-to-r from-rose-300 to-orange-300 bg-clip-text text-transparent">
                                {unread}
                            </p>
                            <span className="mt-3 text-sm text-slate-400">Recieved Count</span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
