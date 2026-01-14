"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useLanguage } from "@/shared/context/LanguageContext";

interface Reel {
    url: string;
    candidateName: string;
    candidateId: string;
}

export default function ReelsSection() {
    const [reels, setReels] = useState<Reel[]>([]);
    const { t, language } = useLanguage();

    useEffect(() => {
        const fetchReels = async () => {
            try {
                const snap = await getDocs(collection(db, "candidates"));
                const allReels: Reel[] = [];

                snap.forEach(doc => {
                    const data = doc.data();
                    if (data.reels && Array.isArray(data.reels)) {
                        data.reels.forEach((url: string) => {
                            if (url) {
                                allReels.push({
                                    url,
                                    candidateName: `${data.firstname} ${data.lastname}`,
                                    candidateId: doc.id
                                });
                            }
                        });
                    }
                });

                // Shuffle for randomness or sort? 
                // Let's just show them in order found for now, or randomize slightly
                setReels(allReels.sort(() => 0.5 - Math.random()));
            } catch (error) {
                console.error("Error fetching reels:", error);
            }
        };

        fetchReels();
    }, []);

    if (reels.length === 0) return null;

    return (
        <section className="py-20 px-4 md:px-8 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12 animate-fadeInUp">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                        {language === 'en' ? "Campaign Highlights" : "ไฮไลท์การหาเสียง"}
                    </h2>
                    <p className="text-secondary-color text-lg max-w-2xl mx-auto">
                        {language === 'en' ? "Watch exclusive interviews and campaign clips from the candidates." : "ชมคลิปสัมภาษณ์และบรรยากาศการหาเสียงของผู้สมัคร"}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {reels.map((reel, index) => {
                        let embedUrl = reel.url;
                        if (reel.url.includes('instagram.com')) {
                            const cleanUrl = reel.url.split('?')[0];
                            embedUrl = cleanUrl.endsWith('/') ? `${cleanUrl}embed` : `${cleanUrl}/embed`;
                        }

                        return (
                            <div key={index} className="animate-fadeInUp" style={{ animationDelay: `${index * 100}ms` }}>
                                <div className="glass-card rounded-2xl overflow-hidden aspect-[9/16] relative group border border-glass-border hover:border-purple-500/30 transition-all shadow-lg hover:shadow-purple-500/20">
                                    <iframe
                                        src={embedUrl}
                                        className="w-full h-full object-cover"
                                        frameBorder="0"
                                        allowFullScreen
                                        scrolling="no"
                                    />

                                    {/* Candidate Badge */}
                                    <a href={`/candidate/${reel.candidateId}/profile`} className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-sm font-medium truncate text-center">
                                            {reel.candidateName}
                                        </p>
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
