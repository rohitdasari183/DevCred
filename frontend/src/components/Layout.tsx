import React from "react";
import Navbar from "./Navbar";

// - Layout component to provide a consistent structure across pages
// - Renders the Navbar at the top
// - Wraps page content in a styled <main> area
const Layout: React.FC<{children: React.ReactNode}> = ({children}) => {
    return (
        <>
            {/* Global navigation bar (persistent across all pages) */}
            <Navbar />

            {/* Main content area where each page is injected */}
            <main className="bg-gray-50 min-h-screen">{children}</main>
        </>
    );
};

export default Layout;
