"use client";

import React, { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import Navbar from "@/features/navbar/navbar";
import Footer from "@/features/footer/Footer";
import AdminGuard from "@/components/AdminGuard";

interface Candidate {
    id: string;
    firstname: string;
    lastname: string;
    nickname: string;
    votes: number;
}

export default function VotesAdminPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            const snap = await getDocs(collection(db, "candidates"));
            const data = snap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Candidate[];

            // Sort by votes descending
            data.sort((a, b) => (b.votes || 0) - (a.votes || 0));

            setCandidates(data);
        } catch (error) {
            console.error("Error fetching candidates:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateVote = async (id: string, action: "increment" | "decrement" | "set", value?: number) => {
        setUpdating(id);
        try {
            const ref = doc(db, "candidates", id);

            if (action === "set" && value !== undefined) {
                await updateDoc(ref, { votes: value });
            } else {
                await updateDoc(ref, {
                    votes: increment(action === "increment" ? 1 : -1)
                });
            }

            // Optimistic update
            setCandidates(prev => prev.map(c => {
                if (c.id !== id) return c;
                let newVotes = c.votes || 0;
                if (action === "increment") newVotes++;
                if (action === "decrement") newVotes = Math.max(0, newVotes - 1);
                if (action === "set" && value !== undefined) newVotes = value;
                return { ...c, votes: newVotes };
            }));

        } catch (error) {
            console.error("Error updating votes:", error);
            alert("Failed to update votes");
        } finally {
            setUpdating(null);
        }
    };

    return (
        <AdminGuard>
            <div className="min-h-screen transition-colors duration-300">
                <Navbar />

                <main className="pt-24 pb-16 px-4 md:px-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="mb-8 animate-fadeInUp flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold gradient-text mb-2">Vote Management</h1>
                                <p className="text-muted-color">Manually adjust candidate vote counts</p>
                            </div>
                            <a href="/admin" className="text-secondary-color hover:text-primary-color transition-colors">
                                ← Back to Dashboard
                            </a>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {candidates.map((candidate, index) => (
                                    <div
                                        key={candidate.id}
                                        className="glass-card rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 card-hover animate-fadeInUp"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-xl">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-primary-color">
                                                    {candidate.firstname} {candidate.lastname}
                                                </h3>
                                                <p className="text-muted-color text-sm">"{candidate.nickname}"</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row items-center gap-4">
                                            <div className="text-center md:text-right mr-4">
                                                <span className="text-2xl font-bold text-primary-color block">{candidate.votes || 0}</span>
                                                <span className="text-xs text-muted-color uppercase tracking-wider">Current Votes</span>
                                            </div>

                                            <div className="flex items-center gap-2 bg-layer-1 rounded-lg p-1 border border-glass-border">
                                                <button
                                                    onClick={() => handleUpdateVote(candidate.id, "decrement")}
                                                    disabled={updating === candidate.id || (candidate.votes || 0) <= 0}
                                                    className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-red-500/10 text-red-400 disabled:opacity-30 transition-colors"
                                                    title="Subtract Vote"
                                                >
                                                    -1
                                                </button>
                                                <div className="w-px h-6 bg-glass-border mx-1"></div>
                                                <button
                                                    onClick={() => handleUpdateVote(candidate.id, "increment")}
                                                    disabled={updating === candidate.id}
                                                    className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-green-500/10 text-green-400 disabled:opacity-30 transition-colors"
                                                    title="Add Vote"
                                                >
                                                    +1
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="Set"
                                                    className="w-20 px-3 py-2 rounded-lg bg-layer-1 border border-glass-border text-primary-color text-sm text-center focus:border-purple-500 focus:outline-none"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const val = parseInt((e.target as HTMLInputElement).value);
                                                            if (!isNaN(val)) {
                                                                handleUpdateVote(candidate.id, "set", val);
                                                                (e.target as HTMLInputElement).value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
                <Footer />
            </div>
        </AdminGuard>
    );
}
