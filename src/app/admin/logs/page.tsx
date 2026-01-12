"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import Navbar from "@/features/navbar/navbar";
import Footer from "@/features/footer/Footer";
import AdminGuard from "@/components/AdminGuard";
import { useLanguage } from "@/shared/context/LanguageContext";
import Link from "next/link";

interface LogEntry {
    id: string;
    action: string;
    target: string;
    details: string;
    timestamp: any;
    adminIp?: string;
}

const actionColors: Record<string, string> = {
    create_candidate: "bg-green-500/20 text-green-400",
    update_candidate: "bg-blue-500/20 text-blue-400",
    delete_candidate: "bg-red-500/20 text-red-400",
    update_votes: "bg-purple-500/20 text-purple-400",
    update_abstain: "bg-purple-500/20 text-purple-400",
    block_user: "bg-yellow-500/20 text-yellow-400",
    unblock_user: "bg-green-500/20 text-green-400",
    delete_user: "bg-red-500/20 text-red-400",
    create_policy: "bg-green-500/20 text-green-400",
    update_policy: "bg-blue-500/20 text-blue-400",
    delete_policy: "bg-red-500/20 text-red-400",
    update_schedule: "bg-indigo-500/20 text-indigo-400",
    update_live_settings: "bg-pink-500/20 text-pink-400",
};

export default function AdminLogsPage() {
    const { language } = useLanguage();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const q = query(
                collection(db, "logs"),
                orderBy("timestamp", "desc"),
                limit(100)
            );
            const snap = await getDocs(q);
            const data = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as LogEntry[];
            setLogs(data);
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    };

    return (
        <AdminGuard>
            <div className="min-h-screen">
                <Navbar />

                <main className="pt-24 pb-16 px-4 md:px-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-2">
                                <Link href="/admin" className="text-muted-color hover:text-primary-color transition-colors">
                                    ← Back
                                </Link>
                            </div>
                            <h1 className="text-3xl font-bold text-primary-color">
                                {language === "en" ? "Admin Activity Logs" : "ประวัติการใช้งาน Admin"}
                            </h1>
                            <p className="text-secondary-color mt-1">
                                {language === "en" ? "Track all administrative actions" : "ติดตามการดำเนินการทั้งหมดของแอดมิน"}
                            </p>
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div className="flex justify-center py-12">
                                <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                            </div>
                        )}

                        {/* Logs List */}
                        {!loading && (
                            <div className="space-y-3">
                                {logs.map((log) => (
                                    <div key={log.id} className="glass-card rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4">
                                        <div className="flex items-center gap-3 flex-1">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${actionColors[log.action] || 'bg-gray-500/20 text-gray-400'}`}>
                                                {log.action.replace(/_/g, ' ')}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-primary-color font-medium truncate">{log.target}</p>
                                                <p className="text-sm text-muted-color truncate">{log.details}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-color">
                                            {log.adminIp && (
                                                <span className="font-mono">{log.adminIp}</span>
                                            )}
                                            <span>{formatTimestamp(log.timestamp)}</span>
                                        </div>
                                    </div>
                                ))}

                                {logs.length === 0 && (
                                    <div className="glass-card rounded-2xl p-12 text-center text-muted-color">
                                        {language === "en" ? "No activity logs yet." : "ยังไม่มีประวัติการใช้งาน"}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>

                <Footer />
            </div>
        </AdminGuard>
    );
}
