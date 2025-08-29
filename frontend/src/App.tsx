import React, {JSX, useContext} from "react";
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {AuthContext} from "./context/AuthContext";
import Layout from "./components/Layout";

// Pages
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ResumeGenerator from "./pages/ResumeGenerator";
import Contributions from "./pages/Contributions";
import UsersList from "./pages/UsersList";
import UserProfile from "./pages/UserProfile";
import Messages from "./pages/Messages";
import Videos from "./pages/Videos";
import RequestsPage from "./pages/RequestsPage";
import Endorsement from "./pages/Endorsement";
import PublicProfile from "./pages/PublicProfile";

// Wrapper for protected routes (redirects if not logged in)
const PrivateRoute = ({children}: {children: JSX.Element}) => {
    const auth = useContext(AuthContext);
    if (auth?.loading) return <div>Loading...</div>;
    return auth?.user ? children : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
    return (
        <Router>
            <ToastContainer /> {/* Global toast notifications */}
            <Routes>
                {/* Default route → redirect to signup */}
                <Route path="/" element={<Navigate to="/signup" replace />} />

                {/* Public routes */}
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />

                {/* Protected routes (require login) */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </PrivateRoute>
                    }
                />
                {/* Public profile is accessible without login */}
                <Route
                    path="/profile/public/:username"
                    element={
                        <Layout>
                            <PublicProfile />
                        </Layout>
                    }
                />
                <Route
                    path="/resume"
                    element={
                        <PrivateRoute>
                            <Layout>
                                <ResumeGenerator />
                            </Layout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/contributions"
                    element={
                        <PrivateRoute>
                            <Layout>
                                <Contributions />
                            </Layout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/endorsements"
                    element={
                        <PrivateRoute>
                            <Layout>
                                <Endorsement />
                            </Layout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/videos"
                    element={
                        <PrivateRoute>
                            <Layout>
                                <Videos />
                            </Layout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/users"
                    element={
                        <PrivateRoute>
                            <Layout>
                                <UsersList />
                            </Layout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/users/:id"
                    element={
                        <PrivateRoute>
                            <Layout>
                                <UserProfile />
                            </Layout>
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/requests"
                    element={
                        <PrivateRoute>
                            <Layout>
                                <RequestsPage />
                            </Layout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/messages"
                    element={
                        <PrivateRoute>
                            <Layout>
                                <Messages />
                            </Layout>
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;
