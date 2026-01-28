"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, query } from "firebase/firestore";

interface Candidate {
    id: string;
    candidateNumber?: number;
    votes: number;
}

export default function AdminResultsPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [abstainVotes, setAbstainVotes] = useState(0);
    const [spoiledVotes, setSpoiledVotes] = useState(0);

    useEffect(() => {
        // Real-time listener for candidates (matching /results pattern)
        const q = query(collection(db, "candidates"));

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

            // Sort by candidate number (fixed position)
            data.sort((a, b) => (a.candidateNumber || 0) - (b.candidateNumber || 0));
            setCandidates(data);
        });

        return () => {
            unsubscribe();
            settingsUnsubscribe();
        };
    }, []);

    return (
        <div className="min-h-screen bg-green-600 p-8 flex items-center justify-center">
            <div className="w-full max-w-4xl">
                {/* Candidates - Vertical Stack */}
                <div className="flex flex-col gap-4 mb-8">
                    {[1, 2, 3, 4, 5].map((num) => {
                        const candidate = candidates.find(c => c.candidateNumber === num);
                        return (
                            <div key={num} className="flex items-center justify-center">
                                <div
                                    className="text-8xl md:text-9xl text-red-600 font-bold text-center"
                                    style={{
                                        fontVariantNumeric: 'tabular-nums',
                                        minWidth: '4ch'
                                    }}
                                >
                                    {candidate?.votes || 0}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Abstain & Spoiled - Horizontal */}
                <div className="grid grid-cols-2 gap-8">
                    <div className="flex items-center justify-center">
                        <div
                            className="text-7xl md:text-8xl font-bold text-white text-center"
                            style={{
                                fontVariantNumeric: 'tabular-nums',
                                minWidth: '4ch'
                            }}
                        >
                            {abstainVotes}
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <div
                            className="text-7xl md:text-8xl font-bold text-white text-center"
                            style={{
                                fontVariantNumeric: 'tabular-nums',
                                minWidth: '4ch'
                            }}
                        >
                            {spoiledVotes}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
