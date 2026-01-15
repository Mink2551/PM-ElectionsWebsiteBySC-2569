"use client";

import { useDeviceType } from "@/shared/hooks/checkDevice";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useLanguage } from "@/shared/context/LanguageContext";
import StatBox from "@/components/StatBox";
import CandidateCard from "@/components/CandidateCard";
import TrendingPolicyCard from "@/components/TrendingPolicyCard";

export default function Hero() {
  const device = useDeviceType();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [trendingPolicies, setTrendingPolicies] = useState<any[]>([]);
  const [topCandidates, setTopCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const [liveUrl, setLiveUrl] = useState("");

  // Fetch candidates and live settings
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Candidates
        const snap = await getDocs(collection(db, "candidates"));
        const docs = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort by candidate number
        docs.sort((a: any, b: any) => (a.candidateNumber || 999) - (b.candidateNumber || 999));
        setCandidates(docs);

        // Calculate Trending Policies
        const allPolicies: any[] = [];
        docs.forEach((candidate: any) => {
          if (candidate.policies) {
            Object.entries(candidate.policies).forEach(([id, policy]: [string, any]) => {
              // Calculate interaction score
              let commentLikes = 0;
              const comments = policy.comments ? Object.values(policy.comments) : [];
              comments.forEach((c: any) => {
                commentLikes += (c.likes || 0) + (c.dislikes || 0); // Count all reactions as engagement
              });

              const score = (policy.likes || 0) + comments.length + commentLikes;

              allPolicies.push({
                id,
                ...policy,
                candidateName: `${candidate.firstname} ${candidate.lastname}`,
                candidateNickname: candidate.nickname,
                candidateId: candidate.id,
                candidateImage: candidate.imageUrl || candidate.photoURL,
                commentCount: comments.length,
                totalLikes: policy.likes || 0,
                interactionScore: score
              });
            });
          }
        });

        // Get Top 5
        const top5 = allPolicies
          .sort((a, b) => b.interactionScore - a.interactionScore)
          .slice(0, 5);

        setTrendingPolicies(top5);

        // Calculate Top Candidates (based on total engagement)
        const candidateScores = docs.map((candidate: any) => {
          let totalScore = 0;
          if (candidate.policies) {
            Object.values(candidate.policies).forEach((policy: any) => {
              let commentLikes = 0;
              const comments = policy.comments ? Object.values(policy.comments) : [];
              comments.forEach((c: any) => {
                commentLikes += (c.likes || 0) + (c.dislikes || 0);
              });
              totalScore += (policy.likes || 0) + comments.length + commentLikes;
            });
          }
          return {
            ...candidate,
            totalEngagement: totalScore
          };
        });

        const top3Candidates = candidateScores
          .sort((a, b) => b.totalEngagement - a.totalEngagement)
          .slice(0, 3);

        setTopCandidates(top3Candidates);

        // Fetch Live Settings
        const settingsSnap = await getDoc(doc(db, "settings", "config"));
        if (settingsSnap.exists()) {
          setLiveUrl(settingsSnap.data().liveUrl || "");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const gridClass =
    device === "phone"
      ? "grid-cols-1"
      : device === "ipad"
        ? "grid-cols-2"
        : device === "laptop"
          ? "grid-cols-3"
          : "grid-cols-4";

  return (
    <section className="relative min-h-screen px-4 md:px-8 py-20 overflow-hidden">
      {/* Background Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col items-center text-center space-y-6 mb-16 animate-fadeInUp">


          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-secondary-color">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            {t("hero.badge")}
          </div>

          {/* Main Title */}
          <h1
            className={`
              font-extrabold leading-tight
              ${device === "phone" && "text-4xl"}
              ${device === "ipad" && "text-5xl"}
              ${device === "laptop" && "text-6xl"}
              ${device === "pc" && "text-7xl"}
              `}
          >
            <span className="gradient-text">{t("hero.title1")}</span>
            <br />
            <span className="text-primary-color">{t("hero.title2")}</span>
          </h1>

          {/* Description */}
          <p className="text-secondary-color max-w-2xl text-base md:text-lg leading-relaxed">
            {t("hero.desc")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <a
              href="#candidates"
              className="px-8 py-3 rounded-xl bg-accent-gradient text-white font-semibold shadow-accent shadow-accent-hover transition-all duration-300 hover:-translate-y-1"
            >
              {t("hero.cta.view")}
            </a>
            <a
              href="/results"
              className="px-8 py-3 rounded-xl border border-current/20 text-primary-color font-semibold hover:bg-layer-1 transition-all duration-300"
            >
              {t("hero.cta.results")}
            </a>
          </div>
        </div>

        {/* ================= STATS BAR ================= */}
        <div className="flex justify-center gap-8 md:gap-16 mb-16">
          <StatBox value={candidates.length} label={t("stats.candidates")} />
          <StatBox value="500+" label={t("stats.voters")} />
        </div>

        {/* Live Stream Section */}
        {liveUrl && (
          <div className="w-full max-w-4xl mx-auto mb-8 animate-fadeInUp">
            <div className="glass-card rounded-2xl overflow-hidden p-1 bg-gradient-to-tr from-red-600 to-pink-600 shadow-2xl shadow-red-500/20">
              <div className="bg-black/40 backdrop-blur-sm px-4 py-2 flex items-center gap-2 text-white font-bold text-sm tracking-widest uppercase mb-[1px]">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                {t("live.badge")}
              </div>
              <div className="relative pt-[56.25%] bg-black">
                {/* Facebook Embed */}
                <iframe
                  src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(liveUrl)}&show_text=false&t=0`}
                  className="absolute top-0 left-0 w-full h-full border-none"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                ></iframe>
              </div>
            </div>
          </div>
        )}

        {/* ================= CANDIDATES SECTION ================= */}
        <div id="candidates" className="space-y-8 scroll-mt-24">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-color">
              {t("section.candidates.title")}
            </h2>
            <p className="text-muted-color text-sm">
              {t("section.candidates.desc")}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 rounded-full border-2 spinner-accent animate-spin" />
            </div>
          )}

          {/* Empty State */}
          {!loading && candidates.length === 0 && (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-layer-1 flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-color" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-muted-color text-lg">{t("no_candidates")}</p>
              <p className="text-muted-color text-sm mt-1">{t("check_back")}</p>
            </div>
          )}

          {/* Candidates Grid */}
          {!loading && candidates.length > 0 && (
            <div className="flex flex-wrap justify-center gap-6">
              {candidates.map((c, index) => (
                <div key={c.id} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)]">
                  <CandidateCard data={c} index={index} />
                </div>
              ))}
            </div>
          )}

          {/* ================= TRENDING POLICIES SECTION ================= */}
          {!loading && trendingPolicies.length > 0 && (
            <div className="pt-16 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
              <div className="flex flex-col items-center text-center space-y-2 mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1014 0c0-1.187-.204-2.326-.576-3.386a1 1 0 00-.47-.525l-.21-.104a1 1 0 00-.42-.084l-.127.012a1 1 0 00-.843.837c-.11.69-.26 1.463-.454 2.21a3.033 3.033 0 01-.225.688 1 1 0 01-1.25.433 3.01 3.01 0 01-1.636-2.639c0-.74.153-1.442.42-2.072.26-.61.623-1.164 1.054-1.637a1 1 0 00.317-.679z" clipRule="evenodd" />
                  </svg>
                  {t("results.live")}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-primary-color">
                  {t("section.trending.title")}
                </h2>
                <p className="text-muted-color text-sm max-w-xl">
                  {t("section.trending.desc")}
                </p>
              </div>

              {/* Horizontal Scroll Container */}
              <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x">
                {trendingPolicies.map((policy, index) => (
                  <div key={`${policy.candidateId}-${policy.id}`} className="flex-none w-[300px] md:w-[350px] snap-center">
                    <TrendingPolicyCard policy={policy} index={index} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TOP CANDIDATES SECTION ================= */}
          {!loading && topCandidates.length > 0 && (
            <div className="pt-20 animate-fadeInUp" style={{ animationDelay: '500ms' }}>
              <div className="flex flex-col items-center text-center space-y-2 mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-primary-color">
                  {t("section.top_candidates.title")}
                </h2>
                <p className="text-muted-color text-sm max-w-xl">
                  {t("section.top_candidates.desc")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topCandidates.map((c, index) => (
                  <div
                    key={c.id}
                    className="glass-card rounded-2xl p-6 flex flex-col items-center text-center space-y-4 card-hover relative overflow-hidden"
                  >
                    {/* Rank Badge */}
                    <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 font-bold text-black flex items-center justify-center shadow-lg shadow-orange-500/20">
                      {index + 1}
                    </div>

                    <div className="relative pt-2">
                      <div className="w-20 h-20 rounded-full bg-accent-gradient p-[2px]">
                        <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          {c.imageUrl || c.photoURL ? (
                            <img src={c.imageUrl || c.photoURL} alt={c.firstname} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl font-bold gradient-text">{c.firstname[0]}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="font-bold text-primary-color text-lg">{c.firstname} {c.lastname}</p>
                      <p className="text-xs text-muted-color uppercase tracking-widest mt-1">Total Engagement: {c.totalEngagement}</p>
                    </div>

                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-gradient transition-all duration-1000"
                        style={{ width: `${(c.totalEngagement / topCandidates[0].totalEngagement) * 100}%` }}
                      />
                    </div>

                    <a
                      href={`/candidate/${c.id}/profile`}
                      className="text-sm font-semibold text-accent hover:opacity-80 transition-colors"
                    >
                      View Full Profile →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

