"use client";

import { useEffect, useState } from 'react';

interface Artist {
  id: number;
  name: string;
  image_path: string | null;
  created_at: string;
  updated_at: string;
}

export default function ArtistsMarquee() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await fetch('/api/artists');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des artistes');
        }
        const data = await response.json();
        setArtists(data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtists();
  }, []);

  const duplicatedArtists = [...artists, ...artists];

  if (isLoading) return null;

  if (artists.length === 0) {
    return (
      <div className="w-full bg-gradient-to-r from-violet-900/80 to-pink-900/80 py-3 text-center">
        <p className="text-white/80 font-medium">Programmation artistique à venir...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-violet-900/80 to-pink-900/80 py-3 border-t border-white/10 shadow-lg">
      <div className="flex items-center">
        <div className="flex items-center animate-marquee whitespace-nowrap">
          <span className="text-white/90 font-bold text-sm uppercase tracking-wider mr-8 px-4 py-1 bg-white/10 rounded-full">
            Artistes à l'affiche
          </span>
          
          {duplicatedArtists.map((artist, index) => (
            <div key={`${artist.id}-${index}`} className="inline-flex items-center group">
              <span className="text-white text-lg font-medium hover:text-pink-300 transition-colors duration-300 px-2">
                {artist.name}
              </span>
              <span className="mx-4 text-white/30 group-last:hidden">•</span>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50% - 2rem));
          }
        }
        .animate-marquee {
          animation: marquee ${Math.max(artists.length * 2, 30)}s linear infinite;
          will-change: transform;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        @media (max-width: 768px) {
          .animate-marquee {
            animation-duration: ${Math.max(artists.length * 1.5, 20)}s;
          }
        }
      `}</style>
    </div>
  );
}
