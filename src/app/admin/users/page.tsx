"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import Navbar from "@/features/navbar/navbar";
import Footer from "@/features/footer/Footer";
import AdminGuard from "@/components/AdminGuard";
import { useLanguage } from "@/shared/context/LanguageContext";
import Link from "next/link";

interface User {
    studentId: string;
    nickname: string;
    ip?: string;
    userAgent?: string;
    registeredAt: string;
    lastActive?: string;
    isBlocked: boolean;
    blockReason?: string;
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

    useEffect(() => {
        fetchUsers();
    }, []);

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
            await updateDoc(doc(db, "users", userId), {
                isBlocked: true,
                blockReason: blockReason || "No reason provided"
            });
            setUsers(prev => prev.map(u =>
                u.studentId === userId
                    ? { ...u, isBlocked: true, blockReason: blockReason || "No reason provided" }
                    : u
            ));
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
        } catch (error) {
            console.error("Error unblocking user:", error);
            alert("Failed to unblock user");
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm(`Are you sure you want to delete user ${userId}?`)) return;

        try {
            await deleteDoc(doc(db, "users", userId));
            setUsers(prev => prev.filter(u => u.studentId !== userId));
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user");
        }
    };

    const filteredUsers = users.filter(u =>
        u.studentId.includes(searchTerm) ||
        u.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-color uppercase tracking-wider">Student ID</th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-color uppercase tracking-wider">Nickname</th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-color uppercase tracking-wider">IP</th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-color uppercase tracking-wider">Registered</th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-color uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-right text-xs font-medium text-muted-color uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-glass-border">
                                            {filteredUsers.map((user) => (
                                                <tr key={user.studentId} className={`${user.isBlocked ? 'bg-red-500/5' : ''} hover:bg-layer-1 transition-colors`}>
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono font-bold text-primary-color">{user.studentId}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-secondary-color">{user.nickname}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono text-xs text-muted-color">{user.ip || "N/A"}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs text-muted-color">{new Date(user.registeredAt).toLocaleDateString()}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {user.isBlocked ? (
                                                            <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                                                                Blocked
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                                                                Active
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
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

                <Footer />
            </div>
        </AdminGuard>
    );
}
