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
  // Extended Profile Fields
  studyPlan?: string;         // แผนการเรียน
  birthday?: string;          // เกิดวันที่
  bloodType?: string;         // หมู่เลือด
  hobbies?: string[];         // งานอดิเรก (array)
  achievements?: string;      // ผลงาน
  instagram?: string;         // Instagram ส่วนตัว
  educationHistory?: {        // ประวัติการศึกษา
    prevSchool?: string;
    prevGrade?: string;
    currentSchool?: string;
    currentGrade?: string;
  };
  motivation?: string;        // ทำไมถึงสมัครประธานนักเรียน
}

export default function CandidateProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: candidateId } = React.use(params);
  const { t, language } = useLanguage();

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
            <a href="/" className="mt-4 inline-block text-accent hover:opacity-80">
              ← {t("btn.back_home")}
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const policyCount = candidate.policies ? Object.keys(candidate.policies).length : 0;

  // Labels based on language
  const labels = language === "th" ? {
    studyPlan: "แผนการเรียน",
    birthday: "เกิดวันที่",
    bloodType: "หมู่เลือด",
    hobbies: "งานอดิเรก",
    achievements: "ผลงาน",
    instagram: "Instagram ส่วนตัว",
    education: "ประวัติการศึกษา",
    prevSchool: "โรงเรียนเดิม",
    prevGrade: "ชั้นปีเดิม",
    currentSchool: "โรงเรียนปัจจุบัน",
    currentGrade: "ชั้นปีปัจจุบัน",
    motivation: "ทำไมถึงสมัครประธานนักเรียน?",
    personalInfo: "ข้อมูลส่วนตัว",
  } : {
    studyPlan: "Study Program",
    birthday: "Birthday",
    bloodType: "Blood Type",
    hobbies: "Hobbies",
    achievements: "Achievements",
    instagram: "Personal Instagram",
    education: "Education History",
    prevSchool: "Previous School",
    prevGrade: "Previous Grade",
    currentSchool: "Current School",
    currentGrade: "Current Grade",
    motivation: "Why run for Student President?",
    personalInfo: "Personal Information",
  };

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
                  <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
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
                <p className="text-accent text-xl font-semibold">"{candidate.nickname}"</p>
              )}
              <p className="text-muted-color">{t("profile.class")} 4 / {candidate.class}</p>

              {/* Instagram Link Button */}
              {candidate.instagram && (
                <a
                  href={candidate.instagram.startsWith('http') ? candidate.instagram : `https://instagram.com/${candidate.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-pink-500/30 transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  {candidate.instagram.replace('https://instagram.com/', '@').replace('https://www.instagram.com/', '@')}
                </a>
              )}
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
                <p className="text-2xl font-bold gradient-text">{t("profile.class")}4/{candidate.class}</p>
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

            {/* Extended Personal Information */}
            {(candidate.studyPlan || candidate.birthday || candidate.bloodType || candidate.hobbies?.length || candidate.achievements || candidate.educationHistory || candidate.motivation) && (
              <div className="mb-8 space-y-6">
                <h2 className="text-lg font-semibold text-primary-color flex items-center gap-2">
                  <span className="w-1 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"></span>
                  {labels.personalInfo}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Study Plan */}
                  {candidate.studyPlan && (
                    <div className="p-4 rounded-xl bg-layer-1">
                      <p className="text-xs text-muted-color uppercase tracking-wider mb-1">{labels.studyPlan}</p>
                      <p className="text-primary-color font-medium">{candidate.studyPlan}</p>
                    </div>
                  )}

                  {/* Birthday */}
                  {candidate.birthday && (
                    <div className="p-4 rounded-xl bg-layer-1">
                      <p className="text-xs text-muted-color uppercase tracking-wider mb-1">{labels.birthday}</p>
                      <p className="text-primary-color font-medium">{candidate.birthday}</p>
                    </div>
                  )}

                  {/* Blood Type */}
                  {candidate.bloodType && (
                    <div className="p-4 rounded-xl bg-layer-1">
                      <p className="text-xs text-muted-color uppercase tracking-wider mb-1">{labels.bloodType}</p>
                      <p className="text-primary-color font-medium">{candidate.bloodType}</p>
                    </div>
                  )}

                  {/* Hobbies */}
                  {candidate.hobbies && candidate.hobbies.length > 0 && (
                    <div className="p-4 rounded-xl bg-layer-1">
                      <p className="text-xs text-muted-color uppercase tracking-wider mb-2">{labels.hobbies}</p>
                      <div className="flex flex-wrap gap-2">
                        {candidate.hobbies.map((hobby, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm">
                            {hobby}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Achievements */}
                {candidate.achievements && (
                  <div className="p-4 rounded-xl bg-layer-1">
                    <p className="text-xs text-muted-color uppercase tracking-wider mb-2">{labels.achievements}</p>
                    <p className="text-secondary-color leading-relaxed whitespace-pre-line">{candidate.achievements}</p>
                  </div>
                )}

                {/* Education History */}
                {candidate.educationHistory && (
                  <div className="p-4 rounded-xl bg-layer-1">
                    <p className="text-xs text-muted-color uppercase tracking-wider mb-3">{labels.education}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {candidate.educationHistory.prevSchool && (
                        <div>
                          <p className="text-xs text-muted-color">{labels.prevSchool}</p>
                          <p className="text-primary-color">{candidate.educationHistory.prevSchool}</p>
                          {candidate.educationHistory.prevGrade && (
                            <p className="text-sm text-secondary-color">{labels.prevGrade}: {candidate.educationHistory.prevGrade}</p>
                          )}
                        </div>
                      )}
                      {candidate.educationHistory.currentSchool && (
                        <div>
                          <p className="text-xs text-muted-color">{labels.currentSchool}</p>
                          <p className="text-primary-color">{candidate.educationHistory.currentSchool}</p>
                          {candidate.educationHistory.currentGrade && (
                            <p className="text-sm text-secondary-color">{labels.currentGrade}: {candidate.educationHistory.currentGrade}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Motivation */}
                {candidate.motivation && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-purple-500/20">
                    <p className="text-xs text-muted-color uppercase tracking-wider mb-2">{labels.motivation}</p>
                    <p className="text-secondary-color leading-relaxed whitespace-pre-line">{candidate.motivation}</p>
                  </div>
                )}
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
                  className="block mt-4 text-center text-accent hover:opacity-80 text-sm"
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

