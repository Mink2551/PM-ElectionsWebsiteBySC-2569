"use client";

import Link from "next/link";
import { useLanguage } from "@/shared/context/LanguageContext";

export default function NotFound() {
    const { language } = useLanguage();

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
            <div className="text-center max-w-md">
                {/* 404 Number */}
                <div className="relative mb-8">
                    <h1 className="text-[150px] md:text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 leading-none">
                        404
                    </h1>
                    <div className="absolute inset-0 text-[150px] md:text-[200px] font-black text-white/5 leading-none animate-pulse">
                        404
                    </div>
                </div>

                {/* Message */}
                <h2 className="text-2xl font-bold text-primary-color mb-4">
                    {language === "en" ? "Page Not Found" : "ไม่พบหน้านี้"}
                </h2>
                <p className="text-secondary-color mb-8">
                    {language === "en"
                        ? "The page you're looking for doesn't exist or has been moved."
                        : "หน้าที่คุณกำลังมองหาไม่มีอยู่หรือถูกย้ายไปแล้ว"}
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                    >
                        {language === "en" ? "Go Home" : "กลับหน้าแรก"}
                    </Link>
                    <Link
                        href="/results"
                        className="px-6 py-3 rounded-xl border border-glass-border text-secondary-color hover:text-primary-color hover:bg-layer-1 transition-all"
                    >
                        {language === "en" ? "View Results" : "ดูผลลัพธ์"}
                    </Link>
                </div>

                {/* Decorative Orbs */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                    <div className="orb orb-1" />
                    <div className="orb orb-2" />
                    <div className="orb orb-3" />
                </div>
            </div>
        </div>
    );
}
