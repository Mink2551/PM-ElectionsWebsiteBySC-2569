"use client";

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Navbar from "@/features/navbar/navbar";
import Footer from "@/features/footer/Footer";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useUser } from "@/shared/context/UserContext";
import PolicyCard from "@/components/PolicyCard";
import CommentSidebar from "@/components/CommentSidebar";

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
  imageUrl?: string;
  photoURL?: string;
  policies?: Record<string, Policy>;
}

export default function PoliciesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: candidateId } = React.use(params);
  const { t } = useLanguage();
  const { user, requireVerification } = useUser();

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
    // Require user verification before liking
    if (!requireVerification()) return;

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
    // Require user verification before reacting
    if (!requireVerification()) return "blocked";

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
            <a href="/" className="mt-4 inline-block text-accent hover:opacity-80">
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
        <div className="max-w-7xl mx-auto">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {policies.map(([policyId, policy], index) => (
                <PolicyCard
                  key={policyId}
                  policyId={policyId}
                  policy={policy as any}
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
          policy={candidate.policies[activePolicyId] as any}
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
