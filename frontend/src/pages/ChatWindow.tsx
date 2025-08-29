import React, {useEffect, useRef, useState} from "react";
import {useParams} from "react-router-dom";
import api from "../api/axios";
import {toast} from "react-toastify";
import {FaPaperclip, FaImage, FaPaperPlane} from "react-icons/fa";

interface Message {
    id: number;
    sender: number;
    recipient: number;
    text: string;
    file?: string;
    image?: string;
    created_at: string;
    read: boolean;
}

const ChatWindow: React.FC = () => {
    const {userId} = useParams<{userId: string}>(); // chatting with this user
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Fetch messages from API
    const fetchMessages = async () => {
        try {
            const res = await api.get(`/api/conversations/${userId}/messages/`);
            setMessages(res.data);
        } catch {
            toast.error("Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    // Fetch messages on mount + poll every 5s
    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // refresh every 5s
        return () => clearInterval(interval);
    }, [userId]);

    // Always scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    // Send a message (text/file/image)
    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage && !file && !image) {
            toast.error("Cannot send empty message");
            return;
        }

        const formData = new FormData();
        formData.append("recipient", userId!); // API expects recipient ID
        if (newMessage) formData.append("text", newMessage);
        if (file) formData.append("file", file);
        if (image) formData.append("image", image);

        try {
            await api.post(`/api/conversations/${userId}/messages/`, formData, {
                headers: {"Content-Type": "multipart/form-data"},
            });
            // reset state after sending
            setNewMessage("");
            setFile(null);
            setImage(null);
            fetchMessages();
        } catch {
            toast.error("Failed to send message");
        }
    };

    // Render a single message content (text, links, file, image)
    const renderMessageContent = (msg: Message) => {
        return (
            <div>
                {/* Make URLs clickable inside text */}
                {msg.text && (
                    <p className="whitespace-pre-line">
                        {msg.text.split(" ").map((word, i) =>
                            word.startsWith("http") ? (
                                <a
                                    key={i}
                                    href={word}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    {word}{" "}
                                </a>
                            ) : (
                                word + " "
                            )
                        )}
                    </p>
                )}
                {/* Attached file */}
                {msg.file && (
                    <a
                        href={msg.file}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-green-600 underline block mt-1"
                    >
                        📎 Download File
                    </a>
                )}
                {/* Attached image */}
                {msg.image && <img src={msg.image} alt="chat-img" className="w-40 h-40 rounded mt-2 object-cover" />}
            </div>
        );
    };

    if (loading) return <p className="text-center mt-10">Loading chat...</p>;

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow flex flex-col h-[80vh]">
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {/* Message list */}
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`p-3 rounded-lg max-w-xs ${
                            msg.sender.toString() === userId
                                ? "bg-gray-200 self-start"
                                : "bg-blue-500 text-white self-end ml-auto"
                        }`}
                    >
                        {renderMessageContent(msg)}
                        <div className="text-xs mt-1 opacity-75">
                            {/* Timestamp */}
                            {new Date(msg.created_at).toLocaleTimeString()}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={sendMessage} className="flex items-center gap-2 border-t pt-2">
                <label className="cursor-pointer">
                    {FaPaperclip({className: "text-gray-600 text-xl"})}
                    {/* File upload */}
                    <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>

                <label className="cursor-pointer">
                    {FaImage({className: "text-gray-600 text-xl"})}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setImage(e.target.files?.[0] || null)}
                    />
                </label>

                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border rounded px-3 py-2"
                />
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded">
                    {FaPaperPlane({})}
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
