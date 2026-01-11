"use client";

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Navbar from "@/features/navbar/navbar";
import Footer from "@/features/footer/Footer";

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

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [likedPolicies, setLikedPolicies] = useState<Set<string>>(new Set());
  const [commentReactions, setCommentReactions] = useState<Record<string, 'like' | 'dislike'>>({});

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

        // Update local state is tricky without re-fetching, 
        // passing handler to child component to update its local state is better
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
            <p className="text-white/50 text-xl">Candidate not found</p>
            <a href="/" className="mt-4 inline-block text-purple-400 hover:text-purple-300">
              ← Back to Home
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
            Back to Profile
          </a>

          {/* Header */}
          <div className="text-center mb-12 animate-fadeInUp">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-color mb-2">
              {candidate.firstname} {candidate.lastname}'s
            </h1>
            <p className="text-2xl gradient-text font-semibold">Policies & Visions</p>
            <p className="text-muted-color mt-4">
              {policies.length} {policies.length === 1 ? 'policy' : 'policies'} proposed
            </p>
          </div>

          {/* Policies List */}
          {policies.length > 0 ? (
            <div className="space-y-6">
              {policies.map(([policyId, policy], index) => (
                <PolicyCard
                  key={policyId}
                  policyId={policyId}
                  candidateId={candidateId}
                  policy={policy}
                  index={index}
                  isLiked={likedPolicies.has(policyId)}
                  onLike={() => handleLike(policyId)}
                  commentReactions={commentReactions}
                  onCommentReaction={(commentId, type) => handleCommentReaction(policyId, commentId, type)}
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
              <p className="text-muted-color text-lg">No policies published yet</p>
              <p className="text-muted-color text-sm mt-1">Check back later for updates</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* Policy Card Component */
function PolicyCard({
  policyId,
  candidateId,
  policy,
  index,
  isLiked,
  onLike,
  commentReactions,
  onCommentReaction
}: {
  policyId: string;
  candidateId: string;
  policy: Policy;
  index: number;
  isLiked: boolean;
  onLike: () => void;
  commentReactions: Record<string, 'like' | 'dislike'>;
  onCommentReaction: (commentId: string, type: 'like' | 'dislike') => Promise<string>;
}) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Store comments with IDs locally
  const [localComments, setLocalComments] = useState(
    policy.comments ? Object.entries(policy.comments).map(([id, data]) => ({ id, ...data })) : []
  );

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

      setLocalComments([...localComments, { id: commentId, ...newComment }]);
      setCommentText("");
      setShowCommentForm(false);
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
    <div
      className="glass-card rounded-2xl p-6 md:p-8 card-hover animate-fadeInUp"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white">
            {index + 1}
          </div>
          <h2 className="text-xl font-semibold text-primary-color">{policy.title}</h2>
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
      <p className="text-secondary-color leading-relaxed mb-6">{policy.description}</p>

      {/* Comments Section */}
      <div className="border-t border-glass-border pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-secondary-color flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Comments ({localComments.length})
          </h3>

          <button
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            {showCommentForm ? 'Cancel' : '+ Add Comment'}
          </button>
        </div>

        {/* Comment Form */}
        {showCommentForm && (
          <div className="mb-4 p-3 rounded-xl bg-layer-1 space-y-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full px-3 py-2 rounded-lg bg-layer-2 border border-glass-border text-primary-color placeholder-muted-color focus:border-purple-500 focus:outline-none resize-none h-20 text-sm"
            />
            <button
              onClick={handleAddComment}
              disabled={submitting || !commentText.trim()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        )}

        {/* Comments List */}
        {localComments.length > 0 ? (
          <div className="space-y-3">
            {localComments.slice(0, 5).map((comment: any, i) => {
              const userReaction = commentReactions[comment.id];
              return (
                <div key={i} className="p-3 rounded-xl bg-layer-1">
                  <p className="text-sm text-secondary-color">{comment.text}</p>
                  <div className="flex items-center gap-3 mt-3">
                    {/* Like Comment */}
                    <button
                      onClick={() => handleReactionClick(comment.id, 'like')}
                      className={`flex items-center gap-1 text-xs transition-colors ${userReaction === 'like' ? 'text-green-400' : 'text-muted-color hover:text-primary-color'
                        }`}
                    >
                      <svg className="w-4 h-4" fill={userReaction === 'like' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      {comment.likes || 0}
                    </button>

                    {/* Dislike Comment */}
                    <button
                      onClick={() => handleReactionClick(comment.id, 'dislike')}
                      className={`flex items-center gap-1 text-xs transition-colors ${userReaction === 'dislike' ? 'text-red-400' : 'text-muted-color hover:text-primary-color'
                        }`}
                    >
                      <svg className="w-4 h-4" fill={userReaction === 'dislike' ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                      </svg>
                      {comment.dislikes || 0}
                    </button>
                  </div>
                </div>
              );
            })}
            {localComments.length > 5 && (
              <p className="text-sm text-purple-400">+{localComments.length - 5} more comments</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-color">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </div>
  );
}
