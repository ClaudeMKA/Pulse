"use client";

import { useEffect, useState } from "react";
import Header from "@/components/ui/Header";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Footer from "@/components/ui/Footer";
import HeroSection from "@/components/ui/HeroSection";
import EventCard from "@/components/ui/EventCard";
import { COLORS } from "@/lib/theme";
import { formatDateOnly } from "@/lib/dateUtils";
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
  artist?: {
    id: number;
    name: string;
    image_path?: string | null;
  } | null;
}

export default function ProgrammePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events?upcoming=true');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des événements');
        }
        const { events: fetchedEvents } = await response.json();
        
        // Trier les événements par date
        const sortedEvents = fetchedEvents.sort((a: Event, b: Event) => 
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        );
        
        setEvents(sortedEvents);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les événements');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Grouper les événements par date
  const eventsByDate = events.reduce((acc, event) => {
    const dateKey = formatDateOnly(event.start_date);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  // Filtrer les événements
  const filteredEvents = events.filter(event => {
    const matchesGenre = selectedGenre === "all" || event.genre === selectedGenre;
    const matchesType = selectedType === "all" || event.type === selectedType;
    
    let matchesDate = true;
    if (selectedDate !== "all") {
      const eventDate = formatDateOnly(event.start_date);
      matchesDate = eventDate === selectedDate;
    }
    
    return matchesGenre && matchesType && matchesDate;
  });

  // Obtenir les dates uniques pour le filtre
  const uniqueDates = [...new Set(events.map(event => formatDateOnly(event.start_date)))];
  const uniqueGenres = [...new Set(events.map(event => event.genre))];
  const uniqueTypes = [...new Set(events.map(event => event.type))];

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <LoadingSpinner 
          size="lg" 
          message="Chargement du programme..." 
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
        title="Programme"
        subtitle="Découvrez tous les événements du festival organisés par date"
        backgroundGradient={`linear-gradient(135deg, ${COLORS.rose}40, ${COLORS.corail}40)`}
        stats={
          <>
            {events.length} événement{events.length > 1 ? 's' : ''} • {' '}
            {uniqueDates.length} jour{uniqueDates.length > 1 ? 's' : ''} de festival • {' '}
            {uniqueGenres.length} genre{uniqueGenres.length > 1 ? 's' : ''}
          </>
        }
      />

      {/* Filtres */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2"
          style={{ borderColor: COLORS.lavande }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* Filtre par date */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: COLORS.violet }}>
                📅 <span>Filtrer par date</span>
              </h3>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm focus:border-violet-400 focus:outline-none transition-colors text-gray-800 bg-white"
              >
                <option value="all">Toutes les dates</option>
                {uniqueDates.map((date) => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
            </div>

            {/* Filtre par genre */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: COLORS.rose }}>
                🎵 <span>Filtrer par genre</span>
              </h3>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm focus:border-violet-400 focus:outline-none transition-colors text-gray-800 bg-white"
              >
                <option value="all">Tous les genres</option>
                {uniqueGenres.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            {/* Filtre par type */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: COLORS.corail }}>
                🎪 <span>Filtrer par type</span>
              </h3>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm focus:border-violet-400 focus:outline-none transition-colors text-gray-800 bg-white"
              >
                <option value="all">Tous les types</option>
                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Compteur de résultats */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <span className="text-gray-600">
              {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} trouvé{filteredEvents.length > 1 ? 's' : ''}
            </span>
          </div>
        </motion.div>
      </section>

      {/* Événements */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-600 mb-4">Aucun événement trouvé</h2>
            <p className="text-gray-500">Essayez de modifier vos filtres pour voir plus d&apos;événements.</p>
          </div>
        ) : selectedDate === "all" ? (
          // Affichage groupé par date quand "toutes les dates" est sélectionné
          <div className="space-y-12">
            {Object.entries(eventsByDate)
              .filter(([_, dateEvents]) => 
                dateEvents.some(event => {
                  const matchesGenre = selectedGenre === "all" || event.genre === selectedGenre;
                  const matchesType = selectedType === "all" || event.type === selectedType;
                  return matchesGenre && matchesType;
                })
              )
              .map(([date, dateEvents]) => {
                const filteredDateEvents = dateEvents.filter(event => {
                  const matchesGenre = selectedGenre === "all" || event.genre === selectedGenre;
                  const matchesType = selectedType === "all" || event.type === selectedType;
                  return matchesGenre && matchesType;
                });

                return (
                  <motion.div
                    key={date}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* En-tête de date */}
                    <div className="flex items-center gap-4 mb-8">
                      <div 
                        className="px-6 py-3 rounded-2xl text-white font-bold text-xl"
                        style={{ backgroundColor: COLORS.violet }}
                      >
                        {date}
                      </div>
                      <div className="flex-1 h-px bg-gray-200"></div>
                      <span className="text-gray-500 font-medium">
                        {filteredDateEvents.length} événement{filteredDateEvents.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Grille d'événements pour cette date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredDateEvents.map((event, index) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          index={index}
                          variant="default"
                        />
                      ))}
                    </div>
                  </motion.div>
                );
              })}
          </div>
        ) : (
          // Affichage simple en grille quand une date spécifique est sélectionnée
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                index={index}
                variant="default"
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
