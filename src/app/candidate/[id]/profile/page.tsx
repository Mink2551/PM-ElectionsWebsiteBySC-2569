"use client";

import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import Navbar from "@/features/navbar/navbar";
import Footer from "@/features/footer/Footer";
import { useLanguage } from "@/shared/context/LanguageContext";

interface Candidate {
  id: string;
  firstname: string;
  lastname: string;
  nickname?: string;
  class?: string;
  votes: number;
  imageUrl?: string;
  photoURL?: string;
  bio?: string;
  policies?: Record<string, any>;
}

export default function CandidateProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: candidateId } = React.use(params);
  const { t } = useLanguage();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

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

    fetchCandidate();
  }, [candidateId]);

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

  const policyCount = candidate.policies ? Object.keys(candidate.policies).length : 0;

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Navbar />

      <main className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Back Link */}
          <a href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("profile.back")}
          </a>

          {/* Profile Card */}
          <div className="glass-card rounded-3xl p-8 md:p-12 animate-fadeInUp">
            {/* Avatar */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[4px] animate-pulseGlow">
                  <div className="w-full h-full rounded-full bg-[#12121a] flex items-center justify-center overflow-hidden">
                    {candidate.imageUrl || candidate.photoURL ? (
                      <img
                        src={candidate.imageUrl || candidate.photoURL}
                        alt={candidate.firstname}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-bold gradient-text">
                        {candidate.firstname?.[0]}{candidate.lastname?.[0]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-xs font-medium text-white">
                  {t("profile.candidate")}
                </div>
              </div>
            </div>

            {/* Name & Info */}
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-primary-color">
                {candidate.firstname} {candidate.lastname}
              </h1>
              {candidate.nickname && (
                <p className="text-purple-400 text-lg">"{candidate.nickname}"</p>
              )}
              <p className="text-muted-color">Class 4 / {candidate.class}</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 rounded-xl bg-layer-1">
                <p className="text-2xl font-bold gradient-text">{candidate.votes || 0}</p>
                <p className="text-muted-color text-sm">{t("profile.votes")}</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-layer-1">
                <p className="text-2xl font-bold gradient-text">{policyCount}</p>
                <p className="text-muted-color text-sm">{t("profile.policies")}</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-layer-1">
                <p className="text-2xl font-bold gradient-text">4 / {candidate.class}</p>
                <p className="text-muted-color text-sm">{t("profile.class")}</p>
              </div>
            </div>

            {/* Bio */}
            {candidate.bio && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-primary-color mb-3">{t("profile.about")}</h2>
                <p className="text-secondary-color leading-relaxed">{candidate.bio}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`/candidate/${candidate.id}/policies`}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-center hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:-translate-y-0.5"
              >
                {t("card.view_policies")}
              </a>
              <a
                href="/results"
                className="flex-1 py-3 rounded-xl border border-glass-border text-primary-color font-semibold text-center hover:bg-layer-1 transition-all"
              >
                {t("results.live")}
              </a>
            </div>
          </div>

          {/* Policies Preview */}
          {candidate.policies && Object.keys(candidate.policies).length > 0 && (
            <div className="mt-8 animate-fadeInUp" style={{ animationDelay: "100ms" }}>
              <h2 className="text-xl font-semibold text-primary-color mb-4 flex items-center gap-2">
                <span className="w-1 h-6 rounded-full bg-gradient-to-b from-purple-500 to-pink-500"></span>
                {t("profile.policies_overview")}
              </h2>

              <div className="space-y-3">
                {Object.entries(candidate.policies).slice(0, 3).map(([id, policy]: [string, any]) => (
                  <div key={id} className="glass-card rounded-xl p-4 hover:bg-layer-1 transition-colors">
                    <h3 className="font-medium text-primary-color">{policy.title}</h3>
                    <p className="text-sm text-secondary-color line-clamp-2 mt-1">{policy.description}</p>
                  </div>
                ))}
              </div>

              {policyCount > 3 && (
                <a
                  href={`/candidate/${candidate.id}/policies`}
                  className="block mt-4 text-center text-purple-400 hover:text-purple-300 text-sm"
                >
                  {t("btn.view_all_policies")} {policyCount} {t("profile.policies")} →
                </a>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
