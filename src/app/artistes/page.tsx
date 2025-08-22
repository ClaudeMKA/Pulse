"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Header from "@/components/ui/Header";
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
  latitude: number | null;
  longitude: number | null;
  image_path: string | null;
  artist_id: number | null;
  created_at: string;
  updated_at: string;
}

interface Artist {
  id: number;
  name: string;
  desc: string | null;
  image_path: string | null;
  events: Event[];
  created_at: string;
  updated_at: string;
}

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Date invalide';
  }
}

function getGenreColor(genre: string) {
  const colors = {
    RAP: COLORS.violet,
    RNB: COLORS.rose,
    REGGAE: COLORS.corail,
    ROCK: COLORS.lavande,
  };
  return colors[genre as keyof typeof colors] || COLORS.violet;
}

function getTypeColor(type: string) {
  const colors = {
    CONCERT: COLORS.roseClair,
    FESTIVAL: COLORS.lavande,
    SHOWCASE: COLORS.rose,
    OTHER: COLORS.corail,
  };
  return colors[type as keyof typeof colors] || COLORS.roseClair;
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
        console.log("artistes", data);
        setArtists(data);
      } catch (error) {
        console.error('Erreur:', error);
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-4" style={{ borderColor: COLORS.violet }}></div>
            <p className="text-xl text-gray-600">Chargement des artistes...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-xl text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition"
              style={{ backgroundColor: COLORS.violet }}
            >
              Réessayer
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 text-center" style={{ background: `linear-gradient(135deg, ${COLORS.violet}60, ${COLORS.lavande}60)` }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 font-display" style={{ color: COLORS.violet }}>
            Nos Artistes
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Découvrez tous les artistes du festival et leurs événements à venir
          </p>
          <div className="text-lg text-gray-500">
            {artists.length} artiste{artists.length > 1 ? 's' : ''} • {artists.reduce((total, artist) => total + artist.events.length, 0)} événement{artists.reduce((total, artist) => total + artist.events.length, 0) > 1 ? 's' : ''}
          </div>
        </motion.div>
      </section>

      {/* Artists Grid */}
      <section className="max-w-7xl mx-auto py-16 px-4">
        {artists.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎵</div>
            <h2 className="text-2xl font-bold text-gray-600 mb-4">Aucun artiste pour le moment</h2>
            <p className="text-gray-500">La programmation sera bientôt disponible !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {artists.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 hover:shadow-2xl transition-all duration-300"
                style={{ borderColor: COLORS.lavande }}
              >
                {/* Artist Header */}
                <div className="relative">
                  <div className="h-64 overflow-hidden">
                    <Image
                      src={artist.image_path || '/assets/placeholder-artist.jpg'}
                      alt={artist.name}
                      width={600}
                      height={400}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-3xl font-bold text-white mb-2 font-display">
                      {artist.name}
                    </h2>
                    {artist.desc && (
                      <p className="text-white/90 text-sm line-clamp-2">
                        {artist.desc}
                      </p>
                    )}
                  </div>
                </div>

                {/* Events Section */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold" style={{ color: COLORS.violet }}>
                      Événements ({artist.events.length})
                    </h3>
                    {artist.events.length > 0 && (
                      <span className="text-sm text-gray-500">
                        Prochains concerts
                      </span>
                    )}
                  </div>

                  {artist.events.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-3xl mb-2">📅</div>
                      <p>Aucun événement programmé</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {artist.events.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="border rounded-xl p-4 hover:shadow-md transition-shadow"
                          style={{ borderColor: COLORS.roseClair }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-lg" style={{ color: COLORS.violet }}>
                              {event.title}
                            </h4>
                            <div className="flex gap-2">
                              <span
                                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: getGenreColor(event.genre) }}
                              >
                                {event.genre}
                              </span>
                              <span
                                className="px-2 py-1 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: getTypeColor(event.type),
                                  color: COLORS.violet 
                                }}
                              >
                                {event.type}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {event.desc}
                          </p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                            <span>
                              <strong>Date:</strong> {formatDate(event.start_date)}
                            </span>
                            {event.location && (
                              <span>
                                <strong>Lieu:</strong> {event.location}
                              </span>
                            )}
                          </div>

                          {event.image_path && (
                            <div className="mt-3">
                              <Image
                                src={event.image_path}
                                alt={event.title}
                                width={400}
                                height={200}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {artist.events.length > 3 && (
                        <div className="text-center pt-4">
                          <button
                            className="px-6 py-2 rounded-full text-sm font-medium border-2 hover:shadow-md transition-all"
                            style={{ 
                              borderColor: COLORS.violet,
                              color: COLORS.violet,
                            }}
                          >
                            Voir tous les événements ({artist.events.length - 3} de plus)
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="w-full py-10 px-4 text-center" style={{ background: COLORS.violet }}>
        <p className="text-white font-semibold text-lg">
          &copy; {new Date().getFullYear()} Pulse Festival — Tous droits réservés.
        </p>
      </footer>
    </main>
  );
}
