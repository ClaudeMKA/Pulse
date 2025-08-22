"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/ui/Header";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Footer from "@/components/ui/Footer";
import HeroSection from "@/components/ui/HeroSection";
import EventCard from "@/components/ui/EventCard";
import { COLORS } from "@/lib/theme";
import { motion } from "framer-motion";

interface Event {
  id: number;
  title: string;
  desc: string;
  start_date: string;
  end_date: string | null;
  genre: string;
  type: string;
  location: string | null;
  image_path: string | null;
  artist_id: number | null;
}

interface Artist {
  id: number;
  name: string;
  desc: string | null;
  image_path: string | null;
  events?: Event[];
}



export default function ArtistesPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await fetch('/api/artists');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des artistes');
        }
        const data = await response.json();

        setArtists(data);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les artistes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtists();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <LoadingSpinner 
          size="lg" 
          message="Chargement des artistes..." 
          fullScreen 
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <ErrorMessage 
          message={error}
          onRetry={() => window.location.reload()}
          fullScreen
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <HeroSection
        title="Nos Artistes"
        subtitle="Découvrez tous les artistes du festival et leurs événements à venir"
        stats={
          <>
            {artists.length} artiste{artists.length > 1 ? 's' : ''} • {' '}
            {artists.reduce((total, artist) => total + (artist.events?.length || 0), 0)} événement
            {artists.reduce((total, artist) => total + (artist.events?.length || 0), 0) > 1 ? 's' : ''}
          </>
        }
      />

      {/* Artists Grid */}
      <section className="max-w-7xl mx-auto py-16 px-4">
        {artists.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎵</div>
            <h2 className="text-2xl font-bold text-gray-600 mb-4">Aucun artiste pour le moment</h2>
            <p className="text-gray-500">La programmation sera bientôt disponible !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {artists.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                style={{ borderColor: COLORS.lavande }}
              >
                <Link href={`/artistes/${artist.id}`} className="block">
                  {/* Artist Header */}
                  <div className="relative">
                    <div className="h-48 overflow-hidden">
                      <Image
                        src={artist.image_path || '/assets/placeholder-artist.jpg'}
                        alt={artist.name}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        quality={90}
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h2 className="text-2xl font-bold text-white mb-1 font-display">
                        {artist.name}
                      </h2>
                      {artist.desc && (
                        <p className="text-white/90 text-xs line-clamp-2">
                          {artist.desc}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Events Section */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold" style={{ color: COLORS.violet }}>
                      Événements ({artist.events?.length || 0})
                    </h3>
                  </div>

                  {(artist.events?.length || 0) === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <div className="text-2xl mb-2">📅</div>
                      <p className="text-sm">Aucun événement programmé</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(artist.events || []).slice(0, 2).map((event, index) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          index={index}
                          variant="mini"
                          showLink={true}
                        />
                      ))}
                      
                      {(artist.events?.length || 0) > 2 && (
                        <Link href={`/artistes/${artist.id}`}>
                          <div className="text-center pt-2">
                            <button
                              className="px-4 py-2 rounded-lg text-xs font-medium border hover:shadow-sm transition-all w-full"
                              style={{ 
                                borderColor: COLORS.violet,
                                color: COLORS.violet,
                              }}
                            >
                              Voir tous les événements ({(artist.events?.length || 0) - 2} de plus)
                            </button>
                          </div>
                        </Link>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <Link href={`/artistes/${artist.id}`}>
                      <button
                        className="w-full px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition text-sm"
                        style={{ backgroundColor: COLORS.violet }}
                      >
                        Voir le profil complet
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
