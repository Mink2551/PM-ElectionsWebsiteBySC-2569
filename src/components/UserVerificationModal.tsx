"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/shared/context/UserContext";
import { useLanguage } from "@/shared/context/LanguageContext";
import { validatePasswordStrength } from "@/lib/password";

type ModalMode = "initial" | "new_user" | "password_setup" | "login";

export default function UserVerificationModal() {
    const {
        showVerificationModal,
        setShowVerificationModal,
        registerUser,
        checkUserExists,
        verifyUserPassword,
        setUserPassword
    } = useUser();
    const { language } = useLanguage();

    const [mode, setMode] = useState<ModalMode>("initial");
    const [studentId, setStudentId] = useState("");
    const [nickname, setNickname] = useState("");
    const [existingNickname, setExistingNickname] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const translations = {
        en: {
            // Initial step
            title_initial: "Enter Student ID",
            desc_initial: "Please enter your student ID to continue.",
            studentId: "Student ID (5 digits)",
            continue: "Continue",

            // New user registration
            title_new: "Create Account",
            desc_new: "Set up your account with a password for security.",
            nickname: "Nickname",
            password: "Password (min 6 characters)",
            confirmPassword: "Confirm Password",
            register: "Register",

            // Password setup for existing user
            title_setup: "Security Update Required",
            desc_setup: "Welcome back! For your security, please set a password for your account.",
            setPassword: "Set Password",

            // Login
            title_login: "Welcome Back",
            desc_login: "Enter your password to continue.",
            login: "Login",

            // Common
            cancel: "Maybe Later",
            back: "← Back",
            submitting: "Processing...",

            // Errors
            error_id: "Student ID must be exactly 5 digits",
            error_nickname: "Please enter a nickname",
            error_password: "Password must be at least 6 characters",
            error_password_match: "Passwords do not match",
            error_wrong_password: "Incorrect password. Please try again.",
            error_generic: "An error occurred. Please try again."
        },
        th: {
            // Initial step
            title_initial: "กรอกรหัสนักศึกษา",
            desc_initial: "กรุณากรอกรหัสนักศึกษาเพื่อดำเนินการต่อ",
            studentId: "รหัสนักศึกษา (5 หลัก)",
            continue: "ดำเนินการต่อ",

            // New user registration
            title_new: "สร้างบัญชี",
            desc_new: "ตั้งค่าบัญชีพร้อมรหัสผ่านเพื่อความปลอดภัย",
            nickname: "ชื่อเล่น",
            password: "รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)",
            confirmPassword: "ยืนยันรหัสผ่าน",
            register: "ลงทะเบียน",

            // Password setup for existing user
            title_setup: "ต้องอัปเดตความปลอดภัย",
            desc_setup: "ยินดีต้อนรับกลับ! เพื่อความปลอดภัย กรุณาตั้งรหัสผ่านสำหรับบัญชีของคุณ",
            setPassword: "ตั้งรหัสผ่าน",

            // Login
            title_login: "ยินดีต้อนรับกลับ",
            desc_login: "กรอกรหัสผ่านเพื่อดำเนินการต่อ",
            login: "เข้าสู่ระบบ",

            // Common
            cancel: "ไว้ทีหลัง",
            back: "← กลับ",
            submitting: "กำลังดำเนินการ...",

            // Errors
            error_id: "รหัสนักศึกษาต้องเป็นตัวเลข 5 หลัก",
            error_nickname: "กรุณากรอกชื่อเล่น",
            error_password: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
            error_password_match: "รหัสผ่านไม่ตรงกัน",
            error_wrong_password: "รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่",
            error_generic: "เกิดข้อผิดพลาด กรุณาลองใหม่"
        }
    };

    const t = translations[language];

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!showVerificationModal) {
            setMode("initial");
            setStudentId("");
            setNickname("");
            setExistingNickname("");
            setPassword("");
            setConfirmPassword("");
            setError("");
        }
    }, [showVerificationModal]);

    if (!showVerificationModal) return null;

    const handleCheckStudentId = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate student ID (5 digits)
        if (!/^\d{5}$/.test(studentId)) {
            setError(t.error_id);
            return;
        }

        setLoading(true);
        try {
            const result = await checkUserExists(studentId);

            if (result.exists) {
                if (result.hasPassword) {
                    // User exists with password - go to login
                    setExistingNickname(result.nickname || "");
                    setMode("login");
                } else {
                    // User exists but no password - need to set up
                    setExistingNickname(result.nickname || "");
                    setMode("password_setup");
                }
            } else {
                // New user - go to registration
                setMode("new_user");
            }
        } catch (err) {
            console.error("Error checking user:", err);
            setError(t.error_generic);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate nickname
        if (!nickname.trim()) {
            setError(t.error_nickname);
            return;
        }

        // Validate password
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.valid) {
            setError(t.error_password);
            return;
        }

        // Validate password match
        if (password !== confirmPassword) {
            setError(t.error_password_match);
            return;
        }

        setLoading(true);
        try {
            await registerUser(studentId, nickname.trim(), password);
        } catch (err) {
            console.error("Registration error:", err);
            setError(t.error_generic);
        } finally {
            setLoading(false);
        }
    };

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate password
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.valid) {
            setError(t.error_password);
            return;
        }

        // Validate password match
        if (password !== confirmPassword) {
            setError(t.error_password_match);
            return;
        }

        setLoading(true);
        try {
            await setUserPassword(studentId, password);
        } catch (err) {
            console.error("Set password error:", err);
            setError(t.error_generic);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!password) {
            setError(t.error_password);
            return;
        }

        setLoading(true);
        try {
            const success = await verifyUserPassword(studentId, password);
            if (!success) {
                setError(t.error_wrong_password);
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(t.error_generic);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setMode("initial");
        setPassword("");
        setConfirmPassword("");
        setError("");
    };

    const getTitle = () => {
        switch (mode) {
            case "initial": return t.title_initial;
            case "new_user": return t.title_new;
            case "password_setup": return t.title_setup;
            case "login": return t.title_login;
        }
    };

    const getDescription = () => {
        switch (mode) {
            case "initial": return t.desc_initial;
            case "new_user": return t.desc_new;
            case "password_setup": return t.desc_setup;
            case "login": return t.desc_login;
        }
    };

    const getIcon = () => {
        switch (mode) {
            case "initial":
                return (
                    <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                );
            case "new_user":
                return (
                    <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                );
            case "password_setup":
                return (
                    <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                );
            case "login":
                return (
                    <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                );
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
                    {getIcon()}
                </div>

                <h2 className="text-2xl font-bold text-center text-primary-color mb-2">
                    {getTitle()}
                </h2>
                <p className="text-secondary-color text-center mb-6">
                    {getDescription()}
                </p>

                {/* Show existing nickname for returning users */}
                {(mode === "login" || mode === "password_setup") && existingNickname && (
                    <div className="text-center mb-4">
                        <span className="text-muted-color">{language === "en" ? "Logging in as" : "เข้าสู่ระบบเป็น"}: </span>
                        <span className="text-primary-color font-semibold">{existingNickname}</span>
                        <span className="text-muted-color ml-2">#{studentId}</span>
                    </div>
                )}

                {/* Initial Step - Enter Student ID */}
                {mode === "initial" && (
                    <form onSubmit={handleCheckStudentId} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-color mb-2">
                                {t.studentId}
                            </label>
                            <input
                                type="text"
                                value={studentId}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "").slice(0, 5);
                                    setStudentId(val);
                                }}
                                placeholder="12345"
                                className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none transition-all text-center text-2xl tracking-widest font-mono"
                                maxLength={5}
                                autoFocus
                            />
                        </div>

                        {error && <ErrorMessage message={error} />}

                        <div className="flex flex-col gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading || studentId.length !== 5}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? t.submitting : t.continue}
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
                )}

                {/* New User Registration */}
                {mode === "new_user" && (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="text-center mb-4">
                            <span className="text-muted-color">{language === "en" ? "Student ID" : "รหัสนักศึกษา"}: </span>
                            <span className="font-mono font-bold text-primary-color">{studentId}</span>
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

                        <div>
                            <label className="block text-sm font-medium text-secondary-color mb-2">
                                {t.password}
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••"
                                className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-color mb-2">
                                {t.confirmPassword}
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••"
                                className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none transition-all"
                            />
                        </div>

                        {error && <ErrorMessage message={error} />}

                        <div className="flex flex-col gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? t.submitting : t.register}
                            </button>
                            <button
                                type="button"
                                onClick={handleBack}
                                className="w-full py-3 rounded-xl border border-glass-border text-secondary-color hover:text-primary-color hover:bg-layer-1 transition-all"
                            >
                                {t.back}
                            </button>
                        </div>
                    </form>
                )}

                {/* Password Setup for Existing User */}
                {mode === "password_setup" && (
                    <form onSubmit={handleSetPassword} className="space-y-4">
                        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-4">
                            <p className="text-yellow-400 text-sm text-center">
                                🔐 {language === "en"
                                    ? "For your security, we now require passwords. Please set one to continue."
                                    : "เพื่อความปลอดภัย เราต้องการรหัสผ่านแล้ว กรุณาตั้งค่าเพื่อดำเนินการต่อ"
                                }
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-color mb-2">
                                {t.password}
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••"
                                className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-color mb-2">
                                {t.confirmPassword}
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••"
                                className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none transition-all"
                            />
                        </div>

                        {error && <ErrorMessage message={error} />}

                        <div className="flex flex-col gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? t.submitting : t.setPassword}
                            </button>
                            <button
                                type="button"
                                onClick={handleBack}
                                className="w-full py-3 rounded-xl border border-glass-border text-secondary-color hover:text-primary-color hover:bg-layer-1 transition-all"
                            >
                                {t.back}
                            </button>
                        </div>
                    </form>
                )}

                {/* Login */}
                {mode === "login" && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-color mb-2">
                                {t.password}
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••"
                                className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none transition-all"
                                autoFocus
                            />
                        </div>

                        {error && <ErrorMessage message={error} />}

                        <div className="flex flex-col gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? t.submitting : t.login}
                            </button>
                            <button
                                type="button"
                                onClick={handleBack}
                                className="w-full py-3 rounded-xl border border-glass-border text-secondary-color hover:text-primary-color hover:bg-layer-1 transition-all"
                            >
                                {t.back}
                            </button>
                        </div>
                    </form>
                )}

                {/* Privacy Notice */}
                <p className="text-xs text-muted-color text-center mt-6">
                    🔒 {language === "en" ? "By continuing, you agree to our" : "การดำเนินการต่อถือว่าคุณยอมรับ"}{" "}
                    <a
                        href="/privacy"
                        target="_blank"
                        className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors"
                    >
                        {language === "en" ? "Privacy Policy" : "นโยบายความเป็นส่วนตัว"}
                    </a>
                </p>
            </div>
        </div>
    );
}

function ErrorMessage({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-red-400 text-sm">{message}</p>
        </div>
    );
}
