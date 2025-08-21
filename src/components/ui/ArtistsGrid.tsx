"use client";
import Image from "next/image";
import { COLORS } from "@/lib/theme";

export type Artist = { name: string; image_path: string };

export default function ArtistsGrid({ artists }: { artists: Artist[] }) {
  return (
    <section className="max-w-6xl mx-auto py-16 px-4">
      <h2 className="text-4xl font-bold mb-10 text-center font-display" style={{ color: COLORS.rose }}>
        Artistes à l’affiche
      </h2>
      <div className="flex flex-wrap justify-center gap-12">
        {artists.map((artist) => (
          <div key={artist.name} className="flex flex-col items-center">
            <div className="rounded-full overflow-hidden shadow-xl border-4 mb-4 h-full" style={{ borderColor: COLORS.lavande }}>
              <Image className="w-full h-full object-cover" src={artist.image_path} alt={artist.name} width={140} height={140} />
            </div>
            <span className="text-2xl font-bold" style={{ color: COLORS.violet }}>{artist.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}


