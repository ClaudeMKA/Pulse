"use client";

import { useState, useEffect } from "react";
import {
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { COLORS } from "@/lib/theme";

interface StripePaymentProps {
  eventId: number;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function StripePayment({ eventId, amount, onSuccess, onError }: StripePaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      createPaymentIntent();
    }
  }, [eventId, isInitialized]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: eventId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } else {
        const error = await response.json();
        setMessage(error.message);
        onError(error.message);
      }
    } catch (error) {
      console.error("Erreur:", error);
      const errorMessage = "Erreur lors de l'initialisation du paiement";
      setMessage(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setMessage("");

    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });

    if (error) {
      setMessage(error.message || "Une erreur est survenue");
      onError(error.message || "Une erreur est survenue");
    } else {
      setMessage("Paiement réussi !");
      onSuccess();
    }

    setIsProcessing(false);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: COLORS.violet }}></div>
        <p className="text-gray-600">Initialisation du paiement...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Champ de carte de crédit */}
      <div className="space-y-2">
        <label className="block text-sm font-medium" style={{ color: COLORS.violet }}>
          Informations de carte bancaire
        </label>
        <div className="p-4 border-2 rounded-2xl transition-all duration-200 focus-within:border-violet-400" style={{ borderColor: COLORS.lavande, backgroundColor: `${COLORS.violet}05` }}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: COLORS.violet,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  '::placeholder': {
                    color: '#9CA3AF',
                  },
                  iconColor: COLORS.violet,
                },
                invalid: {
                  color: '#EF4444',
                  iconColor: '#EF4444',
                },
              },
            }}
          />
        </div>
        <p className="text-xs text-gray-500">
          Saisissez vos informations de carte. Elles sont sécurisées et cryptées.
        </p>
      </div>

      {/* Message d'erreur/succès */}
      {message && (
        <div className={`p-4 rounded-2xl text-sm border-2 ${
          message.includes("réussi")
            ? "border-green-200 text-green-800" 
            : "border-red-200 text-red-800"
        }`} style={{ 
          backgroundColor: message.includes("réussi") 
            ? `${COLORS.violet}10` 
            : '#FEF2F2' 
        }}>
          <div className="flex items-center gap-2">
            <span>{message.includes("réussi") ? "✅" : "⚠️"}</span>
            {message}
          </div>
        </div>
      )}

      {/* Bouton de paiement */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full flex justify-center items-center px-8 py-4 rounded-2xl shadow-lg text-lg font-bold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        style={{ backgroundColor: COLORS.violet }}
      >
        {isProcessing ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            Traitement en cours...
          </div>
        ) : (
          <>
            <span className="mr-2">💳</span>
            Payer {amount.toFixed(2)}€
          </>
        )}
      </button>

      {/* Informations de sécurité */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-sm" style={{ color: COLORS.violet }}>
          <span>🛡️</span>
          <span className="font-medium">Protection 3D Secure activée</span>
        </div>
        <p className="text-xs text-gray-500">
          Toutes les transactions sont sécurisées par Stripe et conformes aux standards PCI DSS
        </p>
      </div>
    </form>
  );
}