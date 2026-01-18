"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/shared/context/UserContext";
import { useLanguage } from "@/shared/context/LanguageContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function UserWarningPopup() {
    const { user } = useUser();
    const { language } = useLanguage();
    const [warningMessage, setWarningMessage] = useState<string | null>(null);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        if (!user?.studentId) return;

        const checkWarning = async () => {
            try {
                const userDoc = await getDoc(doc(db, "users", user.studentId));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    if (data?.warningMessage && data.warningMessage.trim()) {
                        setWarningMessage(data.warningMessage);
                        setShowPopup(true);
                    }
                }
            } catch (error) {
                console.error("Error checking warning:", error);
            }
        };

        checkWarning();
    }, [user?.studentId]);

    const handleDismiss = async () => {
        setShowPopup(false);
        // Optionally clear the warning after user acknowledges it
        // Uncomment below if you want the warning to only show once
        /*
        if (user?.studentId) {
            try {
                await updateDoc(doc(db, "users", user.studentId), {
                    warningMessage: ""
                });
            } catch (error) {
                console.error("Error clearing warning:", error);
            }
        }
        */
    };

    if (!showPopup || !warningMessage) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative w-full max-w-md glass-card rounded-2xl p-8 border-2 border-orange-500/30 animate-fadeInUp">
                {/* Warning Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <span className="text-4xl">⚠️</span>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-orange-400 text-center mb-4">
                    {language === "en" ? "Warning" : "คำเตือน"}
                </h2>

                {/* Message */}
                <div className="bg-layer-1 rounded-xl p-4 mb-6 border border-orange-500/20">
                    <p className="text-secondary-color text-center whitespace-pre-wrap">
                        {warningMessage}
                    </p>
                </div>

                {/* Info */}
                <p className="text-xs text-muted-color text-center mb-6">
                    {language === "en"
                        ? "This message is from the administrator. Please read carefully."
                        : "ข้อความนี้มาจากผู้ดูแลระบบ กรุณาอ่านอย่างระมัดระวัง"}
                </p>

                {/* Dismiss Button */}
                <button
                    onClick={handleDismiss}
                    className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors"
                >
                    {language === "en" ? "I Understand" : "ฉันเข้าใจแล้ว"}
                </button>
            </div>
        </div>
    );
}
