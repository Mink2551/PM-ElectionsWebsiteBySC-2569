"use client";

import Navbar from "@/features/navbar/navbar";
import Countdown from "@/features/landing/components/CountDown";
import Hero from "@/features/landing/hero";
import ScheduleSection from "@/components/ScheduleSection";
import Footer from "@/features/footer/Footer";

export default function Home() {
  return (
    <div className="min-h-screen transition-colors duration-300 relative overflow-hidden">
      <Navbar />
      <Countdown />
      <Hero />
      <ScheduleSection />
      <Footer />
    </div>
  );
}
