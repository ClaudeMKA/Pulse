"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/ui/Header";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import EventBadge from "@/components/ui/EventBadge";

import Footer from "@/components/ui/Footer";
import { COLORS } from "@/lib/theme";
import { formatDateOnly, formatDate } from "@/lib/dateUtils";
import { motion } from "framer-motion";

interface Artist {
  id: number;
  name: string;
  image_path: string | null;
}

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
  latitude: number | null;
  longitude: number | null;
  price: number | null;
  capacity: number | null;
  artist_id: number | null;
  artist?: Artist | null;
  created_at: string;
}

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Événement non trouvé');
          }
          throw new Error('Erreur lors du chargement de l&apos;événement');
        }
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        console.error('Erreur:', err);
        setError(err instanceof Error ? err.message : 'Impossible de charger l&apos;événement');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  const handleReservation = () => {
    // TODO: Implémenter la logique de réservation
    alert('Fonctionnalité de réservation à implémenter');
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <LoadingSpinner 
          size="lg" 
          message="Chargement de l&apos;événement..." 
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
          onBack={() => router.back()}
          fullScreen
        />
      </main>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section avec image de l'événement */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={event.image_path || '/assets/placeholder-event.jpg'}
            alt={event.title}
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
              <div className="flex flex-wrap gap-3 mb-4">
                <EventBadge type="genre" value={event.genre} size="lg" />
                <EventBadge type="eventType" value={event.type} size="lg" />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 font-display">
                {event.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <span>📅 {formatDateOnly(event.start_date)}</span>
                {event.location && (
                  <>
                    <span>•</span>
                    <span>📍 {event.location}</span>
                  </>
                )}
                {event.artist && (
                  <>
                    <span>•</span>
                    <span>🎤 {event.artist.name}</span>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="max-w-7xl mx-auto py-16 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Colonne principale - Informations de l'événement */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-3xl shadow-xl p-8 border-2 mb-8"
              style={{ borderColor: COLORS.lavande }}
            >
              <h2 className="text-3xl font-bold mb-6 font-display" style={{ color: COLORS.violet }}>
                À propos de l&apos;événement
              </h2>
              
              {event.desc ? (
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {event.desc}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📝</div>
                  <p>Aucune description disponible pour cet événement.</p>
                </div>
              )}
            </motion.div>


          </div>

          {/* Sidebar - Informations et réservation */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-3xl shadow-xl p-6 border-2 mb-8"
              style={{ borderColor: COLORS.lavande }}
            >
              <h3 className="text-xl font-bold mb-6" style={{ color: COLORS.violet }}>
                Informations pratiques
              </h3>
              
              <div className="space-y-4">
                {/* Date et heure */}
                <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: `${COLORS.violet}10` }}>
                  <span className="font-medium" style={{ color: COLORS.violet }}>Date & Heure</span>
                  <span className="font-bold text-sm" style={{ color: COLORS.violet }}>
                    {formatDate(event.start_date)}
                  </span>
                </div>

                {/* Prix */}
                {event.price && (
                  <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: `${COLORS.rose}10` }}>
                    <span className="font-medium" style={{ color: COLORS.rose }}>Prix</span>
                    <span className="font-bold text-lg" style={{ color: COLORS.rose }}>
                      {event.price}€
                    </span>
                  </div>
                )}

                {/* Capacité */}
                {event.capacity && (
                  <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: `${COLORS.corail}10` }}>
                    <span className="font-medium" style={{ color: COLORS.corail }}>Capacité</span>
                    <span className="font-bold text-lg" style={{ color: COLORS.corail }}>
                      {event.capacity} places
                    </span>
                  </div>
                )}

                {/* Artiste */}
                {event.artist && (
                  <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: `${COLORS.lavande}10` }}>
                    <span className="font-medium" style={{ color: COLORS.lavande }}>Artiste</span>
                    <span className="font-bold text-sm" style={{ color: COLORS.lavande }}>
                      {event.artist.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Bouton de réservation */}
              <div className="mt-8">
                <button
                  onClick={handleReservation}
                  className="w-full px-6 py-4 rounded-2xl text-white font-bold text-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  style={{ backgroundColor: COLORS.violet }}
                >
                  🎫 Réserver une place
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-2">
                  Réservation sécurisée en ligne
                </p>
              </div>
            </motion.div>

            {/* Artiste associé */}
            {event.artist && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-3xl shadow-xl p-6 border-2"
                style={{ borderColor: COLORS.lavande }}
              >
                <h3 className="text-xl font-bold mb-4" style={{ color: COLORS.violet }}>
                  Artiste à l&apos;affiche
                </h3>
                
                <div className="flex items-center gap-4">
                  {event.artist.image_path && (
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={event.artist.image_path}
                        alt={event.artist.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-lg" style={{ color: COLORS.violet }}>
                      {event.artist.name}
                    </h4>
                    <p className="text-sm text-gray-600">Artiste principal</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button
                    onClick={() => router.push(`/artistes/${event.artist?.id}`)}
                    className="w-full px-4 py-2 rounded-lg border-2 font-medium hover:shadow-sm transition-all text-sm"
                    style={{ 
                      borderColor: COLORS.violet,
                      color: COLORS.violet 
                    }}
                  >
                    Voir le profil de l&apos;artiste
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
