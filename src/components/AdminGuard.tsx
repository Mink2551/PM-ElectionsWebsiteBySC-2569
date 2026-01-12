"use client";

import { useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import Navbar from "@/features/navbar/navbar";
import Footer from "@/features/footer/Footer";

// Password is now loaded from environment variable
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "";
const COOKIE_NAME = "sc_admin_session";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in ms

// Simple hash function for session token (not cryptographically secure, but better than plain text)
function generateSessionToken(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return btoa(`${timestamp}-${random}-authenticated`);
}

function isValidSession(token: string): boolean {
    try {
        const decoded = atob(token);
        return decoded.endsWith("-authenticated");
    } catch {
        return false;
    }
}

export default function AdminGuard({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [checking, setChecking] = useState(true);
    const [attempts, setAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

    useEffect(() => {
        // Check existing session
        const session = Cookies.get(COOKIE_NAME);
        if (session && isValidSession(session)) {
            setIsAuthenticated(true);
        }

        // Check for lockout
        const storedLockout = localStorage.getItem("admin_lockout");
        if (storedLockout) {
            const lockoutTime = parseInt(storedLockout);
            if (Date.now() < lockoutTime) {
                setLockoutUntil(lockoutTime);
            } else {
                localStorage.removeItem("admin_lockout");
                localStorage.removeItem("admin_attempts");
            }
        }

        // Load attempts
        const storedAttempts = localStorage.getItem("admin_attempts");
        if (storedAttempts) {
            setAttempts(parseInt(storedAttempts));
        }

        setChecking(false);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // Check lockout
        if (lockoutUntil && Date.now() < lockoutUntil) {
            const remaining = Math.ceil((lockoutUntil - Date.now()) / 60000);
            setError(`Too many attempts. Try again in ${remaining} minutes.`);
            return;
        }

        // Check if password is configured
        if (!ADMIN_PASSWORD) {
            setError("Admin password not configured. Please set NEXT_PUBLIC_ADMIN_PASSWORD.");
            return;
        }

        if (password === ADMIN_PASSWORD) {
            const token = generateSessionToken();
            Cookies.set(COOKIE_NAME, token, {
                expires: 1, // 1 day
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production'
            });
            setIsAuthenticated(true);
            setError("");
            // Clear attempts on success
            localStorage.removeItem("admin_attempts");
            localStorage.removeItem("admin_lockout");
            setAttempts(0);
        } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            localStorage.setItem("admin_attempts", newAttempts.toString());

            if (newAttempts >= MAX_ATTEMPTS) {
                const lockout = Date.now() + LOCKOUT_DURATION;
                setLockoutUntil(lockout);
                localStorage.setItem("admin_lockout", lockout.toString());
                setError(`Too many failed attempts. Locked out for 15 minutes.`);
            } else {
                setError(`Invalid password. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
            }
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

    const isLockedOut = lockoutUntil && Date.now() < lockoutUntil;

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen transition-colors duration-300">
                <Navbar />
                <div className="pt-24 flex flex-col items-center justify-center min-h-[70vh] px-4">
                    <div className="glass-card rounded-2xl p-8 md:p-12 max-w-md w-full animate-fadeInUp">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
                            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-center text-primary-color mb-2">Admin Access</h1>
                        <p className="text-secondary-color text-center mb-8">Please enter the admin password to continue.</p>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    disabled={!!isLockedOut}
                                    className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                {error && (
                                    <div className="flex items-center gap-2 mt-2 ml-1">
                                        <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-red-400 text-sm">{error}</p>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={!!isLockedOut}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-purple-500/25"
                            >
                                {isLockedOut ? "Locked Out" : "Access Dashboard"}
                            </button>
                        </form>

                        {/* Security Notice */}
                        <p className="text-xs text-white/30 text-center mt-6">
                            🔒 Protected by rate limiting ({MAX_ATTEMPTS} attempts max)
                        </p>
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
