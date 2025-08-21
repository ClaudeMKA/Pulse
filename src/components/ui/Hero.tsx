"use client";
import Image from "next/image";
import { COLORS } from "@/lib/theme";
import { useEffect, useState } from "react";
import ArtistsMarquee from "./ArtistsMarquee";

interface HeroProps {
  stats: {
    artistsCount: number;
    eventsCount: number;
    cities: string;
  };
  events: Array<{
    id: number;
    title: string;
    artist?: {
      name: string;
    } | null;
  }>;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const TARGET_DATE = new Date(2026, 6, 21, 0, 0, 0);

export default function Hero({ stats, events }: HeroProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = Math.abs(TARGET_DATE.getTime() - now.getTime());
      
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <section className="relative w-full flex flex-col items-center justify-center min-h-[80vh] py-24 px-4 bg-white overflow-hidden">
      <Image
        src="/assets/events/hero-bg.jpg"
        alt="Pulse Festival"
        fill
        priority
        style={{ objectFit: "cover", zIndex: 0 }}
        className="pointer-events-none select-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-white/20 z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(125,79,254,0.35),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(255,144,182,0.35),transparent_40%)] z-10" />

      <div className="relative z-20 flex flex-col items-center justify-center w-full">
        <div className="backdrop-blur-lg bg-white/15 rounded-3xl p-8 md:p-10 mb-8 border border-white/30 shadow-2xl max-w-4xl text-center">
          <div className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 aspect-square w-[120px]">
            <Image src="/assets/logo-pulse.svg" alt="Pulse" width={100} height={40}/>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white text-center drop-shadow-2xl mb-4 font-display" style={{ letterSpacing: 2 }}>
            PULSE FESTIVAL
          </h1>
          <p className="text-lg md:text-2xl text-white/95 text-center max-w-2xl mx-auto">
            L'événement musical ultime qui fait vibrer la France
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="px-4 py-2 rounded-full text-sm font-semibold text-white border border-white/30 bg-white/10">
              {stats.eventsCount} Événements
            </span>
            <span className="px-4 py-2 rounded-full text-sm font-semibold text-white border border-white/30 bg-white/10">
              {stats.artistsCount} Artistes
            </span>
            {stats.cities.length > 0 && (
              <span className="px-4 py-2 rounded-full text-sm font-semibold text-white border border-white/30 bg-white/10">
                📍 {stats.cities}
              </span>
            )}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a href="#events" className="px-8 py-4 rounded-full text-lg font-bold shadow-lg transition hover:scale-105" style={{ background: COLORS.violet, color: "#fff" }}>
              Découvrir la programmation
            </a>
            <a href="#billetterie" className="px-8 py-4 rounded-full text-lg font-bold border transition hover:scale-105" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.12)" }}>
              Acheter un billet
            </a>
          </div>
        </div>
        
        <div>
          <h3 className="text-white text-xl font-semibold mb-4">Prochaine édition dans :</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px]">
              <div className="text-4xl font-bold text-white mb-1">{timeLeft.days}</div>
              <div className="text-sm text-white/80">Jours</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px]">
              <div className="text-4xl font-bold text-white mb-1">{timeLeft.hours.toString().padStart(2, '0')}</div>
              <div className="text-sm text-white/80">Heures</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px]">
              <div className="text-4xl font-bold text-white mb-1">{timeLeft.minutes.toString().padStart(2, '0')}</div>
              <div className="text-sm text-white/80">Minutes</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px]">
              <div className="text-4xl font-bold text-white mb-1">{timeLeft.seconds.toString().padStart(2, '0')}</div>
              <div className="text-sm text-white/80">Secondes</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bandeau défilant des artistes */}
      <div className="absolute bottom-0 left-0 w-full z-30">
        <ArtistsMarquee />
      </div>
    </section>
  );
}


