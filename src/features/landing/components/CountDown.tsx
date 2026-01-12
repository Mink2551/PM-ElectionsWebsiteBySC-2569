"use client";

import dynamic from "next/dynamic";
import { useCountdown } from "../hooks/useCountdown";

// Dynamically import TimeBox to disable SSR
const TimeBox = dynamic(() => import("./Timebox"), { ssr: false });

// Separator component can stay normal (static)
function Separator() {
  return (
    <div className="hidden md:flex items-center countdown-text-muted text-3xl font-light">
      :
    </div>
  );
}

export default function Countdown() {
  // Election date: 28/01/2569 (2026) at 10:00 AM
  const targetDate = new Date("2026-01-28T10:00:00");

  const { days, hours, minutes, seconds } = useCountdown(targetDate);

  return (
    <section className="countdown-section relative w-full overflow-hidden pt-20">
      {/* Animated Gradient Background - uses CSS variable for theme-aware colors */}
      <div className="absolute inset-0 countdown-gradient animate-gradient" />

      {/* Overlay Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 py-12 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm tracking-[0.3em] uppercase countdown-text-muted mb-2">
            ⚡ Live Countdown
          </p>
          <h2 className="text-2xl md:text-3xl font-bold countdown-text">
            Election Day Approaching
          </h2>
        </div>

        {/* Countdown Boxes */}
        <div className="grid grid-cols-2 md:flex justify-center items-center gap-3 md:gap-6">
          <TimeBox label="Days" value={days} />
          <Separator />
          <TimeBox label="Hours" value={hours} />
          <Separator />
          <TimeBox label="Minutes" value={minutes} />
          <Separator />
          <TimeBox label="Seconds" value={seconds} />
        </div>

        {/* Bottom Info */}
        <p className="text-center countdown-text-subtle text-sm mt-8">
          Voting will open when the countdown reaches zero
        </p>
      </div>

      {/* Bottom Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-32 countdown-glow blur-3xl" />
    </section>
  );
}
