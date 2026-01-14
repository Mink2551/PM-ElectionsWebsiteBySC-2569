"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useUser } from "@/shared/context/UserContext";

interface Policy {
    title: string;
    description: string;
    likes: number;
    comments?: Record<string, any>;
}

interface CommentSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    policyId: string;
    policy: Policy;
    candidateId: string;
    commentReactions: Record<string, 'like' | 'dislike'>;
    onCommentReaction: (commentId: string, type: 'like' | 'dislike') => Promise<string>;
    onCommentAdded: (commentId: string, comment: any) => void;
}

export default function CommentSidebar({
    isOpen,
    onClose,
    policyId,
    policy,
    candidateId,
    commentReactions,
    onCommentReaction,
    onCommentAdded
}: CommentSidebarProps) {
    const { t } = useLanguage();
    const { user, requireVerification } = useUser();
    const [commentText, setCommentText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [localComments, setLocalComments] = useState(
        policy.comments ? Object.entries(policy.comments).map(([id, data]) => ({ id, ...data })) : []
    );

    // Sync local comments with prop when policy changes
    useEffect(() => {
        setLocalComments(
            policy.comments ? Object.entries(policy.comments).map(([id, data]) => ({ id, ...data })) : []
        );
    }, [policy]);

    const handleAddComment = async () => {
        // Require user verification before commenting
        if (!requireVerification()) return;

        if (!commentText.trim()) return;

        setSubmitting(true);

        try {
            const commentId = crypto.randomUUID();
            const newComment = {
                text: commentText,
                likes: 0,
                dislikes: 0,
                createdAt: new Date().toISOString(),
                authorId: user?.studentId || "anonymous",
                authorNickname: user?.nickname || "Anonymous",
            };

            const ref = doc(db, "candidates", candidateId);
            await updateDoc(ref, {
                [`policies.${policyId}.comments.${commentId}`]: newComment,
            });

            // Update parent state
            onCommentAdded(commentId, newComment);

            // Update local state immediately as well for redundancy/speed
            setLocalComments([...localComments, { id: commentId, ...newComment }]);

            setCommentText("");
        } catch (error) {
            console.error("Error adding comment:", error);
            alert("Failed to add comment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReactionClick = async (commentId: string, type: 'like' | 'dislike') => {
        const result = await onCommentReaction(commentId, type);

        if (result === 'error') return;

        setLocalComments(prev => prev.map(c => {
            if (c.id !== commentId) return c;

            const newC = { ...c };
            if (result === 'removed') {
                newC[`${type}s`] = (newC[`${type}s`] || 0) - 1;
            } else if (result === 'added') {
                newC[`${type}s`] = (newC[`${type}s`] || 0) + 1;
            } else if (result === 'switched') {
                newC[`${type}s`] = (newC[`${type}s`] || 0) + 1;
                const otherType = type === 'like' ? 'dislike' : 'like';
                newC[`${otherType}s`] = Math.max(0, (newC[`${otherType}s`] || 0) - 1);
            }
            return newC;
        }));
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-full md:w-[450px] border-l border-glass-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-glass-border flex items-center justify-between bg-glass">
                        <h3 className="text-xl font-bold text-primary-color">{t("sidebar.comments")}</h3>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-layer-1 text-muted-color hover:text-primary-color transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Comment List (Scrollable) */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-muted-color mb-2">{t("sidebar.discussing")}</h4>
                            <p className="text-primary-color font-medium">{policy.title}</p>
                        </div>

                        {localComments.length > 0 ? (
                            localComments.map((comment: any, i) => {
                                const userReaction = commentReactions[comment.id];
                                return (
                                    <div key={i} className="p-4 rounded-xl bg-layer-1 animate-fadeIn">
                                        {/* Author Info */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded-full bg-accent-gradient-simple flex items-center justify-center text-white text-[10px] font-bold">
                                                {comment.authorNickname?.[0]?.toUpperCase() || "?"}
                                            </div>
                                            <span className="text-sm font-medium text-primary-color">
                                                {comment.authorNickname || "Anonymous"}
                                            </span>
                                            <span className="text-xs text-muted-color">
                                                #{comment.authorId || "???"}
                                            </span>
                                        </div>

                                        <p className="text-sm text-secondary-color leading-relaxed">{comment.text}</p>
                                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-glass-border">
                                            <button
                                                onClick={() => handleReactionClick(comment.id, 'like')}
                                                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${userReaction === 'like' ? 'text-green-400' : 'text-muted-color hover:text-green-400'}`}
                                            >
                                                <svg className="w-4 h-4" fill={userReaction === 'like' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                                </svg>
                                                {comment.likes || 0}
                                            </button>
                                            <button
                                                onClick={() => handleReactionClick(comment.id, 'dislike')}
                                                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${userReaction === 'dislike' ? 'text-red-400' : 'text-muted-color hover:text-red-400'}`}
                                            >
                                                <svg className="w-4 h-4" fill={userReaction === 'dislike' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                                                </svg>
                                                {comment.dislikes || 0}
                                            </button>
                                            <span className="text-xs text-muted-color ml-auto">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-layer-1 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-muted-color" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <p className="text-muted-color">{t("sidebar.no_comments")}</p>
                                <p className="text-sm text-muted-color mt-1">{t("sidebar.start_conversation")}</p>
                            </div>
                        )}
                    </div>

                    {/* Comment Input (Fixed Bottom) */}
                    <div className="p-4 border-t border-glass-border bg-glass">
                        <div className="relative">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder={t("sidebar.placeholder")}
                                className="w-full px-4 py-3 pr-12 rounded-xl bg-layer-1 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none resize-none h-24 text-sm"
                            />
                            <button
                                onClick={handleAddComment}
                                disabled={submitting || !commentText.trim()}
                                className="absolute bottom-3 right-3 p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
