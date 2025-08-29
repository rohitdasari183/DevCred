import React, {useState} from "react";
import axios from "axios";
import {toast} from "react-toastify";

// Define the type of a GitHub repository
interface Repo {
    name: string;
    html_url: string;
    description: string;
    created_at: string;
}

const GitHubRepos = () => {
    // Local state
    const [githubUrl, setGithubUrl] = useState("");
    const [repos, setRepos] = useState<Repo[]>([]);
    const [total, setTotal] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch repositories from backend (which integrates with GitHub)
    const fetchRepos = async () => {
        if (!githubUrl.trim()) {
            toast.warning("Enter GitHub username or URL");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token"); // Auth token
            const res = await axios.post(
                "http://localhost:8000/api/integrations/github-repos/",
                {github_url: githubUrl},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Save response into state
            setRepos(res.data.projects);
            setTotal(res.data.total_repos);
            toast.success("Repositories fetched!");
        } catch (err) {
            toast.error("Failed to load repositories");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded shadow">
            {/* Title */}
            <h2 className="text-2xl font-bold mb-6 text-primary text-center">🔍 GitHub Project Repositories</h2>

            {/* Input + Fetch button */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Enter GitHub username or profile URL"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="flex-grow border p-2 rounded"
                />
                <button onClick={fetchRepos} className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-900">
                    {loading ? "Loading..." : "Fetch Repos"}
                </button>
            </div>

            {/* Show total repo count if available */}
            {total !== null && (
                <div className="mb-4 text-gray-700">
                    <strong>Total Project Repositories:</strong> {total}
                </div>
            )}

            {/* Render repo list */}
            <ul className="space-y-4">
                {repos.map((repo, idx) => (
                    <li key={idx} className="p-4 border rounded bg-gray-50">
                        <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary font-semibold"
                        >
                            {repo.name}
                        </a>
                        <p className="text-sm text-gray-600">{repo.description || "No description"}</p>
                        <p className="text-xs text-gray-400">
                            Created: {new Date(repo.created_at).toLocaleDateString()}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GitHubRepos;
