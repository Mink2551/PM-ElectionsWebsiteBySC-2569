"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { hashPassword, verifyPassword } from "@/lib/password";

interface UserData {
    studentId: string;
    nickname: string;
    passwordHash?: string;
    hasPassword?: boolean;
    ip?: string;
    userAgent?: string;
    deviceType?: "Mobile" | "Tablet" | "Desktop";
    platform?: string;
    browser?: string;
    browserVersion?: string;
    screenResolution?: string;
    registeredAt: string;
}

interface BlockedInfo {
    isBlocked: boolean;
    blockReason?: string;
}

interface UserContextType {
    user: UserData | null;
    isVerified: boolean;
    isBlocked: boolean;
    blockReason: string | null;
    registerUser: (studentId: string, nickname: string, password: string) => Promise<void>;
    verifyUserPassword: (studentId: string, password: string) => Promise<boolean>;
    setUserPassword: (studentId: string, password: string) => Promise<void>;
    checkUserExists: (studentId: string) => Promise<{ exists: boolean; hasPassword: boolean; nickname?: string }>;
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
    const [isBlocked, setIsBlocked] = useState(false);
    const [blockReason, setBlockReason] = useState<string | null>(null);

    // Load user from cookie and set up real-time listener for block/delete status
    useEffect(() => {
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

    // Real-time listener for user status changes (blocked/deleted)
    useEffect(() => {
        if (!user?.studentId) {
            setIsBlocked(false);
            setBlockReason(null);
            return;
        }

        const userDocRef = doc(db, "users", user.studentId);

        const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
            if (!snapshot.exists()) {
                // User was deleted from database - force re-authentication
                console.log("User deleted from database, clearing session");
                Cookies.remove(USER_COOKIE_NAME);
                setUser(null);
                setIsBlocked(false);
                setBlockReason(null);
                setShowVerificationModal(true);
                return;
            }

            const data = snapshot.data();
            if (data?.isBlocked) {
                setIsBlocked(true);
                setBlockReason(data.blockReason || "You have been blocked by an administrator.");
            } else {
                setIsBlocked(false);
                setBlockReason(null);
            }
        }, (error) => {
            console.error("Error listening to user status:", error);
        });

        return () => unsubscribe();
    }, [user?.studentId]);

    // Heartbeat: Update lastActive - every 5 seconds if focused, every 2 minutes otherwise
    useEffect(() => {
        if (!user?.studentId || isBlocked) return;

        let interval: NodeJS.Timeout | null = null;
        let isFocused = false;

        const updateLastActive = async () => {
            try {
                // Check if user is being focused (monitored)
                const userDoc = await getDoc(doc(db, "users", user.studentId));
                if (userDoc.exists()) {
                    isFocused = userDoc.data()?.isFocused || false;
                }

                await updateDoc(doc(db, "users", user.studentId), {
                    lastActive: new Date().toISOString(),
                });
            } catch (e) {
                console.error("Error updating lastActive:", e);
            }
        };

        const startHeartbeat = async () => {
            // Update immediately when user loads the page
            await updateLastActive();

            // Set interval based on focus status - check every iteration
            const runHeartbeat = async () => {
                await updateLastActive();

                // Clear existing interval and set new one based on focus status
                if (interval) clearInterval(interval);
                interval = setInterval(runHeartbeat, isFocused ? 5 * 1000 : 2 * 60 * 1000);
            };

            // Start with default 2 minute interval, will adjust based on focus status
            interval = setInterval(runHeartbeat, isFocused ? 5 * 1000 : 2 * 60 * 1000);
        };

        startHeartbeat();

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [user?.studentId, isBlocked]);

    const checkUserExists = async (studentId: string): Promise<{ exists: boolean; hasPassword: boolean; nickname?: string }> => {
        try {
            const userDocRef = doc(db, "users", studentId);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data();
                return {
                    exists: true,
                    hasPassword: data?.hasPassword === true,
                    nickname: data?.nickname
                };
            }
            return { exists: false, hasPassword: false };
        } catch (e) {
            console.error("Error checking user exists:", e);
            return { exists: false, hasPassword: false };
        }
    };

