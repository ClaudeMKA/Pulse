import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: "Vous devez être connecté pour effectuer un paiement" },
        { status: 401 }
      );
    }

    const { eventId } = await request.json();
    const userId = parseInt(session.user.id);

    if (!eventId || isNaN(eventId)) {
      return NextResponse.json(
        { message: "ID d'événement invalide" },
        { status: 400 }
      );
    }

    // Vérifier que l'événement existe
    const event = await prisma.events.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { message: "Événement introuvable" },
        { status: 404 }
      );
    }

    // Vérifier que l'événement est payant
    if (event.price <= 0) {
      return NextResponse.json(
        { message: "Cet événement est gratuit" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur n'est pas déjà inscrit
    const existingParticipation = await prisma.eventParticipants.findUnique({
      where: {
        user_id_event_id: {
          user_id: userId,
          event_id: eventId,
        },
      },
    });

    if (existingParticipation) {
      if (existingParticipation.payment_status === "PAID") {
        return NextResponse.json(
          { message: "Vous êtes déjà inscrit à cet événement" },
          { status: 400 }
        );
      }
      
      // Si le paiement est en attente, on peut créer un nouveau PaymentIntent
      if (existingParticipation.payment_status === "PENDING") {
        // Créer un nouveau PaymentIntent pour remplacer l'ancien
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(event.price * 100),
          currency: event.currency.toLowerCase(),
          metadata: {
            eventId: eventId.toString(),
            userId: userId.toString(),
            eventTitle: event.title,
          },
        });

        // Mettre à jour l'inscription existante avec le nouveau PaymentIntent
        await prisma.eventParticipants.update({
          where: { id: existingParticipation.id },
          data: {
            payment_intent_id: paymentIntent.id,
            amount_paid: event.price,
          },
        });

        return NextResponse.json({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        });
      }
    }

    // Créer le PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(event.price * 100), // Stripe utilise les centimes
      currency: event.currency.toLowerCase(),
      metadata: {
        eventId: eventId.toString(),
        userId: userId.toString(),
        eventTitle: event.title,
      },
    });

    // Créer l'inscription avec le statut PENDING
    await prisma.eventParticipants.create({
      data: {
        user_id: userId,
        event_id: eventId,
        payment_status: "PENDING",
        payment_intent_id: paymentIntent.id,
        amount_paid: event.price,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Erreur lors de la création du PaymentIntent:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}