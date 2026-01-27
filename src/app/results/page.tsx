"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, getDoc } from "firebase/firestore";
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
    photoURL?: string;
    imageUrl?: string; // Added new field
}

export default function ResultsPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [abstainVotes, setAbstainVotes] = useState(0);
    const [spoiledVotes, setSpoiledVotes] = useState(0);
    const [loading, setLoading] = useState(true);
    const [totalVotes, setTotalVotes] = useState(0);
    const { t } = useLanguage();

    useEffect(() => {
        // Real-time listener for candidates
        const q = query(collection(db, "candidates"));

        // Listener for settings (to get abstain votes)
        const settingsUnsubscribe = onSnapshot(doc(db, "settings", "config"), (docSnap) => {
            if (docSnap.exists()) {
                setAbstainVotes(docSnap.data().abstain || 0);
                setSpoiledVotes(docSnap.data().spoiled || 0);
            }
        });

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Candidate[];

            // Sort by votes descending
            data.sort((a, b) => (b.votes || 0) - (a.votes || 0));

            setCandidates(data);
            setLoading(false);
        });

        return () => {
            unsubscribe();
            settingsUnsubscribe();
        };
    }, []);

    useEffect(() => {
        const candidateVotes = candidates.reduce((sum, c) => sum + (c.votes || 0), 0);
        setTotalVotes(candidateVotes + abstainVotes + spoiledVotes);
    }, [candidates, abstainVotes, spoiledVotes]);

    return (
        <div className="min-h-screen transition-colors duration-300">
            <Navbar />

            <main className="pt-24 pb-16 px-4 md:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12 animate-fadeInUp">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-secondary-color mb-4">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            {t("results.updates")}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold py-4 gradient-text mb-4">
                            {t("results.title")}
                        </h1>
                        <p className="text-muted-color">
                            {t("results.desc")}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                        <StatCard label={t("results.total")} value={totalVotes} />
                        <StatCard label={t("stats.candidates")} value={candidates.length} />
                        <div className="hidden md:block">
                            <StatCard label={t("results.last_updated")} value={t("results.live")} isLive />
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center py-12">
                            <div className="w-10 h-10 rounded-full border-2 spinner-accent animate-spin" />
                        </div>
                    )}

                    {/* Results List - Candidates on Left, Abstain/Spoiled on Right */}
                    {!loading && (
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
                            {/* Candidates Column */}
                            <div className="space-y-4">
                                {candidates.map((candidate, index) => (
                                    <ResultCard
                                        key={candidate.id}
                                        candidate={candidate}
                                        rank={index + 1}
                                        totalVotes={totalVotes}
                                    />
                                ))}

                                {candidates.length === 0 && (
                                    <div className="glass-card rounded-2xl p-12 text-center">
                                        <p className="text-muted-color text-lg">{t("no_candidates")}</p>
                                    </div>
                                )}
                            </div>

                            {/* Abstain & Spoiled Cards - Right Column */}
                            <div className="flex flex-col gap-4 h-full">
                                <div className="flex-1">
                                    <AbstainCard count={abstainVotes} totalVotes={totalVotes} />
                                </div>
                                <div className="flex-1">
                                    <SpoiledCard count={spoiledVotes} totalVotes={totalVotes} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

/* Stat Card */
function StatCard({ label, value, isLive }: { label: string; value: number | string; isLive?: boolean }) {
    return (
        <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl md:text-3xl font-bold gradient-text flex items-center justify-center gap-2">
                {isLive && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>}
                {value}
            </p>
            <p className="text-muted-color text-sm">{label}</p>
        </div>
    );
}

/* Result Card */
function ResultCard({ candidate, rank, totalVotes }: { candidate: Candidate; rank: number; totalVotes: number }) {
    const { t } = useLanguage();
    const percentage = totalVotes > 0 ? ((candidate.votes || 0) / totalVotes) * 100 : 0;

    const getRankStyle = () => {
        if (rank === 1) return "from-yellow-500 to-amber-600";
        if (rank === 2) return "from-gray-300 to-gray-400";
        if (rank === 3) return "from-orange-400 to-orange-600";
        return "from-white/20 to-white/10 dark:from-white/20 dark:to-white/10 from-black/5 to-black/10";
    };

    return (
        <div className="glass-card rounded-2xl p-3 card-hover animate-fadeInUp" style={{ animationDelay: `${rank * 50}ms` }}>
            <div className="flex items-center gap-4">
                {/* Rank Badge */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRankStyle()} flex items-center justify-center font-bold ${rank <= 3 ? 'text-white' : 'text-primary-color'}`}>
                    {rank}
                </div>

                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-accent-gradient p-[2px]">
                    <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                        {candidate.imageUrl || candidate.photoURL ? (
                            <img
                                src={candidate.imageUrl || candidate.photoURL}
                                alt={candidate.firstname}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-xl font-bold gradient-text">{candidate.firstname?.[0]}</span>
                        )}
                    </div>
                </div>

                {/* Name & Info */}
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-primary-color truncate">
                        {candidate.firstname} {candidate.lastname}
                    </p>
                    <p className="text-sm text-muted-color">
                        {candidate.nickname && <span className="text-accent font-medium">"{candidate.nickname}"</span>}
                        {candidate.nickname && " • "}M.4/{candidate.class}
                    </p>
                </div>

                {/* Vote Count */}
                <div className="text-right">
                    <p className="text-2xl font-bold gradient-text">{candidate.votes || 0}</p>
                    <p className="text-xs text-muted-color">{t("results.votes")}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-2">
                <div className="h-2 bg-layer-2 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-accent-gradient rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <p className="text-right text-xs text-muted-color mt-1">{percentage.toFixed(1)}%</p>
            </div>
        </div>
    );
}

/* Abstain Card (Special) */
function AbstainCard({ count, totalVotes }: { count: number; totalVotes: number }) {
    const { t } = useLanguage();
    const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;

    return (
        <div className="glass-card rounded-2xl p-4 border-2 border-dashed border-glass-border animate-fadeInUp h-full flex flex-col" style={{ animationDelay: '500ms' }}>
            {/* Icon */}
            <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-xl bg-layer-2 flex items-center justify-center text-secondary-color">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                </div>
            </div>

            {/* Text */}
            <div className="text-center mb-3">
                <p className="font-semibold text-primary-color">{t("results.abstain")}</p>
                <p className="text-xs text-muted-color">Non-voting</p>
            </div>

            {/* Vote Count */}
            <div className="text-center flex-1 flex flex-col justify-center">
                <p className="text-3xl font-bold text-secondary-color">{count}</p>
                <p className="text-xs text-muted-color">{t("results.votes")}</p>
            </div>

            {/* Progress Bar */}
            <div className="mt-auto pt-3">
                <div className="h-2 bg-layer-2 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-secondary-color/30 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <p className="text-center text-xs text-muted-color mt-1">{percentage.toFixed(1)}%</p>
            </div>
        </div>
    );
}

/* Spoiled Ballot Card (บัตรเสีย) */
function SpoiledCard({ count, totalVotes }: { count: number; totalVotes: number }) {
    const { t } = useLanguage();
    const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;

    return (
        <div className="glass-card rounded-2xl p-4 border-2 border-dashed border-red-500/30 animate-fadeInUp h-full flex flex-col" style={{ animationDelay: '550ms' }}>
            {/* Icon */}
            <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
            </div>

            {/* Text */}
            <div className="text-center mb-3">
                <p className="font-semibold text-primary-color">{t("results.spoiled")}</p>
                <p className="text-xs text-muted-color">Invalid ballots</p>
            </div>

            {/* Vote Count */}
            <div className="text-center flex-1 flex flex-col justify-center">
                <p className="text-3xl font-bold text-red-400">{count}</p>
                <p className="text-xs text-muted-color">{t("results.votes")}</p>
            </div>

            {/* Progress Bar */}
            <div className="mt-auto pt-3">
                <div className="h-2 bg-layer-2 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-red-500/30 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <p className="text-center text-xs text-muted-color mt-1">{percentage.toFixed(1)}%</p>
            </div>
        </div>
    );
}
