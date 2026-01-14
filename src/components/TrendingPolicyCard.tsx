"use client";

import { useLanguage } from "@/shared/context/LanguageContext";

interface TrendingPolicyCardProps {
    policy: any;
    index: number;
}

export default function TrendingPolicyCard({ policy, index }: TrendingPolicyCardProps) {
    const { t } = useLanguage();
    return (
        <div
            className="glass-card rounded-2xl p-6 flex flex-col gap-4 border-l-4 border-indigo-500 hover:bg-white/5 transition-all duration-300 card-hover"
            style={{ animationDelay: `${index * 150}ms` }}
        >
            {/* Interaction Badge */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                        <span className="text-indigo-400 font-bold text-xs">#{index + 1}</span>
                    </div>
                    <span className="text-[10px] text-muted-color uppercase tracking-widest font-bold">{t("common.interactions")}</span>
                </div>
                <div className="px-2 py-1 rounded bg-layer-1 border border-current/10 text-muted-color text-[10px] font-mono">
                    ENG: {policy.interactionScore}
                </div>
            </div>

            <h3 className="font-bold text-primary-color leading-snug line-clamp-2 min-h-[3rem]">
                {policy.title}
            </h3>

            {/* Candidate attribution */}
            <div className="flex items-center gap-3 py-2 border-t border-current/5 mt-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-layer-1 border border-current/10">
                    {policy.candidateImage ? (
                        <img src={policy.candidateImage} alt={policy.candidateName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-indigo-400">
                            {policy.candidateName[0]}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-secondary-color truncate">{policy.candidateName}</p>
                    <p className="text-[10px] text-muted-color truncate">
                        {policy.candidateNickname && `"${policy.candidateNickname}"`}
                    </p>
                </div>
                <a
                    href={`/candidate/${policy.candidateId}/policies`}
                    className="p-2 rounded-lg bg-layer-1 text-muted-color hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                    title="See this policy"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 gap-2 mt-auto">
                <div className="bg-layer-1 rounded-xl p-2 flex items-center gap-2 justify-center">
                    <svg className="w-3 h-3 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span className="text-xs font-bold text-secondary-color">{policy.totalLikes}</span>
                </div>
                <div className="bg-layer-1 rounded-xl p-2 flex items-center gap-2 justify-center">
                    <svg className="w-3 h-3 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-bold text-secondary-color">{policy.commentCount}</span>
                </div>
            </div>
        </div>
    );
}
