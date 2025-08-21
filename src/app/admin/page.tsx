"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PrimaryButton, SecondaryButton, LinkButton } from "@/components/ui/buttons";


interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  totalArtists: number;
  eventsWithArtists: number;
  eventsThisMonth: number;
  artistsThisMonth: number;
}

interface RecentEvent {
  id: number;
  title: string;
  start_date: string;
  genre: string;
  type: string;
  location: string | null;
  artist: { name: string } | null;
}

interface RecentArtist {
  id: number;
  name: string;
  image_path: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [recentArtists, setRecentArtists] = useState<RecentArtist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Récupérer les statistiques
      const [eventsResponse, artistsResponse] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/artists"),
      ]);

      if (eventsResponse.ok && artistsResponse.ok) {
        const eventsData = await eventsResponse.json();
        const artistsData = await artistsResponse.json();

        const events = eventsData.events || eventsData;
        const artists = artistsData;

        // Calculer les statistiques
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalEvents = events.length;
        const upcomingEvents = events.filter((e: any) => new Date(e.start_date) > now).length;
        const pastEvents = events.filter((e: any) => new Date(e.start_date) <= now).length;
        const totalArtists = artists.length;
        const eventsWithArtists = events.filter((e: any) => e.artist).length;
        const eventsThisMonth = events.filter((e: any) => new Date(e.created_at || e.start_date) >= thisMonth).length;
        const artistsThisMonth = artists.filter((a: any) => new Date(a.created_at) >= thisMonth).length;

        setStats({
          totalEvents,
          upcomingEvents,
          pastEvents,
          totalArtists,
          eventsWithArtists,
          eventsThisMonth,
          artistsThisMonth,
        });

        // Récupérer les événements récents
        const sortedEvents = events
          .sort((a: any, b: any) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
          .slice(0, 5);
        setRecentEvents(sortedEvents);

        // Récupérer les artistes récents
        const sortedArtists = artists
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        setRecentArtists(sortedArtists);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  // Corriger les erreurs de stats null
  if (!stats) {
    return <div>Chargement...</div>;
  }


  return (
    <ProtectedRoute> 
    <div className="max-w-7xl mx-auto p-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tableau de bord
        </h1>
        <p className="text-gray-600">
          Vue d'ensemble de votre plateforme Pulse
        </p>
      </div>

      {/* Actions rapides */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Section Artistes */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Artistes</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalArtists}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="flex justify-between items-center">
              <LinkButton 
                href="/admin/artists" 
                variant="primary" 
                size="sm"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                }
              >
                Voir tous
              </LinkButton>
              <LinkButton 
                href="/admin/artists/new" 
                variant="default" 
                size="sm"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Ajouter
              </LinkButton>
            </div>
          </div>
        </div>

        {/* Section Événements */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Événements</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalEvents}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="flex justify-between items-center">
              <LinkButton 
                href="/admin/events" 
                variant="primary" 
                size="sm"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                }
              >
                Voir tous
              </LinkButton>
              <LinkButton 
                href="/admin/events/new" 
                variant="default" 
                size="sm"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Ajouter
              </LinkButton>
            </div>
          </div>
        </div>

        {/* Section Utilisateurs */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Utilisateurs</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalArtists}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="flex justify-between items-center">
              <LinkButton 
                href="/admin/users" 
                variant="primary" 
                size="sm"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                }
              >
                Voir tous
              </LinkButton>
              <LinkButton 
                href="/admin/users/new" 
                variant="default" 
                size="sm"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Ajouter
              </LinkButton>
            </div>
          </div>
        </div>
      </div>



      {/* Contenu récent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Événements récents */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Événements récents</h3>
              <Link
                href="/admin/events"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Voir tout
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun événement récent</p>
            ) : (
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {event.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.start_date).toLocaleDateString('fr-FR')} • {event.location || 'Lieu non spécifié'}
                      </p>
                    </div>
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Voir
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Artistes récents */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Artistes récents</h3>
              <Link
                href="/admin/artists"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Voir tout
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentArtists.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun artiste récent</p>
            ) : (
              <div className="space-y-4">
                {recentArtists.map((artist) => (
                  <div key={artist.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {artist.image_path ? (
                        <img
                          className="w-10 h-10 rounded-full object-cover"
                          src={artist.image_path}
                          alt={artist.name}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {artist.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Ajouté le {new Date(artist.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Link
                      href={`/admin/artists/${artist.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Voir
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
    </ProtectedRoute>
  );
}
