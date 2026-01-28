"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc } from "firebase/firestore";

interface Candidate {
    id: string;
    number?: number;
    votes: number;
}

export default function AdminResultsPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [abstainVotes, setAbstainVotes] = useState(0);
    const [spoiledVotes, setSpoiledVotes] = useState(0);

    useEffect(() => {
        const q = collection(db, "candidates");

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
            data.sort((a, b) => (a.number || 0) - (b.number || 0));
            setCandidates(data);
        });

        return () => {
            unsubscribe();
            settingsUnsubscribe();
        };
    }, []);

    return (
        <div className="min-h-screen bg-green-600 p-8 flex items-center justify-center">
            <div className="w-full max-w-6xl">
                {/* Candidates - Fixed Grid */}
                <div className="grid grid-cols-5 gap-8 mb-12">
                    {[1, 2, 3, 4, 5].map((num) => {
                        const candidate = candidates.find(c => c.number === num);
                        return (
                            <div key={num} className="text-center">
                                <div className="text-8xl md:text-9xl font-bold text-white">
                                    {candidate?.votes || 0}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Abstain & Spoiled - Fixed Grid */}
                <div className="grid grid-cols-2 gap-8">
                    <div className="text-center">
                        <div className="text-7xl md:text-8xl font-bold text-white">
                            {abstainVotes}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-7xl md:text-8xl font-bold text-white">
                            {spoiledVotes}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
