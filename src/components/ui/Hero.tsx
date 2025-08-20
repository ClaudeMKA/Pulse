"use client";
import Image from "next/image";
import { COLORS } from "@/lib/theme";
import { format } from "date-fns";

type HeroEvent = {
  title: string;
  desc: string;
  start_date: Date;
  genre: string; // Prisma enum Genre
  type: string; // Prisma enum EventType
  location?: string | null;
  artist?: { name: string } | null;
};

type HeroStats = {
  artistsCount: number;
  eventsCount: number;
  cities: string[];
};

function formatDate(date: Date): string {
  try {
    return format(date, "d MMMM yyyy");
  } catch {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
}

export default function Hero({ featured, stats }: { featured: HeroEvent; stats: HeroStats }) {
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
        <div className="backdrop-blur-lg bg-white/15 rounded-3xl p-8 md:p-10 mb-8 border border-white/30 shadow-2xl max-w-3xl text-center">
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full mb-4 border border-white/40 bg-white/10">
            <Image src="/assets/logo-pulse.svg" alt="Pulse" width={100} height={40} />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white text-center drop-shadow-2xl mb-4 font-display" style={{ letterSpacing: 2 }}>
            {featured.title}
          </h1>
          <p className="text-lg md:text-2xl text-white/95 text-center max-w-2xl mx-auto">
            {featured.desc}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="px-4 py-2 rounded-full text-sm font-semibold text-white border border-white/30 bg-white/10">
              {formatDate(new Date(featured.start_date))}
            </span>
            {featured.location && (
              <span className="px-4 py-2 rounded-full text-sm font-semibold text-white border border-white/30 bg-white/10">
                {featured.location}
              </span>
            )}
            <span className="px-4 py-2 rounded-full text-sm font-semibold text-white border border-white/30 bg-white/10">
              {featured.type} • {featured.genre}
            </span>
            {featured.artist?.name && (
              <span className="px-4 py-2 rounded-full text-sm font-semibold text-white border border-white/30 bg-white/10">
                {featured.artist.name}
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl">
          <div className="backdrop-blur-md bg-white/20 rounded-2xl p-4 text-center border border-white/20 text-white">
            <p className="text-sm opacity-90">Événements</p>
            <p className="text-xl font-bold">{stats.eventsCount} à venir</p>
          </div>
          <div className="backdrop-blur-md bg-white/20 rounded-2xl p-4 text-center border border-white/20 text-white">
            <p className="text-sm opacity-90">Artistes</p>
            <p className="text-xl font-bold">{stats.artistsCount}+ artistes</p>
          </div>
          <div className="backdrop-blur-md bg-white/20 rounded-2xl p-4 text-center border border-white/20 text-white">
            <p className="text-sm opacity-90">Villes</p>
            <p className="text-xl font-bold">{stats.cities.join(" • ")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}


