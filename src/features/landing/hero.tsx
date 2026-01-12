"use client";

import { useDeviceType } from "@/shared/hooks/checkDevice";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useLanguage } from "@/shared/context/LanguageContext";

export default function Hero() {
  const device = useDeviceType();
  const [candidates, setCandidates] = useState<any[]>([]);
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
        setCandidates(docs);

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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-white/80">
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
            <span className="text-white">{t("hero.title2")}</span>
          </h1>

          {/* Description */}
          <p className="text-white/60 max-w-2xl text-base md:text-lg leading-relaxed">
            {t("hero.desc")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <a
              href="#candidates"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              {t("hero.cta.view")}
            </a>
            <a
              href="/results"
              className="px-8 py-3 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-all duration-300"
            >
              {t("hero.cta.results")}
            </a>
          </div>
        </div>

        {/* ================= STATS BAR ================= */}
        <div className="flex justify-center gap-8 md:gap-16 mb-16">
          <StatBox value={candidates.length} label={t("stats.candidates")} />
          <StatBox value="500+" label={t("stats.voters")} />
          <StatBox value="100%" label={t("stats.transparent")} />
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
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {t("section.candidates.title")}
            </h2>
            <p className="text-white/50 text-sm">
              {t("section.candidates.desc")}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
          )}

          {/* Empty State */}
          {!loading && candidates.length === 0 && (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-white/50 text-lg">{t("no_candidates")}</p>
              <p className="text-white/30 text-sm mt-1">{t("check_back")}</p>
            </div>
          )}

          {/* Candidates Grid */}
          {!loading && candidates.length > 0 && (
            <div className={`grid gap-6 ${gridClass}`}>
              {candidates.map((c, index) => (
                <CandidateCard key={c.id} data={c} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ================= STAT BOX ================= */
function StatBox({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl md:text-3xl font-bold gradient-text">{value}</p>
      <p className="text-white/50 text-sm">{label}</p>
    </div>
  );
}

/* ================= CANDIDATE CARD ================= */
function CandidateCard({ data, index }: { data: any; index: number }) {
  const { t } = useLanguage();
  return (
    <div
      className="glass-card rounded-2xl p-6 flex flex-col items-center text-center space-y-5 card-hover animate-fadeInUp"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Avatar with Ring */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[3px]">
          <div className="w-full h-full rounded-full bg-[#12121a] flex items-center justify-center overflow-hidden">
            {data.imageUrl || data.photoURL ? (
              <img
                src={data.imageUrl || data.photoURL}
                alt={data.firstname}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold gradient-text">
                {data.firstname?.[0] || "?"}
              </span>
            )}
          </div>
        </div>

        {/* Online Indicator */}
        <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#12121a]" />
      </div>

      {/* Name & Position */}
      <div>
        <p className="font-semibold text-lg text-white">
          {data.firstname} {data.lastname}
        </p>
        <p className="text-sm text-white/50">
          {data.position || `Class 4 / ${data.class}`}
        </p>
        {data.nickname && (
          <p className="text-xs text-purple-400 mt-1">"{data.nickname}"</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full pt-2">
        <a
          href={`/candidate/${data.id}/policies`}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-0.5 text-center"
        >
          {t("card.view_policies")}
        </a>

        <a
          href={`/candidate/${data.id}/profile`}
          className="w-full py-3 rounded-xl border border-white/20 text-white/70 text-sm hover:bg-white/10 hover:text-white transition-all duration-300 text-center"
        >
          {t("card.personal_profile")}
        </a>
      </div>
    </div>
  );
}
