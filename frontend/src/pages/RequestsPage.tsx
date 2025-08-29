import React, {useEffect, useState} from "react";
import api from "../api/axios";
import {toast} from "react-toastify";

type Request = {
    id: number;
    sender: string;
    recipient: string;
    status: "pending" | "accepted" | "rejected";
};

const RequestsPage: React.FC = () => {
    const [requests, setRequests] = useState<Request[]>([]);

    // Fetch all contribution requests
    const fetchRequests = async () => {
        try {
            const res = await api.get("/api/contributions/requests/");
            setRequests(res.data);
        } catch {
            toast.error("Failed to fetch requests");
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Handle request action (accept/reject)
    const handleAction = async (id: number, action: "accept" | "reject") => {
        try {
            await api.post(`/api/contributions/requests/${id}/${action}/`);
            toast.success(`Request ${action}ed`);
            fetchRequests();
        } catch {
            toast.error("Action failed");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4 text-primary">Contribution Requests</h2>
            {requests.map((req) => (
                <div key={req.id} className="bg-white p-4 rounded shadow mb-3 flex justify-between items-center">
                    <span>
                        <strong>{req.sender}</strong> → {req.recipient} ({req.status})
                    </span>
                    {req.status === "pending" && (
                        <div className="space-x-2">
                            <button
                                onClick={() => handleAction(req.id, "accept")}
                                className="bg-green-500 text-white px-3 py-1 rounded"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => handleAction(req.id, "reject")}
                                className="bg-red-500 text-white px-3 py-1 rounded"
                            >
                                Reject
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default RequestsPage;
