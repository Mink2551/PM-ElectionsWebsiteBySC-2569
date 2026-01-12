"use client";

import { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";

interface Alert {
    id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "success" | "error";
    active: boolean;
    priority: number;
}

const TYPE_STYLES = {
    info: {
        bg: "from-indigo-500 to-blue-600",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    warning: {
        bg: "from-amber-500 to-orange-600",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
    },
    success: {
        bg: "from-green-500 to-emerald-600",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    error: {
        bg: "from-red-500 to-rose-600",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
};

export default function AlertPopup() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dismissed, setDismissed] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch active alerts in real-time
    useEffect(() => {
        try {
            const q = query(
                collection(db, "alerts"),
                where("active", "==", true),
                limit(10)
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Alert[];

                // Sort by priority client-side to avoid composite index
                const sorted = data.sort((a, b) => (a.priority || 0) - (b.priority || 0));
                setAlerts(sorted);
                setCurrentIndex(0);
                setLoading(false);
            }, (error) => {
                console.error("AlertPopup error:", error);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (error) {
            console.error("AlertPopup setup error:", error);
            setLoading(false);
        }
    }, []);

    // Auto-rotate every 5 seconds
    useEffect(() => {
        if (alerts.length <= 1 || dismissed) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % alerts.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [alerts.length, dismissed]);

    const handleDismiss = useCallback(() => {
        setDismissed(true);
    }, []);

    // Don't render while loading
    if (loading) return null;

    // Don't render if no alerts or dismissed
    if (alerts.length === 0 || dismissed) return null;

    const currentAlert = alerts[currentIndex];
    const styles = TYPE_STYLES[currentAlert?.type || "info"];

    return (
        <div className="fixed bottom-4 right-4 z-50 w-80 md:w-96 animate-fadeInUp">
            <div className={`rounded-2xl bg-gradient-to-br ${styles.bg} p-[1px] shadow-2xl`}>
                <div className="rounded-2xl bg-black/90 backdrop-blur-xl p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 text-white">
                            {styles.icon}
                            <h4 className="font-bold text-sm line-clamp-1">{currentAlert.title}</h4>
                        </div>
                        {/* Close Button */}
                        <button
                            onClick={handleDismiss}
                            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                            title="Dismiss"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Message */}
                    <p className="text-white/80 text-sm leading-relaxed">{currentAlert.message}</p>

                    {/* Pagination Dots */}
                    {alerts.length > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                            {alerts.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex
                                            ? "bg-white w-4"
                                            : "bg-white/30 hover:bg-white/50"
                                        }`}
                                    title={`Alert ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
