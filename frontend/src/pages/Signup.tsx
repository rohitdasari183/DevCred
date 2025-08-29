import React, {useState, useContext, useEffect} from "react";
import {useNavigate, Link, useLocation} from "react-router-dom";
import {toast} from "react-toastify";
import {AuthContext} from "../context/AuthContext";

// Form state type for signup
type FormState = {
    username: string;
    email: string;
    password: string;
    bio: string;
    github_username: string;
    profile_image: File | null;
};

const Signup: React.FC = () => {
    const auth = useContext(AuthContext)!; // Auth context (for signup API call)
    const navigate = useNavigate();
    const location = useLocation();

    // Local form state
    const [form, setForm] = useState<FormState>({
        username: "",
        email: "",
        password: "",
        bio: "",
        github_username: "",
        profile_image: null,
    });
    const [loading, setLoading] = useState(false);
    const [githubVerified, setGithubVerified] = useState(false);

    // Extract GitHub username from OAuth redirect URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const githubUser = params.get("github_username");
        if (githubUser) {
            // Autofill GitHub username if provided by backend
            setForm((prev) => ({...prev, github_username: githubUser}));
            setGithubVerified(true);
            toast.success("GitHub account verified successfully!");
            // Remove query params from URL for cleanliness
            window.history.replaceState({}, document.title, location.pathname);
        }
    }, [location]);

    // Handle input fields & file uploads
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, files} = e.target;
        if (files && files.length > 0) {
            setForm((prev) => ({...prev, [name]: files[0]})); // Save uploaded image
        } else {
            setForm((prev) => ({...prev, [name]: value})); // Normal text input
        }
    };

    // Handle textarea input (bio field)
    const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value}));
    };

    // Redirect user to backend GitHub OAuth endpoint
    const handleGithubVerify = () => {
        window.location.href = "http://localhost:8000/api/users/github/login/";
    };

    // Handle signup form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Require GitHub verification before signup
        if (!githubVerified) {
            toast.error("Please verify your GitHub account before signing up.");
            return;
        }
        setLoading(true);
        try {
            // Build multipart form data for API
            const formData = new FormData();
            formData.append("username", form.username);
            formData.append("email", form.email);
            formData.append("password", form.password);
            formData.append("bio", form.bio ?? "");
            formData.append("github_username", form.github_username ?? "");
            if (form.profile_image) {
                formData.append("profile_image", form.profile_image);
            }

            await auth.signup(formData); // Call signup API via AuthContext

            toast.success("Account created! Please log in.");
            navigate("/login"); // Redirect to login after success
        } catch (err: any) {
            // Handle and display validation errors from backend
            const errorData = err.response?.data;
            if (errorData) {
                const firstError = Object.values(errorData)[0];
                toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
            } else {
                toast.error("Signup failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-950 to-black overflow-hidden px-6">
            {/* Decorative background orbs */}
            <div className="absolute top-10 left-10 w-72 h-72 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse delay-1000"></div>
            {/* Signup container */}
            <div className="relative z-10 flex flex-col md:flex-row w-full max-w-5xl bg-gray-900/80 backdrop-blur-2xl border border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
                {/* Left Side (branding / illustration) */}
                <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-amber-500 via-teal-600 to-blue-600">
                    <h2 className="text-4xl font-extrabold text-black text-center px-6 drop-shadow-lg">
                        Development Contribution Ledger
                    </h2>
                </div>

                {/* Right Side (signup form) */}
                <div className="flex-1 p-8 md:p-12">
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-blue-400 to-amber-400 text-center mb-8">
                        Create Your Account
                    </h2>

                    {/* Signup Form */}
                    <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                        {/* Username */}
                        <div>
                            <label className="block text-sm mb-2 text-gray-300">Username</label>
                            <input
                                name="username"
                                placeholder="e.g. unique_username123"
                                value={form.username}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-gray-800 text-white border border-gray-700 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 placeholder-gray-500"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm mb-2 text-gray-300">Email</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-gray-800 text-white border border-gray-700 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-500"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm mb-2 text-gray-300">Password</label>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-gray-800 text-white border border-gray-700 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 placeholder-gray-500"
                            />
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm mb-2 text-gray-300">About Me</label>
                            <textarea
                                name="bio"
                                placeholder="Write something about yourself..."
                                value={form.bio}
                                onChange={handleTextAreaChange}
                                className="w-full bg-gray-800 text-white border border-gray-700 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 placeholder-gray-500"
                            />
                        </div>

                        {/* GitHub Username with Verify Button */}
                        <div>
                            <label className="block text-sm mb-2 text-gray-300">GitHub Username</label>
                            <div className="flex items-center gap-3">
                                <input
                                    name="github_username"
                                    placeholder="Verify with GitHub"
                                    value={form.github_username}
                                    disabled //keep input non-editable
                                    className="flex-1 bg-gray-800 text-white border border-gray-700 p-4 rounded-lg focus:outline-none placeholder-gray-500 disabled:opacity-70"
                                />
                                <button
                                    type="button"
                                    onClick={handleGithubVerify}
                                    className="px-4 py-2 bg-gradient-to-r from-teal-500 via-blue-500 to-amber-400 text-black font-semibold rounded-lg shadow hover:scale-105 transition"
                                >
                                    {githubVerified ? "Verified" : "Verify"}
                                </button>
                            </div>
                        </div>

                        {/* Profile Image Upload */}
                        <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-amber-400 transition-colors duration-300 text-gray-400 hover:text-amber-400">
                            <span className="mb-2">Upload Profile Picture</span>
                            <input
                                name="profile_image"
                                type="file"
                                accept="image/*"
                                onChange={handleInputChange}
                                className="hidden"
                            />
                        </label>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-teal-500 via-blue-500 to-amber-400 text-black font-semibold p-4 rounded-lg shadow-lg hover:shadow-teal-400/40 hover:scale-[1.02] active:scale-95 transition-all duration-500"
                        >
                            {loading ? "Creating..." : "Sign Up"}
                        </button>
                    </form>

                    <p className="text-sm text-center mt-6 text-gray-400">
                        Already have an account? {/* Link to login page */}
                        <Link
                            to="/login"
                            className="text-teal-400 hover:text-amber-400 transition-colors duration-300 underline-offset-4 hover:underline"
                        >
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
