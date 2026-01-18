"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteField } from "firebase/firestore";
import Navbar from "@/features/navbar/navbar";
import Footer from "@/features/footer/Footer";
import AdminGuard from "@/components/AdminGuard";
import { useLanguage } from "@/shared/context/LanguageContext";

interface Comment {
    id: string;
    policyId: string;
    policyTitle: string;
    candidateId: string;
    candidateName: string;
    author: string;
    studentId: string;
    text: string;
    createdAt: any;
    likes?: number;
    dislikes?: number;
}

export default function CommentsAdminPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { t, language } = useLanguage();

    useEffect(() => {
        fetchAllComments();
    }, []);

    const fetchAllComments = async () => {
        try {
            const snap = await getDocs(collection(db, "candidates"));
            const allComments: Comment[] = [];

            snap.forEach(candidateDoc => {
                const candidateData = candidateDoc.data();
                const candidateName = `${candidateData.firstname} ${candidateData.lastname}`;
                const policies = candidateData.policies || {};

                Object.entries(policies).forEach(([policyId, policy]: [string, any]) => {
                    const policyComments = policy.comments || {};

                    Object.entries(policyComments).forEach(([commentId, comment]: [string, any]) => {
                        allComments.push({
                            id: commentId,
                            policyId,
                            policyTitle: policy.title || "Untitled Policy",
                            candidateId: candidateDoc.id,
                            candidateName,
                            author: comment.author || "Anonymous",
                            studentId: comment.studentId || "N/A",
                            text: comment.text || "",
                            createdAt: comment.createdAt,
                            likes: comment.likes || 0,
                            dislikes: comment.dislikes || 0,
                        });
                    });
                });
            });

            // Sort by date (newest first)
            allComments.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(0);
                const dateB = b.createdAt?.toDate?.() || new Date(0);
                return dateB.getTime() - dateA.getTime();
            });

            setComments(allComments);
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComment = async (comment: Comment) => {
        if (!confirm(`Delete this comment by "${comment.author}"?`)) return;

        setDeleting(comment.id);
        try {
            const candidateRef = doc(db, "candidates", comment.candidateId);
            await updateDoc(candidateRef, {
                [`policies.${comment.policyId}.comments.${comment.id}`]: deleteField()
            });

            setComments(prev => prev.filter(c => c.id !== comment.id));
        } catch (error) {
            console.error("Error deleting comment:", error);
            alert("Failed to delete comment");
        } finally {
            setDeleting(null);
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return "N/A";
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch {
            return "N/A";
        }
    };

    const filteredComments = comments.filter(comment =>
        comment.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.studentId.includes(searchTerm) ||
        comment.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.policyTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminGuard>
            <div className="min-h-screen transition-colors duration-300">
                <Navbar />

                <main className="pt-24 pb-16 px-4 md:px-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="mb-8 animate-fadeInUp flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold gradient-text mb-2">
                                    {language === "en" ? "Comments Management" : "จัดการความคิดเห็น"}
                                </h1>
                                <p className="text-muted-color">
                                    {language === "en"
                                        ? `${comments.length} comments from all policies`
                                        : `${comments.length} ความคิดเห็นจากทุกนโยบาย`}
                                </p>
                            </div>
                            <a href="/admin" className="text-secondary-color hover:text-primary-color transition-colors">
                                ← {t("common.back")}
                            </a>
                        </div>

                        {/* Search */}
                        <div className="mb-6 animate-fadeInUp" style={{ animationDelay: "50ms" }}>
                            <input
                                type="text"
                                placeholder={language === "en" ? "Search comments, authors, policies..." : "ค้นหาความคิดเห็น, ผู้เขียน, นโยบาย..."}
                                className="w-full px-4 py-3 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Loading */}
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                            </div>
                        ) : filteredComments.length === 0 ? (
                            <div className="glass-card rounded-2xl p-12 text-center">
                                <p className="text-muted-color text-lg">
                                    {searchTerm
                                        ? (language === "en" ? "No matching comments found" : "ไม่พบความคิดเห็นที่ตรงกัน")
                                        : (language === "en" ? "No comments yet" : "ยังไม่มีความคิดเห็น")}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredComments.map((comment, index) => (
                                    <div
                                        key={comment.id}
                                        className="glass-card rounded-xl p-4 animate-fadeInUp"
                                        style={{ animationDelay: `${index * 30}ms` }}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            {/* Comment Content */}
                                            <div className="flex-1 min-w-0">
                                                {/* Author Info */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-semibold text-primary-color">{comment.author}</span>
                                                    <span className="text-xs text-muted-color">#{comment.studentId}</span>
                                                    <span className="text-xs text-muted-color">•</span>
                                                    <span className="text-xs text-muted-color">{formatDate(comment.createdAt)}</span>
                                                </div>

                                                {/* Comment Text */}
                                                <p className="text-secondary-color text-sm mb-3 whitespace-pre-wrap break-words">
                                                    {comment.text}
                                                </p>

                                                {/* Meta Info */}
                                                <div className="flex flex-wrap items-center gap-3 text-xs">
                                                    <span className="px-2 py-1 rounded-full bg-purple-500/10 text-purple-400">
                                                        {comment.candidateName}
                                                    </span>
                                                    <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 truncate max-w-[200px]">
                                                        {comment.policyTitle}
                                                    </span>
                                                    <span className="text-muted-color flex items-center gap-1">
                                                        👍 {comment.likes}
                                                    </span>
                                                    <span className="text-muted-color flex items-center gap-1">
                                                        👎 {comment.dislikes}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                <a
                                                    href={`/candidate/${comment.candidateId}/policies`}
                                                    className="px-3 py-2 rounded-lg bg-layer-1 text-secondary-color text-xs hover:bg-layer-2 hover:text-primary-color transition-colors"
                                                >
                                                    {language === "en" ? "View Policy" : "ดูนโยบาย"}
                                                </a>
                                                <button
                                                    onClick={() => handleDeleteComment(comment)}
                                                    disabled={deleting === comment.id}
                                                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                                >
                                                    {deleting === comment.id ? (
                                                        <div className="w-5 h-5 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
                <Footer />
            </div>
        </AdminGuard>
    );
}
