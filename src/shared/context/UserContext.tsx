"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";

interface UserData {
    studentId: string;
    nickname: string;
    ip?: string;
    userAgent?: string;
    registeredAt: string;
}

interface UserContextType {
    user: UserData | null;
    isVerified: boolean;
    registerUser: (studentId: string, nickname: string) => Promise<void>;
    clearUser: () => void;
    showVerificationModal: boolean;
    setShowVerificationModal: (show: boolean) => void;
    requireVerification: () => boolean;
}

const USER_COOKIE_NAME = "sc_user";
const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Load user from cookie on mount
        const savedUser = Cookies.get(USER_COOKIE_NAME);
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                setUser(parsed);
            } catch (e) {
                console.error("Error parsing user cookie:", e);
                Cookies.remove(USER_COOKIE_NAME);
            }
        }
        setMounted(true);
    }, []);

    const registerUser = async (studentId: string, nickname: string) => {
        // Get user metadata
        let ip = "";
        try {
            // Try to get IP from a public API (optional, may fail due to CORS)
            const res = await fetch("https://api.ipify.org?format=json");
            const data = await res.json();
            ip = data.ip || "";
        } catch (e) {
            console.log("Could not fetch IP:", e);
        }

        const userData: UserData = {
            studentId,
            nickname,
            ip,
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
            registeredAt: new Date().toISOString(),
        };

        // Save to cookie (expires in 1 year)
        Cookies.set(USER_COOKIE_NAME, JSON.stringify(userData), { expires: 365 });
        setUser(userData);
        setShowVerificationModal(false);

        // Also save to Firestore for admin tracking
        try {
            const { db } = await import("@/lib/firebase");
            const { doc, setDoc } = await import("firebase/firestore");
            await setDoc(doc(db, "users", studentId), {
                ...userData,
                isBlocked: false,
                lastActive: new Date().toISOString(),
            });
        } catch (e) {
            console.error("Error saving user to Firestore:", e);
        }
    };

    const clearUser = () => {
        Cookies.remove(USER_COOKIE_NAME);
        setUser(null);
    };

    const requireVerification = (): boolean => {
        if (!user) {
            setShowVerificationModal(true);
            return false;
        }
        return true;
    };

    if (!mounted) {
        return null;
    }

    return (
        <UserContext.Provider
            value={{
                user,
                isVerified: !!user,
                registerUser,
                clearUser,
                showVerificationModal,
                setShowVerificationModal,
                requireVerification,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
