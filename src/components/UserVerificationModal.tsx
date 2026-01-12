"use client";

import { useState } from "react";
import { useUser } from "@/shared/context/UserContext";
import { useLanguage } from "@/shared/context/LanguageContext";

export default function UserVerificationModal() {
    const { showVerificationModal, setShowVerificationModal, registerUser } = useUser();
    const { language } = useLanguage();

    const [studentId, setStudentId] = useState("");
    const [nickname, setNickname] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const translations = {
        en: {
            title: "Verify Your Identity",
            desc: "Please enter your student ID and nickname to interact with policies.",
            studentId: "Student ID (5 digits)",
            nickname: "Nickname",
            submit: "Continue",
            cancel: "Maybe Later",
            error_id: "Student ID must be exactly 5 digits",
            error_nickname: "Please enter a nickname",
            submitting: "Verifying..."
        },
        th: {
            title: "ยืนยันตัวตน",
            desc: "กรุณากรอกรหัสนักศึกษาและชื่อเล่นเพื่อมีส่วนร่วมกับนโยบาย",
            studentId: "รหัสนักศึกษา (5 หลัก)",
            nickname: "ชื่อเล่น",
            submit: "ดำเนินการต่อ",
            cancel: "ไว้ทีหลัง",
            error_id: "รหัสนักศึกษาต้องเป็นตัวเลข 5 หลัก",
            error_nickname: "กรุณากรอกชื่อเล่น",
            submitting: "กำลังยืนยัน..."
        }
    };

    const t = translations[language];

    if (!showVerificationModal) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate student ID (5 digits)
        if (!/^\d{5}$/.test(studentId)) {
            setError(t.error_id);
            return;
        }

        // Validate nickname
        if (!nickname.trim()) {
            setError(t.error_nickname);
            return;
        }

        setLoading(true);
        try {
            await registerUser(studentId, nickname.trim());
        } catch (err) {
            console.error("Registration error:", err);
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowVerificationModal(false)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md glass-card rounded-2xl p-8 animate-fadeInUp">
                {/* Icon */}
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                    <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-center text-primary-color mb-2">
                    {t.title}
                </h2>
                <p className="text-secondary-color text-center mb-6">
                    {t.desc}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary-color mb-2">
                            {t.studentId}
                        </label>
                        <input
                            type="text"
                            value={studentId}
                            onChange={(e) => {
                                // Only allow digits, max 5
                                const val = e.target.value.replace(/\D/g, "").slice(0, 5);
                                setStudentId(val);
                            }}
                            placeholder="12345"
                            className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none transition-all text-center text-2xl tracking-widest font-mono"
                            maxLength={5}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary-color mb-2">
                            {t.nickname}
                        </label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder={language === "en" ? "e.g., John" : "เช่น สมชาย"}
                            className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none transition-all"
                            maxLength={20}
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? t.submitting : t.submit}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowVerificationModal(false)}
                            className="w-full py-3 rounded-xl border border-glass-border text-secondary-color hover:text-primary-color hover:bg-layer-1 transition-all"
                        >
                            {t.cancel}
                        </button>
                    </div>
                </form>

                {/* Privacy Notice */}
                <p className="text-[10px] text-white/30 text-center mt-6">
                    🔒 Your information is used only for this election platform.
                </p>
            </div>
        </div>
    );
}