    const verifyUserPassword = async (studentId: string, password: string): Promise<boolean> => {
        try {
            const userDocRef = doc(db, "users", studentId);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) return false;

            const data = userDoc.data();
            if (!data?.passwordHash) return false;

            // Check if blocked
            if (data.isBlocked) {
                setIsBlocked(true);
                setBlockReason(data.blockReason || "This account has been blocked.");
                return false;
            }

            const isValid = await verifyPassword(password, data.passwordHash);

            if (isValid) {
                // Login successful - set user data from Firestore
                const userData: UserData = {
                    studentId,
                    nickname: data.nickname,
                    passwordHash: data.passwordHash,
                    hasPassword: true,
                    ip: data.ip,
                    userAgent: data.userAgent,
                    deviceType: data.deviceType,
                    platform: data.platform,
                    browser: data.browser,
                    browserVersion: data.browserVersion,
                    screenResolution: data.screenResolution,
                    registeredAt: data.registeredAt,
                };

                Cookies.set(USER_COOKIE_NAME, JSON.stringify(userData), { expires: 365 });
                setUser(userData);
                setShowVerificationModal(false);

                // Update last active
                await updateDoc(userDocRef, {
                    lastActive: new Date().toISOString(),
                });
            }

            return isValid;
        } catch (e) {
            console.error("Error verifying password:", e);
            return false;
        }
    };

    const setUserPassword = async (studentId: string, password: string): Promise<void> => {
        try {
            const userDocRef = doc(db, "users", studentId);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) throw new Error("User not found");

            const data = userDoc.data();
            if (data?.isBlocked) {
                setIsBlocked(true);
                setBlockReason(data.blockReason || "This account has been blocked.");
                return;
            }

            const passwordHash = await hashPassword(password);

            // Update Firestore with password
            await updateDoc(userDocRef, {
                passwordHash,
                hasPassword: true,
                lastActive: new Date().toISOString(),
            });

            // Set user data
            const userData: UserData = {
                studentId,
                nickname: data.nickname,
                passwordHash,
                hasPassword: true,
                ip: data.ip,
                userAgent: data.userAgent,
                deviceType: data.deviceType,
                platform: data.platform,
                browser: data.browser,
                browserVersion: data.browserVersion,
                screenResolution: data.screenResolution,
                registeredAt: data.registeredAt,
            };

            Cookies.set(USER_COOKIE_NAME, JSON.stringify(userData), { expires: 365 });
            setUser(userData);
            setShowVerificationModal(false);
        } catch (e) {
            console.error("Error setting password:", e);
            throw e;
        }
    };

    const registerUser = async (studentId: string, nickname: string, password: string) => {
        // Check if user already exists and is blocked
        try {
            const userDocRef = doc(db, "users", studentId);
            const existingUser = await getDoc(userDocRef);

            if (existingUser.exists()) {
                const data = existingUser.data();
                if (data?.isBlocked) {
                    setIsBlocked(true);
                    setBlockReason(data.blockReason || "This account has been blocked.");
                    return;
                }
            }
        } catch (e) {
            console.error("Error checking user status:", e);
        }

        // Hash the password
        const passwordHash = await hashPassword(password);

        // Get user metadata
        let ip = "";
        try {
            const res = await fetch("https://api.ipify.org?format=json");
            const data = await res.json();
            ip = data.ip || "";
        } catch (e) {
            console.log("Could not fetch IP:", e);
        }

        // Get device information
        const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";

        // Detect device type
        const detectDeviceType = (ua: string): "Mobile" | "Tablet" | "Desktop" => {
            if (/tablet|ipad|playbook|silk/i.test(ua)) return "Tablet";
            if (/mobile|iphone|ipod|android.*mobile|webos|blackberry|opera mini|iemobile/i.test(ua)) return "Mobile";
            return "Desktop";
        };

        // Detect platform
        const detectPlatform = (ua: string): string => {
            if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
            if (/Android/i.test(ua)) return "Android";
            if (/Mac OS X|Macintosh/i.test(ua)) return "macOS";
            if (/Windows/i.test(ua)) return "Windows";
            if (/Linux/i.test(ua)) return "Linux";
            if (/CrOS/i.test(ua)) return "Chrome OS";
            return "Unknown";
        };

        // Detect browser and version
        const detectBrowser = (ua: string): { name: string; version: string } => {
            const browsers = [
                { name: "Edge", regex: /Edg(?:e|A|iOS)?\/(\d+[\d.]*)/ },
                { name: "Chrome", regex: /Chrome\/(\d+[\d.]*)/ },
                { name: "Safari", regex: /Version\/(\d+[\d.]*).*Safari/ },
                { name: "Firefox", regex: /Firefox\/(\d+[\d.]*)/ },
                { name: "Opera", regex: /OPR\/(\d+[\d.]*)/ },
                { name: "Samsung", regex: /SamsungBrowser\/(\d+[\d.]*)/ },
                { name: "IE", regex: /MSIE (\d+[\d.]*)/ },
            ];
            for (const browser of browsers) {
                const match = ua.match(browser.regex);
                if (match) return { name: browser.name, version: match[1] || "" };
            }
            return { name: "Unknown", version: "" };
        };

        const browserInfo = detectBrowser(userAgent);
        const screenResolution = typeof window !== "undefined"
            ? `${window.screen.width}x${window.screen.height}`
            : "";

        const userData: UserData = {
            studentId,
            nickname,
            passwordHash,
            hasPassword: true,
            ip,
            userAgent,
            deviceType: detectDeviceType(userAgent),
            platform: detectPlatform(userAgent),
            browser: browserInfo.name,
            browserVersion: browserInfo.version,
            screenResolution,
            registeredAt: new Date().toISOString(),
        };

        // Save to cookie (expires in 1 year)
        Cookies.set(USER_COOKIE_NAME, JSON.stringify(userData), { expires: 365 });
        setUser(userData);
        setShowVerificationModal(false);

        // Also save to Firestore for admin tracking
        try {
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
        setIsBlocked(false);
        setBlockReason(null);
    };

    const requireVerification = (): boolean => {
        if (isBlocked) {
            // User is blocked - don't allow interactions
            return false;
        }
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
                isVerified: !!user && !isBlocked,
                isBlocked,
                blockReason,
                registerUser,
                verifyUserPassword,
                setUserPassword,
                checkUserExists,
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
