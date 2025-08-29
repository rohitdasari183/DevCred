import React, {useEffect, useState} from "react";
import api from "../api/axios";
import {toast} from "react-toastify";

/** Contribution item shape from backend */
type Contribution = {
    id: number;
    user: string;
    title: string;
    description: string;
    contribution_type: string;
    proof_url?: string;
    created_at: string;
};

/** Lock system state shape (persisted in localStorage) */
type LockState = {
    forced: boolean; // If true → user is locked out
    wasAllowedAtLock: boolean; // Whether user was allowed at the time of locking
    seenFalseSinceLock: boolean; // Tracks if "not allowed" was seen after lock
    lockedAt: number; // Timestamp of lock activation
};

const LOCK_KEY = "contrib_lock_state";

const Contributions: React.FC = () => {
    /** State: all contributions list */
    const [items, setItems] = useState<Contribution[]>([]);
    /** Form input states */
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("code");
    const [proofUrl, setProofUrl] = useState("");
    /** Whether backend currently allows logging contributions */
    const [allowed, setAllowed] = useState(false);

    /** Lock system states */
    const [forceLocked, setForceLocked] = useState<boolean>(false);
    const [graceOpen, setGraceOpen] = useState<boolean>(false);
    const [seenFalseSinceLock, setSeenFalseSinceLock] = useState<boolean>(false);
    const [wasAllowedAtLock, setWasAllowedAtLock] = useState<boolean>(false);

    /** Load saved lock state from localStorage */
    const loadLockState = (): LockState | null => {
        try {
            const raw = localStorage.getItem(LOCK_KEY);
            return raw ? (JSON.parse(raw) as LockState) : null;
        } catch {
            return null;
        }
    };

    /** Save lock state to localStorage */
    const saveLockState = (state: LockState) => {
        localStorage.setItem(LOCK_KEY, JSON.stringify(state));
    };

    /** Remove lock state from localStorage */
    const clearLockState = () => {
        localStorage.removeItem(LOCK_KEY);
    };

    /** Ask backend if user is allowed to log contributions */
    const checkAllowed = async (): Promise<boolean> => {
        try {
            const res = await api.get("/api/contributions/requests/allowed/");
            setAllowed(res.data.allowed);
            return res.data.allowed;
        } catch {
            setAllowed(false);
            return false;
        }
    };

    /** Fetch contributions list + check permission */
    const fetchData = async () => {
        try {
            const res = await api.get("/api/contributions/");
            setItems(res.data);
        } catch {
            toast.error("Unable to fetch contributions");
        }
        await checkAllowed();
    };

    /** On mount → fetch contributions + restore lock state */
    useEffect(() => {
        fetchData().then(() => {
            const ls = loadLockState();
            if (ls?.forced) {
                setForceLocked(true);
                setWasAllowedAtLock(!!ls.wasAllowedAtLock);
                setSeenFalseSinceLock(!!ls.seenFalseSinceLock);
            }
        });
    }, []);

    /**
     * If locked → keep polling backend every 6s
     * Unlock conditions:
     * - If user wasn’t allowed before but now is
     * - OR if user was allowed before, then denied, then allowed again
     */
    useEffect(() => {
        if (!forceLocked) return;

        const interval = setInterval(async () => {
            const nowAllowed = await checkAllowed();

            // Mark "false" state if backend denies
            if (!nowAllowed) {
                setSeenFalseSinceLock(true);
                const s = loadLockState();
                if (s) {
                    s.seenFalseSinceLock = true;
                    saveLockState(s);
                }
            }

            const shouldUnlock =
                (!wasAllowedAtLock && nowAllowed) || (wasAllowedAtLock && seenFalseSinceLock && nowAllowed);

            if (shouldUnlock) {
                setForceLocked(false);
                setSeenFalseSinceLock(false);
                setWasAllowedAtLock(false);
                clearLockState();
                toast.success("✅ New request accepted — you can log another contribution.");
            }
        }, 6000);

        return () => clearInterval(interval);
    }, [forceLocked, wasAllowedAtLock, seenFalseSinceLock]);

    /** Activate a forced lock after grace period ends */
    const activateLock = () => {
        const state: LockState = {
            forced: true,
            wasAllowedAtLock: allowed,
            seenFalseSinceLock: false,
            lockedAt: Date.now(),
        };
        setForceLocked(true);
        setWasAllowedAtLock(allowed);
        setSeenFalseSinceLock(false);
        saveLockState(state);
    };

    /** Submit a new contribution */
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Send data to backend
            await api.post("/api/contributions/", {
                title,
                description,
                contribution_type: type,
                proof_url: proofUrl,
            });

            toast.success("🎉 Contribution logged!");

            // Reset form
            setTitle("");
            setDescription("");
            setProofUrl("");
            setType("code");

            // Grace period (5s where another log is allowed before locking)
            setGraceOpen(true);
            setTimeout(() => {
                setGraceOpen(false);
                activateLock();
            }, 5000);

            // Refresh list
            const res = await api.get("/api/contributions/");
            setItems(res.data);
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.detail || "Failed to create contribution");
        }
    };

    /** Final effective permission check:
     * allowed by backend + not locked
     * OR still inside grace window
     */
    const effectiveAllowed = (allowed && !forceLocked) || graceOpen;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-black text-gray-100 px-6 py-12 pt-24 relative">
            {/* Cyber glowing background */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.15),transparent_70%)]"></div>
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.15),transparent_70%)]"></div>

            <h2 className="text-4xl font-extrabold mb-10 text-center bg-gradient-to-r from-cyan-400 via-sky-400 to-teal-300 bg-clip-text text-transparent drop-shadow-lg">
                Contribution System
            </h2>

            {/* Form only shown if allowed */}
            {effectiveAllowed ? (
                <form
                    onSubmit={submit}
                    className="bg-black/40 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-xl p-6 mb-12 space-y-4 transition-all duration-500 hover:shadow-cyan-500/30"
                >
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Contribution Title"
                        className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                    />
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
                    >
                        <option value="code">Code</option>
                        <option value="bugfix">Bug Fix</option>
                        <option value="docs">Documentation</option>
                        <option value="mentorship">Mentorship</option>
                        <option value="resume">Resume Generator</option>
                        <option value="community">Community Help</option>
                        <option value="codereview">Code Review</option>
                    </select>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your contribution..."
                        className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                    />
                    <input
                        value={proofUrl}
                        onChange={(e) => setProofUrl(e.target.value)}
                        placeholder="Proof URL (optional)"
                        className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                    />
                    <button className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:from-sky-600 hover:to-teal-500 transition-all">
                        🚀 Submit Contribution
                    </button>
                </form>
            ) : (
                <p className="text-red-400 mb-6 text-center font-medium">
                    🚫 You cannot log contributions until you receive & accept a request.
                </p>
            )}

            {/* Contributions list */}
            <h3 className="text-2xl font-bold mb-6 text-cyan-300">Recent Contributions</h3>
            <div className="space-y-6">
                {items.map((it) => (
                    <div
                        key={it.id}
                        className="bg-gray-900/70 border border-gray-700 rounded-xl p-5 shadow-lg hover:shadow-cyan-500/20 transition"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="font-semibold text-lg text-cyan-300">{it.title}</div>
                                <div className="text-sm text-gray-400">
                                    {it.contribution_type} • {new Date(it.created_at).toLocaleString()}
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">👤 {it.user}</div>
                        </div>
                        <p className="mt-3 text-gray-300 text-sm">{it.description}</p>
                        {it.proof_url && (
                            <a
                                href={it.proof_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sky-400 text-sm underline mt-2 inline-block hover:text-teal-300 transition"
                            >
                                🔗 View Proof
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Contributions;
