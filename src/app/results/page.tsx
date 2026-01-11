"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import Navbar from "@/features/navbar/navbar";
import Footer from "@/features/footer/Footer";

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
    const [loading, setLoading] = useState(true);
    const [totalVotes, setTotalVotes] = useState(0);

    useEffect(() => {
        // Real-time listener for candidates
        const q = query(collection(db, "candidates"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Candidate[];

            // Sort by votes descending
            data.sort((a, b) => (b.votes || 0) - (a.votes || 0));

            setCandidates(data);
            setTotalVotes(data.reduce((sum, c) => sum + (c.votes || 0), 0));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="min-h-screen transition-colors duration-300">
            <Navbar />

            <main className="pt-24 pb-16 px-4 md:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12 animate-fadeInUp">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-secondary-color mb-4">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            Live Updates
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
                            Live Election Results
                        </h1>
                        <p className="text-muted-color">
                            Real-time vote tracking for PM Student Council 2569
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                        <StatCard label="Total Votes" value={totalVotes} />
                        <StatCard label="Candidates" value={candidates.length} />
                        <div className="hidden md:block">
                            <StatCard label="Last Updated" value="Live" isLive />
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center py-12">
                            <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                        </div>
                    )}

                    {/* Results List */}
                    {!loading && (
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
                                    <p className="text-white/50 text-lg">No candidates registered yet</p>
                                </div>
                            )}
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
    const percentage = totalVotes > 0 ? ((candidate.votes || 0) / totalVotes) * 100 : 0;

    const getRankStyle = () => {
        if (rank === 1) return "from-yellow-500 to-amber-600";
        if (rank === 2) return "from-gray-300 to-gray-400";
        if (rank === 3) return "from-orange-400 to-orange-600";
        return "from-white/20 to-white/10 dark:from-white/20 dark:to-white/10 from-black/5 to-black/10";
    };

    return (
        <div className="glass-card rounded-2xl p-5 card-hover animate-fadeInUp" style={{ animationDelay: `${rank * 50}ms` }}>
            <div className="flex items-center gap-4">
                {/* Rank Badge */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRankStyle()} flex items-center justify-center font-bold ${rank <= 3 ? 'text-white' : 'text-primary-color'}`}>
                    {rank}
                </div>

                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px]">
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
                        {candidate.nickname && `"${candidate.nickname}" • `}Class {candidate.class}
                    </p>
                </div>

                {/* Vote Count */}
                <div className="text-right">
                    <p className="text-2xl font-bold gradient-text">{candidate.votes || 0}</p>
                    <p className="text-xs text-muted-color">votes</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
                <div className="h-2 bg-layer-2 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <p className="text-right text-xs text-muted-color mt-1">{percentage.toFixed(1)}%</p>
            </div>
        </div>
    );
}
