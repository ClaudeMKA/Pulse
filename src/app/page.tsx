'use client';

import { useEffect, useState } from 'react';
import { COLORS } from '@/lib/theme';
import Hero from '@/components/ui/Hero';
import ArtistsGrid from '@/components/ui/ArtistsGrid';
import EventsTimeline from '@/components/ui/EventsTimeline';
import FAQ from '@/components/ui/FAQ';

type Event = {
  id: number;
  title: string;
  desc: string;
  start_date: string | Date;
  genre: string;
  type: string;
  location: string | null;
  image_path: string | null;
  artist?: {
    id: number;
    name: string;
    image_path?: string | null;
  } | null;
};

const faqItems = [
  { q: 'Où se déroule le festival ?', a: 'Le festival a lieu à Rouen' },
  { q: 'Comment acheter un billet ?', a: 'Cliquez sur le bouton "Acheter un billet" ou rendez-vous sur la page de l\'événement.' },
  { q: 'Quels sont les moyens d\'accès ?', a: 'Métro, bus, tramway et parkings à proximité.' },
];

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [artists, setArtists] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/events?upcoming=true', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          next: { revalidate: 60 },
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des événements');
        }
        
        const { events: fetchedEvents } = await response.json();
        
        // Formater les dates et s'assurer que les artistes sont correctement définis
        const formattedEvents = fetchedEvents.map((event: any) => ({
          ...event,
          start_date: new Date(event.start_date),
          artist: event.artist || { id: 0, name: 'Artiste inconnu' }
        }));
        
        setEvents(formattedEvents);
        
        // Extraire les artistes uniques
        const uniqueArtists = new Set<string>();
        formattedEvents.forEach(event => {
          if (event.artist?.name) {
            uniqueArtists.add(event.artist.name);
          }
        });
        setArtists(uniqueArtists);
        
      } catch (err) {
        console.error('Erreur lors du chargement des événements:', err);
        setError('Impossible de charger les événements. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Vérifier s'il y a des événements
  if (!events.length) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Aucun événement à venir</h2>
          <p className="text-gray-600 mt-2">Revenez plus tard pour découvrir nos prochains événements !</p>
        </div>
      </main>
    );
  }

  // Trier les événements par date croissante
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );
  
  const featuredEvent = sortedEvents[0];
  
  // Convertir les événements au format attendu par le composant Timeline
  const timelineEvents: TimelineEvent[] = sortedEvents.map(event => ({
    id: event.id,
    title: event.title,
    desc: event.desc,
    start_date: new Date(event.start_date),
    genre: event.genre,
    type: event.type,
    location: event.location || 'Lieu non spécifié',
    artist: { name: event.artist?.name || 'Artiste inconnu' },
    image_path: event.image_path
  }));
  
  // Convertir les artistes au format attendu par ArtistsGrid
  const artistList = Array.from(artists).map(name => ({
    name,
    image: `/assets/artists/${name.toLowerCase().replace(/\s+/g, '-')}.jpg`
  }));

  return (
    <main className="min-h-screen bg-white">
      {featuredEvent && (
        <Hero
          featured={{
            title: featuredEvent.title,
            desc: featuredEvent.desc,
            start_date: new Date(featuredEvent.start_date),
            genre: featuredEvent.genre,
            type: featuredEvent.type,
            location: featuredEvent.location || 'Lieu non spécifié',
            artist: { name: featuredEvent.artist?.name || 'Artiste inconnu' },
            image_path: featuredEvent.image_path || '/assets/events/hero-bg.jpg'
          }}
          stats={{
            artistsCount: artists.size,
            eventsCount: events.length,
            cities: Array.from(
              new Set(
                events
                  .map(e => e.location?.split(',')[0]?.trim())
                  .filter(Boolean)
              )
            ) as string[],
          }}
        />
      )}

      {/* ARTISTES */}
      {artistList.length > 0 && <ArtistsGrid artists={artistList} />}
      
      {/* ÉVÉNEMENTS - TIMELINE */}
      {timelineEvents.length > 0 && <EventsTimeline events={timelineEvents} />}

      {/* FAQ */}
      <FAQ items={faqItems} />

      {/* FOOTER */}
      <footer className="w-full py-10 px-4 text-center" style={{ background: COLORS.violet }}>
        <p className="text-white font-semibold text-lg">
          &copy; {new Date().getFullYear()} Pulse Festival — Tous droits réservés.
        </p>
      </footer>
    </main>
  );
}