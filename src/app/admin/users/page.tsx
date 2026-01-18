"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import Navbar from "@/features/navbar/navbar";
import Footer from "@/features/footer/Footer";
import AdminGuard from "@/components/AdminGuard";
import { useLanguage } from "@/shared/context/LanguageContext";
import Link from "next/link";
import { logAdminAction } from "@/lib/adminLogger";

interface User {
    studentId: string;
    nickname: string;
    ip?: string;
    userAgent?: string;
    deviceType?: "Mobile" | "Tablet" | "Desktop";
    platform?: string;
    browser?: string;
    browserVersion?: string;
    screenResolution?: string;
    registeredAt: string;
    lastActive?: string;
    isBlocked: boolean;
    blockReason?: string;
    isFocused?: boolean;
    warningMessage?: string;
}

export default function AdminUsersPage() {
    const { t, language } = useLanguage();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [blockingId, setBlockingId] = useState<string | null>(null);
    const [blockReason, setBlockReason] = useState("");
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailUser, setDetailUser] = useState<User | null>(null);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningUser, setWarningUser] = useState<User | null>(null);
    const [warningMessage, setWarningMessage] = useState("");
    const [quickTexts, setQuickTexts] = useState<string[]>([]);
    const [newQuickText, setNewQuickText] = useState("");
    const [showQuickTextManager, setShowQuickTextManager] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchQuickTexts();

        // Auto-refresh every 5 seconds for real-time status updates
        const interval = setInterval(() => {
            fetchUsers();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const fetchQuickTexts = async () => {
        try {
            const docRef = doc(db, "settings", "warningTemplates");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setQuickTexts(docSnap.data().templates || []);
            }
        } catch (error) {
            console.error("Error fetching quick texts:", error);
        }
    };

    const handleAddQuickText = async () => {
        if (!newQuickText.trim()) return;
        try {
            const updated = [...quickTexts, newQuickText.trim()];
            await setDoc(doc(db, "settings", "warningTemplates"), { templates: updated });
            setQuickTexts(updated);
            setNewQuickText("");
        } catch (error) {
            console.error("Error adding quick text:", error);
            alert("Failed to add quick text");
        }
    };

    const handleDeleteQuickText = async (index: number) => {
        try {
            const updated = quickTexts.filter((_, i) => i !== index);
            await setDoc(doc(db, "settings", "warningTemplates"), { templates: updated });
            setQuickTexts(updated);
        } catch (error) {
            console.error("Error deleting quick text:", error);
            alert("Failed to delete quick text");
        }
    };

    const fetchUsers = async () => {
        try {
            const snap = await getDocs(collection(db, "users"));
            const data = snap.docs.map(doc => ({
                studentId: doc.id,
                ...doc.data()
            })) as User[];
            setUsers(data.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()));
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBlock = async (userId: string) => {
        try {
            // Generate unique block ID code
            const blockId = `BAN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            const fullBlockReason = `[${blockId}] ${blockReason || "No reason provided"}`;

            await updateDoc(doc(db, "users", userId), {
                isBlocked: true,
                blockReason: fullBlockReason,
                blockId: blockId,
                blockedAt: new Date().toISOString()
            });
            setUsers(prev => prev.map(u =>
                u.studentId === userId
                    ? { ...u, isBlocked: true, blockReason: fullBlockReason }
                    : u
            ));

            await logAdminAction(
                "block_user",
                userId,
                `Reason: ${fullBlockReason}`
            );

            setShowBlockModal(false);
            setBlockReason("");
            setSelectedUser(null);
        } catch (error) {
            console.error("Error blocking user:", error);
            alert("Failed to block user");
        }
    };

    const handleUnblock = async (userId: string) => {
        try {
            await updateDoc(doc(db, "users", userId), {
                isBlocked: false,
                blockReason: ""
            });
            setUsers(prev => prev.map(u =>
                u.studentId === userId
                    ? { ...u, isBlocked: false, blockReason: "" }
                    : u
            ));

            await logAdminAction(
                "unblock_user",
                userId,
                "Unblocked by admin"
            );
        } catch (error) {
            console.error("Error unblocking user:", error);
            alert("Failed to unblock user");
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm(`Are you sure you want to delete user ${userId}?`)) return;

        try {
            await deleteDoc(doc(db, "users", userId));
            await logAdminAction("delete_user", userId, "Deleted by admin");
            setUsers(prev => prev.filter(u => u.studentId !== userId));
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user");
        }
    };

    const handleFocus = async (userId: string, currentlyFocused: boolean) => {
        try {
            await updateDoc(doc(db, "users", userId), {
                isFocused: !currentlyFocused
            });
            setUsers(prev => prev.map(u =>
                u.studentId === userId
                    ? { ...u, isFocused: !currentlyFocused }
                    : u
            ));
            // Also update detailUser if it's the same user
            if (detailUser?.studentId === userId) {
                setDetailUser({ ...detailUser, isFocused: !currentlyFocused });
            }
        } catch (error) {
            console.error("Error toggling focus:", error);
            alert("Failed to toggle focus");
        }
    };

    const handleSetWarning = async (userId: string) => {
        if (!warningMessage.trim()) {
            alert("Please enter a warning message");
            return;
        }
        try {
            // Replace variables: <name> -> user's nickname
            const targetUser = users.find(u => u.studentId === userId);
            let processedMessage = warningMessage.trim();
            if (targetUser) {
                processedMessage = processedMessage.replace(/<name>/gi, targetUser.nickname);
            }

            await updateDoc(doc(db, "users", userId), {
                warningMessage: processedMessage
            });
            setUsers(prev => prev.map(u =>
                u.studentId === userId
                    ? { ...u, warningMessage: processedMessage }
                    : u
            ));
            setShowWarningModal(false);
            setWarningMessage("");
            setWarningUser(null);
        } catch (error) {
            console.error("Error setting warning:", error);
            alert("Failed to set warning");
        }
    };

    const handleClearWarning = async (userId: string) => {
        try {
            await updateDoc(doc(db, "users", userId), {
                warningMessage: ""
            });
            setUsers(prev => prev.map(u =>
                u.studentId === userId
                    ? { ...u, warningMessage: "" }
                    : u
            ));
            // Also update detailUser if it's the same user
            if (detailUser?.studentId === userId) {
                setDetailUser({ ...detailUser, warningMessage: "" });
            }
        } catch (error) {
            console.error("Error clearing warning:", error);
            alert("Failed to clear warning");
        }
    };

    const filteredUsers = users.filter(u =>
        u.studentId.includes(searchTerm) ||
        u.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helper function to determine activity status based on lastActive
    const getActivityStatus = (lastActive?: string) => {
        if (!lastActive) return { status: "Offline", color: "gray", isOnline: false };

        const lastActiveDate = new Date(lastActive);
        const now = new Date();
        const diffMinutes = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60);

        if (diffMinutes < 5) {
            return { status: "Online", color: "green", isOnline: true };
        } else if (diffMinutes < 15) {
            return { status: "Away", color: "yellow", isOnline: false };
        } else {
            return { status: "Offline", color: "gray", isOnline: false };
        }
    };

    const onlineCount = users.filter(u => !u.isBlocked && getActivityStatus(u.lastActive).isOnline).length;

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
                                    {language === "en" ? "User Management" : "จัดการผู้ใช้"}
                                </h1>
                                <p className="text-secondary-color mt-1">
                                    {language === "en" ? "View, block, or delete registered users" : "ดู บล็อก หรือลบผู้ใช้ที่ลงทะเบียน"}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="glass-card rounded-xl px-4 py-2 text-center">
                                    <p className="text-2xl font-bold gradient-text">{users.length}</p>
                                    <p className="text-xs text-muted-color">Total Users</p>
                                </div>
                                <div className="glass-card rounded-xl px-4 py-2 text-center">
                                    <p className="text-2xl font-bold text-green-400">{onlineCount}</p>
                                    <p className="text-xs text-muted-color">Online</p>
                                </div>
                                <div className="glass-card rounded-xl px-4 py-2 text-center">
                                    <p className="text-2xl font-bold text-red-400">{users.filter(u => u.isBlocked).length}</p>
                                    <p className="text-xs text-muted-color">Blocked</p>
                                </div>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="mb-6">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={language === "en" ? "Search by ID or nickname..." : "ค้นหาด้วยรหัสหรือชื่อเล่น..."}
                                className="w-full md:w-80 px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none transition-all"
                            />
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div className="flex justify-center py-12">
                                <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                            </div>
                        )}

                        {/* Users Table */}
                        {!loading && (
                            <div className="glass-card rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-glass-border">
                                                <th className="px-4 py-4 text-left text-xs font-medium text-muted-color uppercase tracking-wider">Student ID</th>
                                                <th className="px-4 py-4 text-left text-xs font-medium text-muted-color uppercase tracking-wider">Nickname</th>
                                                <th className="px-4 py-4 text-left text-xs font-medium text-muted-color uppercase tracking-wider">Device</th>
                                                <th className="px-4 py-4 text-left text-xs font-medium text-muted-color uppercase tracking-wider">Browser</th>
                                                <th className="px-4 py-4 text-left text-xs font-medium text-muted-color uppercase tracking-wider">IP</th>
                                                <th className="px-4 py-4 text-left text-xs font-medium text-muted-color uppercase tracking-wider">Registered</th>
                                                <th className="px-4 py-4 text-left text-xs font-medium text-muted-color uppercase tracking-wider">Status</th>
                                                <th className="px-4 py-4 text-left text-xs font-medium text-muted-color uppercase tracking-wider">Focus</th>
                                                <th className="px-4 py-4 text-right text-xs font-medium text-muted-color uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-glass-border">
                                            {filteredUsers.map((user) => (
                                                <tr key={user.studentId} className={`${user.isBlocked ? 'bg-red-500/5' : ''} hover:bg-layer-1 transition-colors`}>
                                                    <td className="px-4 py-4">
                                                        <span className={`font-mono font-bold ${user.isBlocked
                                                                ? 'text-red-400'
                                                                : user.warningMessage
                                                                    ? 'text-orange-400'
                                                                    : 'text-primary-color'
                                                            }`}>{user.studentId}</span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-secondary-color">{user.nickname}</span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg">
                                                                {user.deviceType === "Mobile" ? "📱" : user.deviceType === "Tablet" ? "📲" : "🖥️"}
                                                            </span>
                                                            <span className="text-xs text-muted-color">{user.platform || "N/A"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-xs text-muted-color">
                                                            {user.browser || "N/A"}{user.browserVersion ? ` v${user.browserVersion.split('.')[0]}` : ""}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="font-mono text-xs text-muted-color">{user.ip || "N/A"}</span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-xs text-muted-color">{new Date(user.registeredAt).toLocaleDateString()}</span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {user.isBlocked ? (
                                                            <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                                                                Blocked
                                                            </span>
                                                        ) : (() => {
                                                            const activity = getActivityStatus(user.lastActive);
                                                            return (
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${activity.color === 'green' ? 'bg-green-500/20 text-green-400' :
                                                                    activity.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                        'bg-gray-500/20 text-gray-400'
                                                                    }`}>
                                                                    {activity.status}
                                                                </span>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {user.isFocused ? (
                                                            <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium animate-pulse">
                                                                🔴 Tracking
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-muted-color">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setDetailUser(user);
                                                                    setShowDetailModal(true);
                                                                }}
                                                                className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-xs font-medium transition-colors"
                                                            >
                                                                View
                                                            </button>
                                                            {user.isBlocked ? (
                                                                <button
                                                                    onClick={() => handleUnblock(user.studentId)}
                                                                    className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs font-medium transition-colors"
                                                                >
                                                                    Unblock
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedUser(user);
                                                                        setShowBlockModal(true);
                                                                    }}
                                                                    className="px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 text-xs font-medium transition-colors"
                                                                >
                                                                    Block
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => {
                                                                    setWarningUser(user);
                                                                    setWarningMessage(user.warningMessage || "");
                                                                    setShowWarningModal(true);
                                                                }}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${user.warningMessage
                                                                    ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                                                                    : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
                                                                    }`}
                                                                title={user.warningMessage ? `Warning: ${user.warningMessage}` : "Set warning"}
                                                            >
                                                                {user.warningMessage ? '⚠️ Warn' : 'Warn'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(user.studentId)}
                                                                className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {filteredUsers.length === 0 && (
                                    <div className="py-12 text-center text-muted-color">
                                        {searchTerm ? "No users found matching your search." : "No users registered yet."}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>

                {/* Block Modal */}
                {showBlockModal && selectedUser && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBlockModal(false)} />
                        <div className="relative w-full max-w-md glass-card rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-primary-color mb-4">
                                Block User: {selectedUser.studentId}
                            </h3>
                            <p className="text-secondary-color mb-4">
                                Are you sure you want to block "{selectedUser.nickname}"?
                            </p>
                            <textarea
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                placeholder="Reason for blocking (optional)"
                                className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none resize-none h-24 mb-4"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleBlock(selectedUser.studentId)}
                                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                                >
                                    Block User
                                </button>
                                <button
                                    onClick={() => {
                                        setShowBlockModal(false);
                                        setSelectedUser(null);
                                        setBlockReason("");
                                    }}
                                    className="flex-1 py-3 rounded-xl border border-glass-border text-secondary-color hover:bg-layer-1 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Detail Modal */}
                {showDetailModal && detailUser && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
                        <div className="relative w-full max-w-lg glass-card rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-bold text-primary-color mb-6 flex items-center gap-3">
                                <span className="text-2xl">
                                    {detailUser.deviceType === "Mobile" ? "📱" : detailUser.deviceType === "Tablet" ? "📲" : "🖥️"}
                                </span>
                                User Details
                            </h3>

                            <div className="space-y-4">
                                {/* Basic Info */}
                                <div className="bg-layer-1 rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-muted-color uppercase mb-3">Basic Information</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-muted-color">Student ID</p>
                                            <p className="font-mono font-bold text-primary-color">{detailUser.studentId}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-color">Nickname</p>
                                            <p className="text-secondary-color">{detailUser.nickname}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-color">Status</p>
                                            {detailUser.isBlocked ? (
                                                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                                                    Blocked
                                                </span>
                                            ) : (() => {
                                                const activity = getActivityStatus(detailUser.lastActive);
                                                return (
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${activity.color === 'green' ? 'bg-green-500/20 text-green-400' :
                                                        activity.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                        {activity.status}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                        {detailUser.blockReason && (
                                            <div>
                                                <p className="text-xs text-muted-color">Block Reason</p>
                                                <p className="text-red-400 text-sm">{detailUser.blockReason}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Device Info */}
                                <div className="bg-layer-1 rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-muted-color uppercase mb-3">Device Information</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-muted-color">Device Type</p>
                                            <p className="text-secondary-color flex items-center gap-2">
                                                <span>{detailUser.deviceType === "Mobile" ? "📱" : detailUser.deviceType === "Tablet" ? "📲" : "🖥️"}</span>
                                                {detailUser.deviceType || "N/A"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-color">Platform</p>
                                            <p className="text-secondary-color">{detailUser.platform || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-color">Browser</p>
                                            <p className="text-secondary-color">{detailUser.browser || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-color">Browser Version</p>
                                            <p className="text-secondary-color">{detailUser.browserVersion || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-color">Screen Resolution</p>
                                            <p className="text-secondary-color">{detailUser.screenResolution || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-color">IP Address</p>
                                            <p className="font-mono text-secondary-color">{detailUser.ip || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* User Agent */}
                                <div className="bg-layer-1 rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-muted-color uppercase mb-3">User Agent</h4>
                                    <p className="text-xs text-muted-color font-mono break-all bg-black/20 p-3 rounded-lg">
                                        {detailUser.userAgent || "N/A"}
                                    </p>
                                </div>

                                {/* Timestamps */}
                                <div className="bg-layer-1 rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-muted-color uppercase mb-3">Timestamps</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-muted-color">Registered At</p>
                                            <p className="text-secondary-color text-sm">
                                                {new Date(detailUser.registeredAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-color">Last Active</p>
                                            <p className="text-secondary-color text-sm">
                                                {detailUser.lastActive ? new Date(detailUser.lastActive).toLocaleString() : "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Focus Mode Toggle */}
                            <div className="bg-layer-1 rounded-xl p-4 mt-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-semibold text-primary-color">Real-time Tracking</h4>
                                        <p className="text-xs text-muted-color mt-1">
                                            {detailUser.isFocused
                                                ? "🔴 Tracking every 5 seconds"
                                                : "Updates every 2 minutes"
                                            }
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleFocus(detailUser.studentId, detailUser.isFocused || false)}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${detailUser.isFocused
                                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-pulse'
                                            : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                                            }`}
                                    >
                                        {detailUser.isFocused ? '🔴 Stop Tracking' : '👁️ Start Focus'}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setShowDetailModal(false);
                                    setDetailUser(null);
                                }}
                                className="w-full mt-4 py-3 rounded-xl border border-glass-border text-secondary-color hover:bg-layer-1 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {/* Warning Modal */}
                {showWarningModal && warningUser && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowWarningModal(false)} />
                        <div className="relative w-full max-w-md glass-card rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-primary-color mb-4 flex items-center gap-2">
                                ⚠️ {language === "en" ? "Set Warning for" : "ตั้งค่าคำเตือนสำหรับ"}: {warningUser.nickname}
                            </h3>
                            <p className="text-secondary-color mb-4 text-sm">
                                {language === "en"
                                    ? "This warning will be shown as a popup when the user opens the website."
                                    : "คำเตือนนี้จะแสดงเป็น popup เมื่อผู้ใช้เปิดเว็บไซต์"}
                            </p>

                            {/* Quick Text Presets */}
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs text-muted-color">{language === "en" ? "Quick Text:" : "ข้อความด่วน:"}</p>
                                    <button
                                        type="button"
                                        onClick={() => setShowQuickTextManager(!showQuickTextManager)}
                                        className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                                    >
                                        {showQuickTextManager ? "✕ Close" : "+ Manage"}
                                    </button>
                                </div>

                                {/* Add New Quick Text */}
                                {showQuickTextManager && (
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={newQuickText}
                                            onChange={(e) => setNewQuickText(e.target.value)}
                                            placeholder={language === "en" ? "Add new quick text..." : "เพิ่มข้อความด่วนใหม่..."}
                                            className="flex-1 px-3 py-2 rounded-lg bg-layer-1 border border-glass-border text-primary-color text-xs placeholder-muted-color focus:border-purple-500 focus:outline-none"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAddQuickText();
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddQuickText}
                                            className="px-3 py-2 rounded-lg bg-purple-500 text-white text-xs font-medium hover:bg-purple-600 transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                )}

                                {/* Quick Text Buttons */}
                                <div className="flex flex-wrap gap-2">
                                    {quickTexts.length === 0 ? (
                                        <p className="text-xs text-muted-color italic">
                                            {language === "en" ? "No quick texts yet. Click 'Manage' to add." : "ยังไม่มีข้อความด่วน กด 'Manage' เพื่อเพิ่ม"}
                                        </p>
                                    ) : (
                                        quickTexts.map((text, index) => (
                                            <div key={index} className="flex items-center gap-1 group">
                                                <button
                                                    type="button"
                                                    onClick={() => setWarningMessage(text)}
                                                    className="px-3 py-1.5 rounded-lg bg-layer-1 border border-glass-border text-xs text-secondary-color hover:bg-layer-2 hover:text-primary-color transition-colors max-w-[200px] truncate"
                                                    title={text}
                                                >
                                                    {text.length > 20 ? text.substring(0, 20) + "..." : text}
                                                </button>
                                                {showQuickTextManager && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteQuickText(index)}
                                                        className="p-1 rounded text-red-400 hover:bg-red-500/20 transition-colors"
                                                        title="Delete"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <textarea
                                value={warningMessage}
                                onChange={(e) => setWarningMessage(e.target.value)}
                                placeholder={language === "en" ? "Enter warning message..." : "ใส่ข้อความเตือน..."}
                                className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-orange-500 focus:outline-none resize-none h-32 mb-4"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleSetWarning(warningUser.studentId)}
                                    className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors"
                                >
                                    {language === "en" ? "Set Warning" : "ตั้งค่าคำเตือน"}
                                </button>
                                {warningUser.warningMessage && (
                                    <button
                                        onClick={() => {
                                            handleClearWarning(warningUser.studentId);
                                            setShowWarningModal(false);
                                            setWarningUser(null);
                                            setWarningMessage("");
                                        }}
                                        className="flex-1 py-3 rounded-xl bg-green-500/20 text-green-400 font-semibold hover:bg-green-500/30 transition-colors"
                                    >
                                        {language === "en" ? "Clear Warning" : "ล้างคำเตือน"}
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setShowWarningModal(false);
                                        setWarningUser(null);
                                        setWarningMessage("");
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
