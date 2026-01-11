"use client";

import dynamic from "next/dynamic";
import { useCountdown } from "../hooks/useCountdown";

// Dynamically import TimeBox to disable SSR
const TimeBox = dynamic(() => import("./Timebox"), { ssr: false });

// Separator component can stay normal (static)
function Separator() {
  return (
    <div className="hidden md:flex items-center text-white/40 text-3xl font-light">
      :
    </div>
  );
}

export default function Countdown() {
  // Election date: 22 days from now at 10:00 AM
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 22);
  targetDate.setHours(10, 0, 0, 0);

  const { days, hours, minutes, seconds } = useCountdown(targetDate);

  return (
    <section className="relative w-full overflow-hidden pt-20">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient" />

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
          <p className="text-sm tracking-[0.3em] uppercase text-white/70 mb-2">
            ⚡ Live Countdown
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
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
        <p className="text-center text-white/60 text-sm mt-8">
          Voting will open when the countdown reaches zero
        </p>
      </div>

      {/* Bottom Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-gradient-to-t from-purple-500/30 to-transparent blur-3xl" />
    </section>
  );
}
