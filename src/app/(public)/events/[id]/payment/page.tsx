"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import Image from "next/image";
import StripePayment from "@/components/ui/StripePayment";
import Header from "@/components/ui/Header";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import EventBadge from "@/components/ui/EventBadge";
import { COLORS } from "@/lib/theme";
import { formatDate } from "@/lib/dateUtils";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Event {
  id: number;
  title: string;
  desc: string;
  price: number;
  currency: string;
  start_date: string;
  end_date: string | null;
  location: string;
  genre: string;
  type: string;
  image_path: string;
  artist?: {
    id: number;
    name: string;
    image_path: string | null;
  } | null;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }

    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params.id}`);
        if (response.ok) {
          const eventData = await response.json();
          if (eventData.price <= 0) {
            // Événement gratuit, rediriger vers inscription directe
            router.push(`/events/${params.id}`);
            return;
          }
          setEvent(eventData);
        } else {
          setError("Événement introuvable");
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError("Erreur lors du chargement");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchEvent();
    }
  }, [params.id, session, status, router]);

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <LoadingSpinner 
          size="lg" 
          message="Chargement du paiement..." 
          fullScreen 
        />
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <ErrorMessage 
          message={error || "Événement introuvable"}
          onBack={() => router.back()}
          fullScreen
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4" style={{ color: COLORS.violet }}>
              Finaliser votre réservation
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Vous êtes sur le point de réserver une place pour <span className="font-semibold" style={{ color: COLORS.rose }}>{event.title}</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="max-w-7xl mx-auto py-16 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Résumé de l'événement */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl p-8 border-2"
            style={{ borderColor: COLORS.lavande }}
          >
            <h2 className="text-2xl font-bold mb-6 font-display" style={{ color: COLORS.violet }}>
              🎫 Récapitulatif de votre réservation
            </h2>
            
            {/* Image de l'événement */}
            {event.image_path && (
              <div className="relative h-64 w-full mb-6 rounded-2xl overflow-hidden">
                <Image
                  src={event.image_path}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <EventBadge genre={event.genre} type={event.type} />
                </div>
              </div>
            )}
            
            <h3 className="font-bold text-xl mb-4" style={{ color: COLORS.violet }}>
              {event.title}
            </h3>
            
            {/* Informations de l'événement */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: `${COLORS.violet}10` }}>
                <span className="text-2xl">📅</span>
                <div>
                  <p className="font-medium" style={{ color: COLORS.violet }}>Date & Heure</p>
                  <p className="text-sm text-gray-600">{formatDate(event.start_date)}</p>
                </div>
              </div>

              {event.location && (
                <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: `${COLORS.rose}10` }}>
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="font-medium" style={{ color: COLORS.rose }}>Lieu</p>
                    <p className="text-sm text-gray-600">{event.location}</p>
                  </div>
                </div>
              )}

              {event.artist && (
                <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: `${COLORS.corail}10` }}>
                  <span className="text-2xl">🎤</span>
                  <div>
                    <p className="font-medium" style={{ color: COLORS.corail }}>Artiste</p>
                    <p className="text-sm text-gray-600">{event.artist.name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="border-t-2 pt-6" style={{ borderColor: COLORS.lavande }}>
              <div className="flex justify-between items-center p-4 rounded-xl" style={{ backgroundColor: `${COLORS.violet}15` }}>
                <span className="text-lg font-bold" style={{ color: COLORS.violet }}>Total à payer</span>
                <div className="text-right">
                  <span className="text-2xl font-bold" style={{ color: COLORS.violet }}>{event.price}€</span>
                  <p className="text-xs text-gray-500">TVA incluse</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Formulaire de paiement */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-3xl shadow-xl p-8 border-2"
            style={{ borderColor: COLORS.lavande }}
          >
            <h2 className="text-2xl font-bold mb-6 font-display" style={{ color: COLORS.violet }}>
              💳 Paiement sécurisé
            </h2>

            <div className="mb-6 p-4 rounded-lg border-2" style={{ backgroundColor: `${COLORS.roseClair}20`, borderColor: COLORS.roseClair }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🔒</span>
                <p className="text-sm font-medium" style={{ color: COLORS.violet }}>Paiement 100% sécurisé</p>
              </div>
              <p className="text-xs text-gray-600">
                Vos données bancaires sont cryptées et protégées par Stripe
              </p>
            </div>
            
            <Elements stripe={stripePromise}>
              <StripePayment 
                eventId={event.id}
                amount={event.price}
                onSuccess={() => {
                  router.push("/my-events?success=payment");
                }}
                onError={(error) => {
                  console.error("Erreur de paiement:", error);
                }}
              />
            </Elements>

            {/* Politique d'annulation */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-sm mb-2" style={{ color: COLORS.violet }}>Politique d'annulation</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Les billets peuvent être remboursés jusqu'à 48h avant l'événement. 
                Après validation du paiement, vous recevrez votre billet par email.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}