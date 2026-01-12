"use client";

import { useUser } from "@/shared/context/UserContext";
import { useLanguage } from "@/shared/context/LanguageContext";

export default function BlockedUserPopup() {
    const { isBlocked, blockReason, clearUser } = useUser();
    const { language } = useLanguage();

    if (!isBlocked) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="max-w-md mx-4 animate-fadeInUp">
                <div className="rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-[2px] shadow-2xl">
                    <div className="rounded-2xl bg-black/95 backdrop-blur-xl p-8 text-center">
                        {/* Icon */}
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {language === "en" ? "Account Blocked" : "บัญชีถูกระงับ"}
                        </h2>

                        {/* Reason */}
                        <div className="bg-red-500/10 rounded-xl p-4 mb-6">
                            <p className="text-sm text-red-300 font-medium mb-1">
                                {language === "en" ? "Reason:" : "เหตุผล:"}
                            </p>
                            <p className="text-white">
                                {blockReason || (language === "en"
                                    ? "Your account has been blocked by an administrator."
                                    : "บัญชีของคุณถูกระงับโดยผู้ดูแลระบบ")}
                            </p>
                        </div>

                        {/* Info */}
                        <p className="text-sm text-white/60 mb-6">
                            {language === "en"
                                ? "You cannot interact with the platform while blocked. If you believe this is a mistake, please contact the Student Council."
                                : "คุณไม่สามารถมีส่วนร่วมกับแพลตฟอร์มได้ขณะที่ถูกบล็อก หากคุณเชื่อว่านี่คือความผิดพลาด โปรดติดต่อคณะกรรมการนักเรียน"}
                        </p>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <a
                                href="/"
                                className="w-full py-3 rounded-xl bg-layer-1 text-white font-medium hover:bg-layer-2 transition-colors"
                            >
                                {language === "en" ? "Return to Home" : "กลับหน้าแรก"}
                            </a>
                            <button
                                onClick={clearUser}
                                className="text-sm text-white/40 hover:text-white/60 transition-colors"
                            >
                                {language === "en" ? "Sign out and try different account" : "ออกจากระบบและลองบัญชีอื่น"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
