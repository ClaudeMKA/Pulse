"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface EventParticipation {
  id: number;
  created_at: string;
  event: {
    id: number;
    title: string;
    desc: string;
    start_date: string;
    genre: string;
    type: string;
    location: string | null;
    image_path: string | null;
    artist: {
      id: number;
      name: string;
    } | null;
  };
}

export default function MyEventsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [participations, setParticipations] = useState<EventParticipation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    if (session?.user?.id) {
      fetchMyEvents();
    }
  }, [session]);

  const fetchMyEvents = async () => {
    try {
      const response = await fetch(`/api/users/${session?.user?.id}/events`);
      if (response.ok) {
        const data = await response.json();
        setParticipations(data.participations || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des événements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnregister = async (eventId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir vous désinscrire de cet événement ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "DELETE",
      });

      if (response.ok) {
        setParticipations(prev => prev.filter(p => p.event.id !== eventId));
        alert("Désinscription réussie");
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue");
    }
  };

  const now = new Date();
  const upcomingEvents = participations.filter(p => new Date(p.event.start_date) >= now);
  const pastEvents = participations.filter(p => new Date(p.event.start_date) < now);
  const displayedEvents = activeTab === "upcoming" ? upcomingEvents : pastEvents;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de vos événements...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mes événements
            </h1>
            <p className="text-gray-600">
              Retrouvez tous les événements auxquels vous êtes inscrit
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "upcoming"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                À venir ({upcomingEvents.length})
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "past"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Passés ({pastEvents.length})
              </button>
            </nav>
          </div>

          {displayedEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {activeTab === "upcoming" 
                  ? "Aucun événement à venir"
                  : "Aucun événement passé"
                }
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === "upcoming" 
                  ? "Inscrivez-vous à des événements pour les voir apparaître ici."
                  : "Les événements passés apparaîtront ici."
                }
              </p>
              {activeTab === "upcoming" && (
                <div className="mt-6">
                  <Link
                    href="/events"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Découvrir les événements
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedEvents.map((participation) => {
                const event = participation.event;
                const isPast = new Date(event.start_date) < now;
                
                return (
                  <div key={participation.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {event.image_path ? (
                      <img
                        src={event.image_path}
                        alt={event.title}
                        className={`w-full h-48 object-cover ${isPast ? 'opacity-50' : ''}`}
                      />
                    ) : (
                      <div className={`w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${isPast ? 'opacity-50' : ''}`}>
                        <svg className="w-20 h-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {event.genre}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {event.type}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                      
                      {event.artist && (
                        <p className="text-sm text-gray-600 mb-2">
                          Avec <span className="font-medium">{event.artist.name}</span>
                        </p>
                      )}

                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(event.start_date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {event.location && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {event.location}
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 mb-4">
                        Inscrit le {new Date(participation.created_at).toLocaleDateString('fr-FR')}
                      </div>

                      {!isPast && (
                        <button
                          onClick={() => handleUnregister(event.id)}
                          className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Se désinscrire
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}