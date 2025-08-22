"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/ui/Header";
import EventCard from "@/components/ui/EventCard";
import { COLORS } from "@/lib/theme";
import { formatDateOnly } from "@/lib/dateUtils";
import { getGenreColor } from "@/lib/eventUtils";
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
  created_at: string;
  events?: Event[];
}


export default function ArtistePage() {
  const params = useParams();
  const router = useRouter();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const response = await fetch(`/api/artists/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Artiste non trouvé');
          }
          throw new Error('Erreur lors du chargement de l\'artiste');
        }
        const data = await response.json();
        setArtist(data);
      } catch (err) {
        console.error('Erreur:', err);
        setError(err instanceof Error ? err.message : 'Impossible de charger l\'artiste');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchArtist();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div 
              className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-4" 
              style={{ borderColor: COLORS.violet }}
            ></div>
            <p className="text-xl text-gray-600">Chargement de l&apos;artiste...</p>
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
            <div className="space-x-4">
              <button 
                onClick={() => router.back()} 
                className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition mr-4"
                style={{ backgroundColor: COLORS.rose }}
              >
                Retour
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition"
                style={{ backgroundColor: COLORS.violet }}
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!artist) {
    return null;
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      {/* Hero Section avec image de l'artiste */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={artist.image_path || '/assets/placeholder-artist.jpg'}
            alt={artist.name}
            fill
            className="object-cover"
            quality={95}
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>
        
        <div className="relative h-full flex items-end">
          <div className="max-w-7xl mx-auto w-full px-4 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 font-display">
                {artist.name}
              </h1>
              
              <div className="flex items-center gap-6 text-white/90">
                <span>Artiste depuis {formatDateOnly(artist.created_at)}</span>
                <span>•</span>
                <span>{artist.events?.length || 0} événement{(artist.events?.length || 0) > 1 ? 's' : ''}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="max-w-7xl mx-auto py-16 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Colonne principale - Informations de l'artiste */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-3xl shadow-xl p-8 border-2"
              style={{ borderColor: COLORS.lavande }}
            >
              <h2 className="text-3xl font-bold mb-6 font-display" style={{ color: COLORS.violet }}>
                À propos de {artist.name}
              </h2>
              
              {artist.desc ? (
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {artist.desc}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">🎵</div>
                  <p>Aucune description disponible pour cet artiste.</p>
                </div>
              )}
            </motion.div>

            {/* Événements */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8"
            >
              <h2 className="text-3xl font-bold mb-6 font-display" style={{ color: COLORS.violet }}>
                Événements ({artist.events?.length || 0})
              </h2>

              {(artist.events?.length || 0) === 0 ? (
                <div className="bg-white rounded-3xl shadow-xl p-8 border-2 text-center" style={{ borderColor: COLORS.lavande }}>
                  <div className="text-4xl mb-4">📅</div>
                  <h3 className="text-xl font-bold text-gray-600 mb-2">Aucun événement programmé</h3>
                  <p className="text-gray-500">Les prochains concerts seront bientôt annoncés !</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {(artist.events || []).map((event, index) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      index={index}
                      variant="artist-timeline"
                      showLink={true}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar - Informations supplémentaires */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-3xl shadow-xl p-6 border-2 sticky top-24"
              style={{ borderColor: COLORS.lavande }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: COLORS.violet }}>
                Statistiques
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: `${COLORS.violet}10` }}>
                  <span className="font-medium" style={{ color: COLORS.violet }}>Événements totaux</span>
                  <span className="font-bold text-2xl" style={{ color: COLORS.violet }}>
                    {artist.events?.length || 0}
                  </span>
                </div>
                
                {artist.events && artist.events.length > 0 && (
                  <>
                    <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: `${COLORS.rose}10` }}>
                      <span className="font-medium" style={{ color: COLORS.rose }}>Prochain événement</span>
                      <span className="font-bold text-sm" style={{ color: COLORS.rose }}>
                        {formatDateOnly(artist.events[0].start_date)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: `${COLORS.corail}10` }}>
                      <span className="font-medium" style={{ color: COLORS.corail }}>Genres</span>
                      <div className="flex gap-1">
                        {[...new Set(artist.events.map(e => e.genre))].slice(0, 2).map((genre) => (
                          <span
                            key={genre}
                            className="px-2 py-1 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: getGenreColor(genre) }}
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
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
