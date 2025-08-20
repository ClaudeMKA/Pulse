"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

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

      {/* Statistiques principales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Événements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Événements</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalEvents}</p>
              </div>
            </div>
          </div>

          {/* Événements à venir */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">À venir</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.upcomingEvents}</p>
              </div>
            </div>
          </div>

          {/* Total Artistes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Artistes</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalArtists}</p>
              </div>
            </div>
          </div>

          {/* Événements avec artistes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avec Artiste</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.eventsWithArtists}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques secondaires */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Activité ce mois */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Activité ce mois</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Nouveaux événements</span>
                <span className="text-sm font-medium text-gray-900">{stats.eventsThisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Nouveaux artistes</span>
                <span className="text-sm font-medium text-gray-900">{stats.artistsThisMonth}</span>
              </div>
            </div>
          </div>

          {/* Répartition des événements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition des événements</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Événements passés</span>
                <span className="text-sm font-medium text-gray-900">{stats.pastEvents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Taux de complétion</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.totalEvents > 0 ? Math.round((stats.pastEvents / stats.totalEvents) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Actions rapides */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/events/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Nouvel événement</p>
              <p className="text-sm text-gray-500">Créer un événement</p>
            </div>
          </Link>

          <Link
            href="/admin/artists/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Nouvel artiste</p>
              <p className="text-sm text-gray-500">Ajouter un artiste</p>
            </div>
          </Link>

          <Link
            href="/admin/events"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Gérer les événements</p>
              <p className="text-sm text-gray-500">Voir la liste complète</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
