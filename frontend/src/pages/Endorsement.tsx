import React, {useEffect, useState} from "react";
import api from "../api/axios";
import {toast} from "react-toastify";

// Type definition for each endorsement object
type Endorsement = {
    id: number;
    endorser: string;
    recipient: string;
    created_at: string;
};

const Endorsements: React.FC = () => {
    // State to hold the list of endorsements
    const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
    // State to hold the input value for recipient username
    const [recipient, setRecipient] = useState("");

    // Fetch endorsements from the backend API
    const fetchEndorsements = async () => {
        try {
            const res = await api.get("/api/endorsements/endorsements/");
            setEndorsements(res.data);
        } catch {
            toast.error("Failed to fetch endorsements");
        }
    };
    // Run once when component mounts → load endorsements initially
    useEffect(() => {
        fetchEndorsements();
    }, []);

    // Handle submitting a new endorsement
    const endorse = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent form reload
        if (!recipient) return; // Ignore if input is empty
        try {
            // Send POST request to backend with recipient username
            await api.post("/api/endorsements/endorsements/", {recipient});
            toast.success("Developer endorsed!"); // Success notification
            setRecipient(""); // Clear input field
            fetchEndorsements(); // Refresh endorsement list
        } catch {
            toast.error("Failed to endorse"); // Error notification
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100 py-10 px-6">
            <h2 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent drop-shadow-md">
                🌟 Endorse Developers
            </h2>

            {/* Endorse Form */}
            <form
                onSubmit={endorse}
                className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-slate-800 flex gap-3 items-center mb-10"
            >
                {/* Input for recipient username */}
                <input
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Recipient Username"
                    className="flex-1 px-4 py-3 rounded-lg bg-slate-800/80 text-slate-100 placeholder-slate-400 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                />
                {/* Submit button */}
                <button className="px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-teal-500 to-emerald-400 text-black hover:opacity-90 shadow-md hover:shadow-lg transition">
                    Endorse
                </button>
            </form>

            {/* Endorsements List */}
            <h3 className="text-xl font-bold mb-4">Your Endorsements</h3>
            <div className="space-y-4">
                {endorsements.map((en) => (
                    <div
                        key={en.id}
                        className="bg-slate-900/70 backdrop-blur-md border border-slate-800 p-5 rounded-xl shadow-md hover:shadow-lg hover:border-teal-400 transition duration-300"
                    >
                        <div className="flex justify-between items-center">
                            {/* Show who endorsed who */}
                            <span className="font-medium">
                                <span className="text-teal-400">{en.endorser}</span> →{" "}
                                <strong className="text-emerald-400">{en.recipient}</strong>
                            </span>
                            {/* Show the timestamp in readable format */}
                            <span className="text-xs text-slate-400">{new Date(en.created_at).toLocaleString()}</span>
                        </div>
                    </div>
                ))}
                {/* Fallback when there are no endorsements */}
                {endorsements.length === 0 && (
                    <div className="text-slate-500 text-center italic">
                        No endorsements yet. Be the first to endorse someone!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Endorsements;
