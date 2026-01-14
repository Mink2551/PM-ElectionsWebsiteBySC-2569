"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, startAfter, doc, setDoc, getDoc, DocumentSnapshot } from "firebase/firestore";
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

interface IpAlias {
    [ip: string]: string;
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

const LOGS_PER_PAGE = 50;

export default function AdminLogsPage() {
    const { language } = useLanguage();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastDocs, setLastDocs] = useState<DocumentSnapshot[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [totalLogs, setTotalLogs] = useState(0);

    // IP Alias system
    const [ipAliases, setIpAliases] = useState<IpAlias>({});
    const [showAliasModal, setShowAliasModal] = useState(false);
    const [editingIp, setEditingIp] = useState("");
    const [aliasName, setAliasName] = useState("");
    const [savingAlias, setSavingAlias] = useState(false);

    useEffect(() => {
        loadIpAliases();
    }, []);

    useEffect(() => {
        if (Object.keys(ipAliases).length >= 0) {
            fetchLogs(1);
        }
    }, [ipAliases]);

    const loadIpAliases = async () => {
        try {
            const aliasDoc = await getDoc(doc(db, "settings", "ipAliases"));
            if (aliasDoc.exists()) {
                setIpAliases(aliasDoc.data() as IpAlias);
            }
        } catch (error) {
            console.error("Error loading IP aliases:", error);
        }
    };

    const saveIpAlias = async () => {
        if (!editingIp || !aliasName.trim()) return;

        setSavingAlias(true);
        try {
            const newAliases = { ...ipAliases, [editingIp]: aliasName.trim() };
            await setDoc(doc(db, "settings", "ipAliases"), newAliases);
            setIpAliases(newAliases);
            setShowAliasModal(false);
            setEditingIp("");
            setAliasName("");
        } catch (error) {
            console.error("Error saving IP alias:", error);
            alert("Failed to save alias");
        } finally {
            setSavingAlias(false);
        }
    };

    const removeIpAlias = async (ip: string) => {
        if (!confirm(`Remove alias for ${ip}?`)) return;

        try {
            const newAliases = { ...ipAliases };
            delete newAliases[ip];
            await setDoc(doc(db, "settings", "ipAliases"), newAliases);
            setIpAliases(newAliases);
        } catch (error) {
            console.error("Error removing IP alias:", error);
        }
    };

    const fetchLogs = async (page: number) => {
        setLoading(true);
        try {
            let q;

            if (page === 1) {
                q = query(
                    collection(db, "logs"),
                    orderBy("timestamp", "desc"),
                    limit(LOGS_PER_PAGE)
                );
            } else {
                const lastDoc = lastDocs[page - 2];
                if (!lastDoc) {
                    setLoading(false);
                    return;
                }
                q = query(
                    collection(db, "logs"),
                    orderBy("timestamp", "desc"),
                    startAfter(lastDoc),
                    limit(LOGS_PER_PAGE)
                );
            }

            const snap = await getDocs(q);
            const data = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as LogEntry[];

            setLogs(data);
            setHasMore(snap.docs.length === LOGS_PER_PAGE);

            // Store last doc for pagination
            if (snap.docs.length > 0) {
                const newLastDocs = [...lastDocs];
                newLastDocs[page - 1] = snap.docs[snap.docs.length - 1];
                setLastDocs(newLastDocs);
            }

            // Get total count on first load
            if (page === 1) {
                const allSnap = await getDocs(collection(db, "logs"));
                setTotalLogs(allSnap.size);
            }

            setCurrentPage(page);
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

    const getDisplayName = (ip: string) => {
        return ipAliases[ip] || ip;
    };

    const totalPages = Math.ceil(totalLogs / LOGS_PER_PAGE);

    return (
        <AdminGuard>
            <div className="min-h-screen">
                <Navbar />

                <main className="pt-24 pb-16 px-4 md:px-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                            <div>
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

                            <div className="flex items-center gap-3">
                                <div className="glass-card rounded-xl px-4 py-2 text-center">
                                    <p className="text-2xl font-bold gradient-text">{totalLogs}</p>
                                    <p className="text-xs text-muted-color">Total Logs</p>
                                </div>
                                <div className="glass-card rounded-xl px-4 py-2 text-center">
                                    <p className="text-2xl font-bold text-purple-400">{Object.keys(ipAliases).length}</p>
                                    <p className="text-xs text-muted-color">IP Aliases</p>
                                </div>
                            </div>
                        </div>

                        {/* IP Aliases Section */}
                        {Object.keys(ipAliases).length > 0 && (
                            <div className="glass-card rounded-xl p-4 mb-6">
                                <h3 className="text-sm font-semibold text-muted-color uppercase mb-3">
                                    {language === "en" ? "IP Aliases" : "ชื่อแทน IP"}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(ipAliases).map(([ip, name]) => (
                                        <div key={ip} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-layer-1 border border-glass-border">
                                            <span className="text-xs font-mono text-muted-color">{ip}</span>
                                            <span className="text-xs text-primary-color">→</span>
                                            <span className="text-sm font-medium text-purple-400">{name}</span>
                                            <button
                                                onClick={() => removeIpAlias(ip)}
                                                className="text-red-400 hover:text-red-300 ml-1"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Loading */}
                        {loading && (
                            <div className="flex justify-center py-12">
                                <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                            </div>
                        )}

                        {/* Logs List */}
                        {!loading && (
                            <>
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
                                                    <button
                                                        onClick={() => {
                                                            setEditingIp(log.adminIp!);
                                                            setAliasName(ipAliases[log.adminIp!] || "");
                                                            setShowAliasModal(true);
                                                        }}
                                                        className={`font-mono px-2 py-1 rounded-lg transition-colors ${ipAliases[log.adminIp]
                                                                ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                                                                : 'bg-layer-1 hover:bg-layer-2'
                                                            }`}
                                                        title="Click to set alias"
                                                    >
                                                        {getDisplayName(log.adminIp)}
                                                    </button>
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

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-8">
                                        <button
                                            onClick={() => fetchLogs(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 rounded-xl bg-layer-1 border border-glass-border text-secondary-color hover:text-primary-color disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            ← Prev
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => fetchLogs(pageNum)}
                                                        className={`w-10 h-10 rounded-xl font-medium transition-all ${currentPage === pageNum
                                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                                                                : 'bg-layer-1 border border-glass-border text-secondary-color hover:text-primary-color'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => fetchLogs(currentPage + 1)}
                                            disabled={!hasMore}
                                            className="px-4 py-2 rounded-xl bg-layer-1 border border-glass-border text-secondary-color hover:text-primary-color disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            Next →
                                        </button>
                                    </div>
                                )}

                                {/* Page Info */}
                                {totalPages > 1 && (
                                    <p className="text-center text-sm text-muted-color mt-4">
                                        Page {currentPage} of {totalPages} ({totalLogs} total logs)
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </main>

                {/* IP Alias Modal */}
                {showAliasModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAliasModal(false)} />
                        <div className="relative w-full max-w-md glass-card rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-primary-color mb-4">
                                {language === "en" ? "Set IP Alias" : "ตั้งชื่อแทน IP"}
                            </h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-muted-color mb-2">IP Address</label>
                                <p className="font-mono text-primary-color bg-layer-1 rounded-xl px-4 py-3">{editingIp}</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-muted-color mb-2">
                                    {language === "en" ? "Display Name" : "ชื่อที่แสดง"}
                                </label>
                                <input
                                    type="text"
                                    value={aliasName}
                                    onChange={(e) => setAliasName(e.target.value)}
                                    placeholder={language === "en" ? "e.g., Admin John" : "เช่น แอดมินจอห์น"}
                                    className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none transition-all"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={saveIpAlias}
                                    disabled={savingAlias || !aliasName.trim()}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:shadow-lg disabled:opacity-50 transition-all"
                                >
                                    {savingAlias ? "Saving..." : (language === "en" ? "Save Alias" : "บันทึก")}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAliasModal(false);
                                        setEditingIp("");
                                        setAliasName("");
                                    }}
                                    className="flex-1 py-3 rounded-xl border border-glass-border text-secondary-color hover:bg-layer-1 transition-colors"
                                >
                                    {language === "en" ? "Cancel" : "ยกเลิก"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <Footer />
            </div>
        </AdminGuard>
    );
}
