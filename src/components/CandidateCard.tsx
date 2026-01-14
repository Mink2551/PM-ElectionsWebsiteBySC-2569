"use client";

import { useLanguage } from "@/shared/context/LanguageContext";

interface CandidateCardProps {
    data: any;
    index: number;
}

export default function CandidateCard({ data, index }: CandidateCardProps) {
    const { t } = useLanguage();
    return (
        <div
            className="glass-card rounded-2xl p-6 flex flex-col items-center text-center space-y-5 card-hover animate-fadeInUp"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Avatar with Ring */}
            <div className="relative">
                <div className="w-24 h-24 rounded-full bg-accent-gradient p-[3px]">
                    <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
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

                {/* Candidate Number Badge - Bottom Center */}
                {data.candidateNumber && (
                    <div
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 dark:bg-gradient-to-br dark:from-indigo-500 dark:to-purple-600 bg-gradient-to-br from-orange-400 to-amber-500"
                        style={{ borderColor: 'var(--bg-primary)' }}
                    >
                        {data.candidateNumber}
                    </div>
                )}
            </div>

            {/* Name & Position */}
            <div>
                <p className="font-semibold text-lg text-primary-color">
                    {data.firstname} {data.lastname}
                </p>
                <p className="text-sm text-muted-color">
                    {data.position || `${t("profile.class")} 4 / ${data.class}`}
                </p>
                {data.nickname && (
                    <p className="text-sm text-accent mt-1 font-medium">"{data.nickname}"</p>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 w-full pt-2">
                <a
                    href={`/candidate/${data.id}/policies`}
                    className="w-full py-3 rounded-xl bg-accent-gradient text-white font-medium text-sm shadow-accent shadow-accent-hover transition-all duration-300 hover:-translate-y-0.5 text-center"
                >
                    {t("card.view_policies")}
                </a>

                <a
                    href={`/candidate/${data.id}/profile`}
                    className="w-full py-3 rounded-xl border border-glass-border text-secondary-color text-sm hover:bg-layer-1 hover:text-primary-color transition-all duration-300 text-center"
                >
                    {t("card.personal_profile")}
                </a>
            </div>
        </div>
    );
}
