"use client";

export default function TimeBox({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="countdown-box p-4 md:p-6 min-w-[72px] md:min-w-[100px] text-center group cursor-default">
            {/* Number */}
            <div className="relative">
                <span className="text-4xl md:text-5xl font-bold text-primary-color tabular-nums">
                    {String(value).padStart(2, "0")}
                </span>

                {/* Glow effect on number */}
                <div className="absolute inset-0 text-4xl md:text-5xl font-bold text-white/20 blur-sm tabular-nums flex items-center justify-center">
                    {String(value).padStart(2, "0")}
                </div>
            </div>

            {/* Label */}
            <span className="block text-xs md:text-sm text-secondary-color mt-2 uppercase tracking-wider font-medium">
                {label}
            </span>
        </div>
    );
}
