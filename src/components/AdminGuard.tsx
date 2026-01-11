"use client";

import { useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import Navbar from "@/features/navbar/navbar";
import Footer from "@/features/footer/Footer";

const ADMIN_PASSWORD = "scadmin1234";
const COOKIE_NAME = "sc_admin_session";

export default function AdminGuard({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const session = Cookies.get(COOKIE_NAME);
        if (session === "authenticated") {
            setIsAuthenticated(true);
        }
        setChecking(false);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            Cookies.set(COOKIE_NAME, "authenticated", { expires: 1 }); // Expires in 1 day
            setIsAuthenticated(true);
            setError("");
        } else {
            setError("Invalid password");
        }
    };

    const handleLogout = () => {
        Cookies.remove(COOKIE_NAME);
        setIsAuthenticated(false);
        setPassword("");
    };

    if (checking) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen transition-colors duration-300">
                <Navbar />
                <div className="pt-24 flex flex-col items-center justify-center min-h-[70vh] px-4">
                    <div className="glass-card rounded-2xl p-8 md:p-12 max-w-md w-full animate-fadeInUp">
                        <h1 className="text-2xl font-bold text-center text-primary-color mb-2">Admin Access</h1>
                        <p className="text-secondary-color text-center mb-8">Please enter the admin password to continue.</p>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none transition-all"
                                />
                                {error && <p className="text-red-400 text-sm mt-2 ml-1">{error}</p>}
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all active:scale-[0.98]"
                            >
                                Access Dashboard
                            </button>
                        </form>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Logout Button (Fixed Top Right of Content) */}
            <div className="absolute top-24 right-4 md:right-8 z-40">
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium backdrop-blur-md border border-red-500/20"
                >
                    Logout
                </button>
            </div>
            {children}
        </div>
    );
}
