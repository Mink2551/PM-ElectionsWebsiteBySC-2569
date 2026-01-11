"use client";

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Navbar from "@/features/navbar/navbar";
import Footer from "@/features/footer/Footer";
import { useLanguage } from "@/shared/context/LanguageContext";

interface Policy {
  title: string;
  description: string;
  likes?: number;
  comments?: Record<string, any>;
}

interface Candidate {
  id: string;
  firstname: string;
  lastname: string;
  nickname?: string;
  policies?: Record<string, Policy>;
}

export default function PoliciesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: candidateId } = React.use(params);
  const { t } = useLanguage();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [likedPolicies, setLikedPolicies] = useState<Set<string>>(new Set());
  const [commentReactions, setCommentReactions] = useState<Record<string, 'like' | 'dislike'>>({});
  const [activePolicyId, setActivePolicyId] = useState<string | null>(null);

  // Disable body scroll when sidebar is open
  useEffect(() => {
    if (activePolicyId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activePolicyId]);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const ref = doc(db, "candidates", candidateId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setCandidate({ id: snap.id, ...snap.data() } as Candidate);
        }
      } catch (error) {
        console.error("Error fetching candidate:", error);
      } finally {
        setLoading(false);
      }
    };

    // Load liked policies from cookies
    const loadLikedFromCookies = () => {
      const likedCookie = Cookies.get(`liked_${candidateId}`);
      if (likedCookie) {
        try {
          const liked = JSON.parse(likedCookie);
          setLikedPolicies(new Set(liked));
        } catch (e) {
          console.error("Error parsing liked cookie:", e);
        }
      }

      // Load comment reactions
      const reactionsCookie = Cookies.get(`comment_reactions_${candidateId}`);
      if (reactionsCookie) {
        try {
          setCommentReactions(JSON.parse(reactionsCookie));
        } catch (e) {
          console.error("Error parsing comment reactions:", e);
        }
      }
    };

    fetchCandidate();
    loadLikedFromCookies();
  }, [candidateId]);

  const handleLike = async (policyId: string) => {
    if (likedPolicies.has(policyId)) return;

    try {
      const ref = doc(db, "candidates", candidateId);
      await updateDoc(ref, {
        [`policies.${policyId}.likes`]: increment(1),
      });

      setCandidate((prev) => {
        if (!prev?.policies?.[policyId]) return prev;
        return {
          ...prev,
          policies: {
            ...prev.policies,
            [policyId]: {
              ...prev.policies[policyId],
              likes: (prev.policies[policyId].likes || 0) + 1,
            },
          },
        };
      });

      const newLiked = new Set(likedPolicies);
      newLiked.add(policyId);
      setLikedPolicies(newLiked);
      Cookies.set(`liked_${candidateId}`, JSON.stringify([...newLiked]), { expires: 365 });
    } catch (error) {
      console.error("Error liking policy:", error);
    }
  };

  const handleCommentReaction = async (policyId: string, commentId: string, type: 'like' | 'dislike') => {
    const currentReaction = commentReactions[commentId];
    const ref = doc(db, "candidates", candidateId);

    try {
      if (currentReaction === type) {
        // Remove reaction
        await updateDoc(ref, {
          [`policies.${policyId}.comments.${commentId}.${type}s`]: increment(-1),
        });

        const newReactions = { ...commentReactions };
        delete newReactions[commentId];
        setCommentReactions(newReactions);
        Cookies.set(`comment_reactions_${candidateId}`, JSON.stringify(newReactions), { expires: 365 });

        return "removed";
      } else {
        // Switch or Add reaction
        const updates: any = {
          [`policies.${policyId}.comments.${commentId}.${type}s`]: increment(1),
        };

        if (currentReaction) {
          updates[`policies.${policyId}.comments.${commentId}.${currentReaction}s`] = increment(-1);
        }

        await updateDoc(ref, updates);

        const newReactions = { ...commentReactions, [commentId]: type };
        setCommentReactions(newReactions);
        Cookies.set(`comment_reactions_${candidateId}`, JSON.stringify(newReactions), { expires: 365 });

        return currentReaction ? "switched" : "added";
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
      return "error";
    }
  };

  const handleCommentAdded = (policyId: string, commentId: string, newComment: any) => {
    setCandidate((prev) => {
      if (!prev?.policies?.[policyId]) return prev;
      return {
        ...prev,
        policies: {
          ...prev.policies,
          [policyId]: {
            ...prev.policies[policyId],
            comments: {
              ...(prev.policies[policyId].comments || {}),
              [commentId]: newComment
            }
          }
        }
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen transition-colors duration-300 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen transition-colors duration-300">
        <Navbar />
        <div className="pt-24 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="glass-card rounded-2xl p-12 text-center">
            <p className="text-white/50 text-xl">{t("profile.not_found")}</p>
            <a href="/" className="mt-4 inline-block text-purple-400 hover:text-purple-300">
              ← {t("btn.back_home")}
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const policies = candidate.policies ? Object.entries(candidate.policies) : [];

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Navbar />

      <main className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <a
            href={`/candidate/${candidateId}/profile`}
            className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("policies.back")}
          </a>

          {/* Header */}
          <div className="text-center mb-12 animate-fadeInUp">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-color mb-2">
              {candidate.firstname} {candidate.lastname}'s
            </h1>
            <p className="text-2xl gradient-text font-semibold">{t("policies.title")}</p>
            <p className="text-muted-color mt-4">
              {policies.length} {t("policies.proposed")}
            </p>
          </div>

          {/* Policies List */}
          {policies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {policies.map(([policyId, policy], index) => (
                <PolicyCard
                  key={policyId}
                  policyId={policyId}
                  policy={policy}
                  index={index}
                  isLiked={likedPolicies.has(policyId)}
                  onLike={() => handleLike(policyId)}
                  onOpenComments={() => setActivePolicyId(policyId)}
                  commentCount={policy.comments ? Object.keys(policy.comments).length : 0}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center animate-fadeInUp">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-layer-1 flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-color" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-muted-color text-lg">{t("policies.none")}</p>
              <p className="text-muted-color text-sm mt-1">{t("policies.check_later")}</p>
            </div>
          )}
        </div>
      </main>

      {/* Comment Sidebar */}
      {activePolicyId && candidate.policies && (
        <CommentSidebar
          isOpen={!!activePolicyId}
          onClose={() => setActivePolicyId(null)}
          policyId={activePolicyId}
          policy={candidate.policies[activePolicyId]}
          candidateId={candidateId}
          commentReactions={commentReactions}
          onCommentReaction={(commentId, type) => handleCommentReaction(activePolicyId, commentId, type)}
          onCommentAdded={(commentId, comment) => handleCommentAdded(activePolicyId, commentId, comment)}
        />
      )}

      <Footer />
    </div>
  );
}

/* Policy Card Component */
function PolicyCard({
  policyId,
  policy,
  index,
  isLiked,
  onLike,
  onOpenComments,
  commentCount
}: {
  policyId: string;
  policy: Policy;
  index: number;
  isLiked: boolean;
  onLike: () => void;
  onOpenComments: () => void;
  commentCount: number;
}) {
  const { language, t } = useLanguage();
  return (
    <div
      className="glass-card rounded-2xl p-6 md:p-8 card-hover animate-fadeInUp flex flex-col justify-between h-full"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white">
              {index + 1}
            </div>
            <h2 className="text-xl font-semibold text-primary-color line-clamp-2">{policy.title}</h2>
          </div>

          {/* Like Button */}
          <button
            onClick={onLike}
            disabled={isLiked}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${isLiked
              ? 'bg-pink-500/20 text-pink-400 cursor-default'
              : 'bg-layer-1 text-muted-color hover:bg-pink-500/20 hover:text-pink-400'
              }`}
          >
            <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="font-medium">{policy.likes || 0}</span>
          </button>
        </div>

        {/* Description */}
        <p className="text-secondary-color leading-relaxed mb-6 line-clamp-4">{policy.description}</p>
      </div>

      {/* Footer / Comments Trigger */}
      <div className="border-t border-glass-border pt-4 mt-auto">
        <button
          onClick={onOpenComments}
          className="w-full flex items-center justify-between text-secondary-color hover:text-primary-color transition-colors group"
        >
          <span className="text-sm font-semibold flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {commentCount} {t("sidebar.comments")}
          </span>
          <span className="text-sm text-purple-400 group-hover:text-purple-300 transition-colors">
            {language === "en" ? "Open Comments →" : "ดูความคิดเห็น →"}
          </span>
        </button>
      </div>
    </div>
  );
}

/* Comment Sidebar Component */
function CommentSidebar({
  isOpen,
  onClose,
  policyId,
  policy,
  candidateId,
  commentReactions,
  onCommentReaction,
  onCommentAdded
}: {
  isOpen: boolean;
  onClose: () => void;
  policyId: string;
  policy: Policy;
  candidateId: string;
  commentReactions: Record<string, 'like' | 'dislike'>;
  onCommentReaction: (commentId: string, type: 'like' | 'dislike') => Promise<string>;
  onCommentAdded: (commentId: string, comment: any) => void;
}) {
  const { t } = useLanguage();
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
    if (!commentText.trim()) return;

    setSubmitting(true);

    try {
      const commentId = crypto.randomUUID();
      const newComment = {
        text: commentText,
        likes: 0,
        dislikes: 0,
        createdAt: new Date().toISOString(),
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
        className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#12121a] border-l border-glass-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-glass-border flex items-center justify-between bg-glass">
            <h3 className="text-xl font-bold text-primary-color">{t("sidebar.comments")}</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-layer-1 text-muted-color hover:text-white transition-colors"
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
                <p className="text-sm text-white/40 mt-1">{t("sidebar.start_conversation")}</p>
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
