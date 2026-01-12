"use client";

import React, { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, doc, updateDoc, increment, getDoc, setDoc } from "firebase/firestore";
import Navbar from "@/features/navbar/navbar";
import Footer from "@/features/footer/Footer";
import AdminGuard from "@/components/AdminGuard";
import { useLanguage } from "@/shared/context/LanguageContext";

interface Candidate {
    id: string;
    firstname: string;
    lastname: string;
    nickname: string;
    votes: number;
}

export default function VotesAdminPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [abstainVotes, setAbstainVotes] = useState(0);
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [updatingAbstain, setUpdatingAbstain] = useState(false);

    useEffect(() => {
        fetchCandidates();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const docRef = doc(db, "settings", "config");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setAbstainVotes(docSnap.data().abstain || 0);
            }
        } catch (e) {
            console.error("Error fetching settings:", e);
        }
    };

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

    const handleUpdateAbstain = async (action: "increment" | "decrement" | "set", value?: number) => {
        setUpdatingAbstain(true);
        try {
            const ref = doc(db, "settings", "config");
            let newVal = abstainVotes;

            if (action === "set" && value !== undefined) {
                newVal = value;
            } else {
                newVal = abstainVotes + (action === "increment" ? 1 : -1);
                newVal = Math.max(0, newVal);
            }

            await setDoc(ref, { abstain: newVal }, { merge: true });
            setAbstainVotes(newVal);
        } catch (error) {
            console.error("Error updating abstain votes:", error);
            alert("Failed to update abstain votes");
        } finally {
            setUpdatingAbstain(false);
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
                                <h1 className="text-3xl font-bold gradient-text mb-2">{t("admin.votes_title")}</h1>
                                <p className="text-muted-color">{t("admin.votes_desc")}</p>
                            </div>
                            <a href="/admin" className="text-secondary-color hover:text-primary-color transition-colors">
                                ← {t("common.back")}
                            </a>
                        </div>

                        {/* Abstain Votes Section */}
                        <div className="mb-12 animate-fadeInUp" style={{ animationDelay: "50ms" }}>
                            <h2 className="text-xl font-semibold text-primary-color mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 rounded-full bg-gradient-to-b from-gray-500 to-gray-700"></span>
                                {t("admin.abstain_title")}
                            </h2>
                            <div className="glass-card rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-2 border-dashed border-glass-border">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-primary-color">
                                            {t("results.abstain")}
                                        </h3>
                                        <p className="text-muted-color text-sm">Global counter for non-voting delegates</p>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-center gap-4">
                                    <div className="text-center md:text-right mr-4">
                                        <span className="text-2xl font-bold text-primary-color block">{abstainVotes}</span>
                                        <span className="text-xs text-muted-color uppercase tracking-wider">{t("admin.current_votes")}</span>
                                    </div>

                                    <div className="flex items-center gap-2 bg-layer-1 rounded-lg p-1 border border-glass-border">
                                        <button
                                            onClick={() => handleUpdateAbstain("decrement")}
                                            disabled={updatingAbstain || abstainVotes <= 0}
                                            className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-red-500/10 text-red-400 disabled:opacity-30 transition-colors"
                                        >
                                            -1
                                        </button>
                                        <div className="w-px h-6 bg-glass-border mx-1"></div>
                                        <button
                                            onClick={() => handleUpdateAbstain("increment")}
                                            disabled={updatingAbstain}
                                            className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-green-500/10 text-green-400 disabled:opacity-30 transition-colors"
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
                                                        handleUpdateAbstain("set", val);
                                                        (e.target as HTMLInputElement).value = '';
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-primary-color mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 rounded-full bg-gradient-to-b from-purple-500 to-pink-500"></span>
                                    {t("nav.candidates")}
                                </h2>
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
                                                <span className="text-xs text-muted-color uppercase tracking-wider">{t("admin.current_votes")}</span>
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
