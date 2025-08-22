"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StripePayment from "@/components/ui/StripePayment";

interface Event {
  id: number;
  title: string;
  desc: string;
  start_date: string;
  genre: string;
  type: string;
  location: string | null;
  image_path: string | null;
  price: number;
  currency: string;
  artist: {
    id: number;
    name: string;
  } | null;
}

interface ParticipationStatus {
  [key: number]: boolean;
}

export default function EventsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [participationStatus, setParticipationStatus] = useState<ParticipationStatus>({});
  const [loadingParticipation, setLoadingParticipation] = useState<number | null>(null);
  const [showPayment, setShowPayment] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (session && events.length > 0) {
      checkParticipationStatus();
    }
  }, [session, events]);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events?upcoming=true");
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des événements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkParticipationStatus = async () => {
    const statuses: ParticipationStatus = {};
    
    for (const event of events) {
      try {
        const response = await fetch(`/api/events/${event.id}/register`);
        if (response.ok) {
          const data = await response.json();
          statuses[event.id] = data.isRegistered;
        }
      } catch (error) {
        console.error(`Erreur lors de la vérification pour l'événement ${event.id}:`, error);
      }
    }
    
    setParticipationStatus(statuses);
  };

  const handleToggleParticipation = async (eventId: number, isRegistered: boolean) => {
    if (!session) {
      router.push("/auth/login?callbackUrl=/events");
      return;
    }

    // Si l'utilisateur veut se désinscrire
    if (isRegistered) {
      setLoadingParticipation(eventId);
      
      try {
        const response = await fetch(`/api/events/${eventId}/register`, {
          method: "DELETE",
        });

        if (response.ok) {
          setParticipationStatus(prev => ({
            ...prev,
            [eventId]: false,
          }));
          
          const data = await response.json();
          alert(data.message);
        } else {
          const error = await response.json();
          alert(error.message);
        }
      } catch (error) {
        console.error("Erreur:", error);
        alert("Une erreur est survenue");
      } finally {
        setLoadingParticipation(null);
      }
      return;
    }

    // Si l'utilisateur veut s'inscrire
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    // Si l'événement est gratuit, inscription directe
    if (event.price <= 0) {
      setLoadingParticipation(eventId);
      
      try {
        const response = await fetch(`/api/events/${eventId}/register`, {
          method: "POST",
        });

        if (response.ok) {
          setParticipationStatus(prev => ({
            ...prev,
            [eventId]: true,
          }));
          
          const data = await response.json();
          alert(data.message);
        } else {
          const error = await response.json();
          alert(error.message);
        }
      } catch (error) {
        console.error("Erreur:", error);
        alert("Une erreur est survenue");
      } finally {
        setLoadingParticipation(null);
      }
    } else {
      // Si l'événement est payant, afficher le formulaire de paiement
      setShowPayment(event);
    }
  };

  const handlePaymentSuccess = () => {
    if (showPayment) {
      setParticipationStatus(prev => ({
        ...prev,
        [showPayment.id]: true,
      }));
      setShowPayment(null);
      alert("Paiement réussi ! Vous êtes maintenant inscrit à l'événement.");
    }
  };

  const handlePaymentError = (error: string) => {
    alert(`Erreur de paiement : ${error}`);
  };

  const handlePaymentCancel = () => {
    setShowPayment(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des événements...</p>
        </div>
      </div>
    );
  }

  if (showPayment) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <StripePayment
            event={showPayment}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            onCancel={handlePaymentCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Événements à venir
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez nos prochains événements et inscrivez-vous pour ne rien manquer
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun événement à venir</h3>
            <p className="mt-1 text-sm text-gray-500">
              Revenez bientôt pour découvrir nos prochains événements.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {event.image_path ? (
                  <img
                    src={event.image_path}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
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

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  
                  {event.artist && (
                    <p className="text-sm text-gray-600 mb-2">
                      Avec <span className="font-medium">{event.artist.name}</span>
                    </p>
                  )}

                  <p className="text-gray-600 mb-4 line-clamp-2">{event.desc}</p>

                  {/* Prix */}
                  <div className="mb-4">
                    {event.price > 0 ? (
                      <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                        <span className="text-sm text-blue-800 font-medium">Prix :</span>
                        <span className="text-lg font-bold text-blue-900">
                          {event.price.toFixed(2)} {event.currency}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-green-50 rounded-lg p-3">
                        <span className="text-sm font-medium text-green-800">Événement gratuit</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-gray-500 mb-6">
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

                  <button
                    onClick={() => handleToggleParticipation(event.id, participationStatus[event.id])}
                    disabled={loadingParticipation === event.id}
                    className={`w-full px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                      participationStatus[event.id]
                        ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                        : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loadingParticipation === event.id ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Chargement...
                      </div>
                    ) : participationStatus[event.id] ? (
                      "Se désinscrire"
                    ) : event.price > 0 ? (
                      `S'inscrire - ${event.price.toFixed(2)} ${event.currency}`
                    ) : (
                      "S'inscrire gratuitement"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {session && (
          <div className="mt-12 text-center">
            <Link
              href="/my-events"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Voir mes événements
              <svg className="ml-2 -mr-1 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}