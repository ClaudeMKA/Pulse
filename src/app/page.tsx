'use client';

import { useEffect, useState } from 'react';
import Hero from '@/components/ui/Hero';
import ArtistsGrid from '@/components/ui/ArtistsGrid';
import EventsTimeline from '@/components/ui/EventsTimeline';
import FAQ from "@/components/ui/FAQ";
import Map from "@/components/Map/Map";
import Header from '@/components/ui/Header';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Footer from '@/components/ui/Footer';

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
  const [artists, setArtists] = useState<Set<{name: string, image_path: string}>>(new Set());

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
        
        const formattedEvents = fetchedEvents.map((event: Event) => ({
          ...event,
          start_date: new Date(event.start_date as string),
          artist: event.artist || { id: 0, name: 'Artiste inconnu', image_path: null }
        }));
        
        setEvents(formattedEvents);

        const uniqueArtists = new Set<{name: string, image_path: string}>();
        formattedEvents.forEach((event: Event) => {
          if (event.artist?.name) {
            uniqueArtists.add({
              name: event.artist.name, 
              image_path: event.artist.image_path || '/assets/placeholder-artist.jpg'
            });
          }
        });
        setArtists(uniqueArtists);
        
      } catch {
        setError('Impossible de charger les événements. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) {
    return <LoadingSpinner size="lg" fullScreen />;
  }

  if (error) {
    return <ErrorMessage message={error} fullScreen />;
  }

  const sortedEvents = [...events].sort(
    (a: Event, b: Event) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );
  
  const timelineEvents = sortedEvents.map((event: Event) => ({
    id: event.id,
    title: event.title,
    desc: event.desc,
    start_date: new Date(event.start_date as string),
    genre: event.genre,
    type: event.type,
    location: event.location || 'Lieu non spécifié',
    artist: { name: event.artist?.name || 'Artiste inconnu' },
    image_path: event.image_path || '/assets/placeholder-event.jpg'
  }));
  
  const artistList = Array.from(artists).map(artist => ({
    name: artist.name,
    image_path: artist.image_path || '/assets/placeholder-artist.jpg'
  }));

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero
        stats={{
          artistsCount: artists.size,
          eventsCount: events.length,
          cities: "Rouen",
        }}
        events={events}
      />
      <div className="w-full">
        {artistList.length > 0 && <ArtistsGrid artists={artistList} />}
        <Map />
        {timelineEvents.length > 0 && <EventsTimeline events={timelineEvents} />}
        <FAQ items={faqItems} />
        
        <Footer />
      </div>
    </main>
  );
}