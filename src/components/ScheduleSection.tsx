"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useLanguage } from "@/shared/context/LanguageContext";

interface ScheduleEvent {
    id: string;
    title: string;
    titleTh: string;
    date: string;
    description?: string;
    descriptionTh?: string;
}

export default function ScheduleSection() {
    const { language, t } = useLanguage();
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const ref = doc(db, "settings", "schedule");
                const snap = await getDoc(ref);
                if (snap.exists()) {
                    const data = snap.data();
                    setEvents(data.events || []);
                }
            } catch (error) {
                console.error("Error fetching schedule:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, []);

    if (loading || events.length === 0) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <section className="py-16 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Section Header */}
                <div className="flex flex-col items-center text-center space-y-2 mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-subtle text-xs font-bold uppercase tracking-wider mb-2">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {language === "en" ? "Timeline" : "กำหนดการ"}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-primary-color">
                        {language === "en" ? "Election Schedule" : "กำหนดการเลือกตั้ง"}
                    </h2>
                    <p className="text-secondary-color text-sm max-w-xl">
                        {language === "en"
                            ? "Key dates you need to know for the Student President Election 2026"
                            : "วันสำคัญที่คุณต้องรู้สำหรับการเลือกตั้งประธานนักเรียน ปี 2569"}
                    </p>
                </div>

                {/* Timeline */}
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-accent-line transform md:-translate-x-1/2" />

                    <div className="space-y-8">
                        {events.map((event, index) => {
                            const eventDate = new Date(event.date);
                            eventDate.setHours(0, 0, 0, 0);
                            const isPast = eventDate < today;
                            const isToday = eventDate.getTime() === today.getTime();
                            const isLeft = index % 2 === 0;

                            return (
                                <div
                                    key={event.id}
                                    className={`relative flex items-center ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                                >
                                    {/* Date Badge (Center on desktop) */}
                                    <div className="absolute left-0 md:left-1/2 md:transform md:-translate-x-1/2 z-10">
                                        <div className={`
                                            w-12 h-12 rounded-full flex flex-col items-center justify-center text-white font-bold
                                            ${isToday
                                                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 ring-4 ring-yellow-400/30'
                                                : isPast
                                                    ? 'bg-gray-600'
                                                    : 'bg-accent-gradient-simple'}
                                        `}>
                                            <span className="text-[10px] uppercase">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                            <span className="text-sm leading-none font-bold">{new Date(event.date).getDate()}</span>
                                        </div>
                                    </div>

                                    {/* Content Card */}
                                    <div className={`ml-16 md:ml-0 md:w-1/2 ${isLeft ? 'md:pr-12' : 'md:pl-12'}`}>
                                        <div className={`glass-card rounded-2xl p-5 ${isPast ? 'opacity-60' : ''} ${isToday ? 'ring-2 ring-yellow-400/50' : ''}`}>
                                            {isToday && (
                                                <span className="inline-block px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold mb-2">
                                                    {language === "en" ? "TODAY" : "วันนี้"}
                                                </span>
                                            )}
                                            <h3 className="font-bold text-primary-color text-lg">
                                                {language === "th" && event.titleTh ? event.titleTh : event.title}
                                            </h3>
                                            {(event.description || event.descriptionTh) && (
                                                <p className="text-sm text-muted-color mt-2">
                                                    {language === "th" && event.descriptionTh ? event.descriptionTh : event.description}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-color mt-3">
                                                {new Date(event.date).toLocaleDateString(language === "th" ? "th-TH" : "en-US", {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
