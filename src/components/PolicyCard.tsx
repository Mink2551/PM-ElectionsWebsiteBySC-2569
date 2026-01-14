"use client";

import { useLanguage } from "@/shared/context/LanguageContext";

interface Policy {
    title: string;
    description: string;
    likes: number;
    comments?: Record<string, any>;
}

interface PolicyCardProps {
    policyId: string;
    policy: Policy;
    index: number;
    isLiked: boolean;
    onLike: () => void;
    onOpenComments: () => void;
    commentCount: number;
}

export default function PolicyCard({
    policyId,
    policy,
    index,
    isLiked,
    onLike,
    onOpenComments,
    commentCount
}: PolicyCardProps) {
    const { language, t } = useLanguage();
    return (
        <div
            className="glass-card rounded-2xl p-6 card-hover animate-fadeInUp flex flex-col h-full group"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Number Badge - Fixed Top */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-accent-gradient-simple flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-purple-500/20">
                    {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-primary-color leading-tight line-clamp-2">
                        {policy.title}
                    </h2>
                </div>
            </div>

            {/* Description */}
            <div className="text-secondary-color text-sm leading-relaxed mb-6 flex-1 max-h-24 overflow-y-auto scrollbar-thin">
                {policy.description}
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-3 mb-4">
                {/* Like Button */}
                <button
                    onClick={onLike}
                    disabled={isLiked}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isLiked
                        ? 'bg-pink-500/20 text-pink-400 cursor-default'
                        : 'bg-layer-1 text-muted-color hover:bg-pink-500/20 hover:text-pink-400 hover:scale-105'
                        }`}
                >
                    <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span className="font-semibold">{policy.likes || 0}</span>
                </button>

                {/* Comment Count Badge */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-layer-1 text-muted-color">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="font-semibold">{commentCount}</span>
                </div>
            </div>

            {/* Comments Button - Full Width */}
            <button
                onClick={onOpenComments}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-glass-border text-secondary-color hover:text-primary-color hover:bg-layer-1 hover:border-purple-500/50 transition-all group-hover:border-purple-500/30"
            >
                <span className="text-sm font-semibold">
                    {language === "en" ? "View Comments" : "ดูความคิดเห็น"}
                </span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}
