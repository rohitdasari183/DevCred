import React, {useEffect, useState} from "react";
import api from "../api/axios";
import {toast} from "react-toastify";

// Code editor & syntax highlighting
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/themes/prism-tomorrow.css";

type Message = {
    id: number;
    sender: number;
    recipient: number;
    sender_username: string;
    recipient_username: string;
    text: string;
    file?: string;
    image?: string;
    created_at: string;
    read: boolean;
    status: "pending" | "accepted" | "rejected";
};

// Extracted reusable code editor (syntax-highlighted textarea)
const CodeTextarea: React.FC<{
    text: string;
    setText: (t: string) => void;
}> = ({text, setText}) => {
    return (
        <Editor
            value={text}
            onValueChange={setText}
            highlight={(code) => Prism.highlight(code, Prism.languages.javascript, "javascript")}
            padding={12}
            textareaId="chatgpt-like-textarea"
            style={{
                minHeight: "120px",
                fontFamily: "monospace",
                fontSize: 14,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
            }}
            className="w-full px-3 py-3 rounded-xl bg-slate-800/70 border border-slate-700 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition resize-none"
            placeholder="For Bug fix, Code Review, Documentation, Community Help, Code. Paste the content or upload attachment and hit Send for instant help..."
        />
    );
};

const Messages: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState("");
    const [recipientUsername, setRecipientUsername] = useState("");
    const [file, setFile] = useState<File | null>(null);
    // Current logged-in user info
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [currentUsername, setCurrentUsername] = useState<string>("");

    //Fetch messages & current user
    const fetchMessages = async () => {
        try {
            const res = await api.get("/api/messaging/messages/");
            setMessages(res.data);

            const userRes = await api.get("/api/users/me/");
            setCurrentUserId(userRes.data.id); // store ID
            setCurrentUsername(userRes.data.username);
        } catch {
            toast.error("Failed to fetch messages");
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    // Send new message
    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!recipientUsername || !text) {
            toast.error("Recipient and message text are required");
            return;
        }
        try {
            const formData = new FormData();
            formData.append("recipient_username", recipientUsername);
            formData.append("text", text);
            if (file) formData.append("file", file);

            await api.post("/api/messaging/messages/", formData, {
                headers: {"Content-Type": "multipart/form-data"},
            });

            toast.success("Message sent");
            setText("");
            setRecipientUsername("");
            setFile(null);
            fetchMessages(); // refresh inbox
        } catch (err: any) {
            if (err.response?.data) {
                console.error("Backend error:", err.response.data);
                toast.error("Error: " + JSON.stringify(err.response.data));
            } else {
                toast.error("Failed to send message");
            }
        }
    };
    // Hide message locally (soft delete from inbox UI)
    const handleDelete = (id: number) => {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        toast.success("Message hidden from inbox");
    };

    // Accept / reject action for requests
    const handleAction = async (id: number, action: "accept" | "reject") => {
        try {
            await api.post(`/api/messaging/messages/${id}/action/`, {action});
            toast.success(`Message ${action}ed`);
            fetchMessages();
        } catch {
            toast.error(`Failed to ${action} message`);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 min-h-screen pt-24 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Page title */}
            <h2 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-violet-300 bg-clip-text text-transparent tracking-tight">
                Messages
            </h2>

            {/* Compose box */}
            <form
                onSubmit={sendMessage}
                className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl p-5 mb-8"
            >
                <div className="grid gap-3">
                    <input
                        value={recipientUsername}
                        onChange={(e) => setRecipientUsername(e.target.value)}
                        placeholder="Recipient Username"
                        className="w-full px-3 py-2 rounded-xl bg-slate-800/70 border border-slate-700 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                    />

                    {/* Replaced textarea with CodeTextarea */}
                    <CodeTextarea text={text} setText={setText} />

                    <label className="relative cursor-pointer inline-block w-fit">
                        <span className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/80 to-fuchsia-600/80 text-black font-medium shadow-lg hover:opacity-90 transition">
                            Choose File
                        </span>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </label>
                    {/* File upload */}
                    {file && <span className="text-sm text-slate-400 ml-1">Selected: {file.name}</span>}
                </div>

                <div className="mt-4 flex justify-end">
                    <button className="px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-black hover:opacity-90 shadow-[0_0_20px_rgba(14,165,233,0.35)] transition">
                        Send
                    </button>
                </div>
            </form>

            {/* Inbox */}
            <h3 className="text-lg font-semibold mb-3 text-slate-300">Inbox</h3>

            <div className="space-y-4">
                {messages.map((msg) => {
                    const isRecipient = currentUserId === msg.recipient;
                    const isSender = currentUserId === msg.sender;

                    return (
                        <div
                            key={msg.id}
                            className={`group relative w-fit max-w-[85%] p-4 rounded-2xl border shadow-lg transition
              ${
                  isSender
                      ? "ml-auto bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-transparent border-emerald-400/20 hover:border-emerald-400/40"
                      : "mr-auto bg-gradient-to-br from-slate-800/80 via-slate-900/70 to-transparent border-slate-700 hover:border-slate-600"
              }`}
                        >
                            {/* Header row: sender + timestamp */}
                            <div className="flex justify-between items-center gap-6">
                                <div className="text-sm">
                                    <span className={`font-semibold ${isSender ? "text-emerald-300" : "text-sky-300"}`}>
                                        {msg.sender_username}
                                    </span>
                                    <span className="text-xs text-slate-400"> → {msg.recipient_username}</span>
                                </div>
                                <span className="text-[11px] text-slate-400">
                                    {new Date(msg.created_at).toLocaleString()}
                                </span>
                            </div>

                            <p className="mt-2 text-slate-200 leading-relaxed">{msg.text}</p>

                            {/* Attachments */}
                            {msg.file && (
                                <a
                                    href={msg.file}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-block mt-3 text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
                                >
                                    Download Attachment
                                </a>
                            )}

                            {msg.image && (
                                <img
                                    src={msg.image}
                                    alt="attachment"
                                    className="mt-3 max-h-52 rounded-xl ring-1 ring-slate-700"
                                />
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-2 mt-4">
                                {/* Soft delete */}
                                <button
                                    onClick={() => handleDelete(msg.id)}
                                    className="px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-sm transition"
                                >
                                    Delete
                                </button>
                                {/* Accept / reject (only recipient can do this) */}
                                {isRecipient && msg.status === "pending" && (
                                    <>
                                        <button
                                            onClick={() => handleAction(msg.id, "accept")}
                                            className="px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white text-sm transition"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleAction(msg.id, "reject")}
                                            className="px-3 py-1.5 rounded-lg bg-slate-600/90 hover:bg-slate-600 text-white text-sm transition"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}

                                {/* Status badge (visible only to sender) */}
                                {isSender && (
                                    <span
                                        className={`px-2.5 py-1 rounded-full text-xs font-semibold
                      ${
                          msg.status === "accepted"
                              ? "bg-emerald-300/20 text-emerald-300 border border-emerald-400/30"
                              : msg.status === "rejected"
                              ? "bg-rose-300/20 text-rose-300 border border-rose-400/30"
                              : "bg-amber-300/20 text-amber-300 border border-amber-400/30"
                      }`}
                                    >
                                        {msg.status}
                                    </span>
                                )}
                            </div>

                            {/* Hover outline */}
                            <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-slate-500/30 transition" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
export default Messages;
