"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Event {
  id: number;
  title: string;
  start_date: string;
  genre: string;
  type: string;
}

interface Artist {
  id: number;
  name: string;
  image_path: string | null;
  created_at: string;
  updated_at: string;
  events?: Event[];
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
        
        // Filtrer uniquement les artistes qui ont des événements
        const artistsWithEvents = data.filter((artist: Artist) => 
          artist.events && artist.events.length > 0
        );
        
        setArtists(artistsWithEvents);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtists();
  }, []);

  // Créer plus de duplications pour un défilement vraiment infini
  const duplicatedArtists = [...artists, ...artists, ...artists, ...artists];

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
            Artistes à l&apos;affiche
          </span>
          
          {duplicatedArtists.map((artist, index) => {
            // Alterner entre flamme et micro pour la variété
            const separatorEmoji = index % 2 === 0 ? '🔥' : '🎤';
            const isLast = index === duplicatedArtists.length - 1;
            
            return (
              <div key={`${artist.id}-${index}`} className="inline-flex items-center group">
                <Link 
                  href={`/artistes/${artist.id}`}
                  className="text-white text-lg font-medium hover:text-pink-300 transition-colors duration-300 px-2 cursor-pointer"
                >
                  {artist.name}
                </Link>
                {!isLast && (
                  <span className="mx-4 text-xl animate-pulse">
                    {separatorEmoji}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-25%);
          }
        }
        .animate-marquee {
          animation: marquee ${Math.max(artists.length * 3, 40)}s linear infinite;
          will-change: transform;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        @media (max-width: 768px) {
          .animate-marquee {
            animation-duration: ${Math.max(artists.length * 2, 25)}s;
          }
        }
        
        /* Animation pour les émojis séparateurs */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
        
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
