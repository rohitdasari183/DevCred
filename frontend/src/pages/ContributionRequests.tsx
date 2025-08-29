import React, {useEffect, useState} from "react";
import api from "../api/axios";
import {toast} from "react-toastify";

interface Request {
    id: number;
    sender: {id: number; username: string};
    recipient: {id: number; username: string};
    status: "pending" | "accepted" | "rejected";
    created_at: string;
}

interface User {
    id: number;
    username: string;
}

const ContributionRequests: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [requests, setRequests] = useState<Request[]>([]);
    const [selectedUser, setSelectedUser] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch all users (to send requests)
    const fetchUsers = async () => {
        try {
            const res = await api.get("/api/users/");
            setUsers(res.data);
        } catch {
            toast.error("Unable to load users");
        }
    };

    // Fetch contribution requests
    const fetchRequests = async () => {
        try {
            const res = await api.get("/api/contribution-requests/");
            setRequests(res.data);
        } catch {
            toast.error("Unable to load requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRequests();
    }, []);

    // Send a contribution request
    const sendRequest = async () => {
        if (!selectedUser) {
            toast.error("Please select a user");
            return;
        }
        try {
            await api.post("/api/contribution-requests/", {recipient_id: selectedUser});
            toast.success("Request sent");
            setSelectedUser(null);
            fetchRequests();
        } catch (err: any) {
            toast.error(err.response?.data?.detail || "Failed to send request");
        }
    };

    // Accept a request
    const acceptRequest = async (id: number) => {
        try {
            await api.post(`/api/contribution-requests/${id}/accept/`);
            toast.success("Request accepted");
            fetchRequests();
        } catch {
            toast.error("Failed to accept request");
        }
    };

    // Reject a request
    const rejectRequest = async (id: number) => {
        try {
            await api.post(`/api/contribution-requests/${id}/reject/`);
            toast.success("Request rejected");
            fetchRequests();
        } catch {
            toast.error("Failed to reject request");
        }
    };

    if (loading) return <p className="text-center mt-10 text-gray-500">Loading requests...</p>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6 text-primary">Contribution Requests</h2>

            {/* Send Request */}
            <div className="bg-white p-4 rounded shadow mb-6">
                <h3 className="font-semibold mb-2">Send a Request</h3>
                <div className="flex gap-2">
                    <select
                        value={selectedUser ?? ""}
                        onChange={(e) => setSelectedUser(Number(e.target.value))}
                        className="flex-1 p-2 border rounded"
                    >
                        <option value="">-- Select User --</option>
                        {users.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.username}
                            </option>
                        ))}
                    </select>
                    <button onClick={sendRequest} className="bg-primary text-white px-4 py-2 rounded">
                        Send
                    </button>
                </div>
            </div>

            {/* Requests List */}
            <h3 className="text-xl font-semibold mb-3">Your Requests</h3>
            <div className="space-y-4">
                {requests.length === 0 && <p className="text-gray-500">No requests yet.</p>}
                {requests.map((req) => (
                    <div key={req.id} className="bg-white p-4 rounded shadow">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="font-semibold">
                                    {req.sender.username} ➝ {req.recipient.username}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {req.status} • {new Date(req.created_at).toLocaleString()}
                                </div>
                            </div>
                            {req.status === "pending" && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => acceptRequest(req.id)}
                                        className="px-3 py-1 bg-green-500 text-white rounded"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => rejectRequest(req.id)}
                                        className="px-3 py-1 bg-red-500 text-white rounded"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ContributionRequests;
