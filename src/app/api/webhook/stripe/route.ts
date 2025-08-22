import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { message: "No signature found" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // En développement, on peut désactiver la vérification du webhook
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      // Mode développement - parser directement l'événement
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { message: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Mettre à jour le statut de paiement
        await prisma.eventParticipants.updateMany({
          where: {
            payment_intent_id: paymentIntent.id,
          },
          data: {
            payment_status: "PAID",
          },
        });

        // Créer une notification de confirmation
        const participation = await prisma.eventParticipants.findFirst({
          where: {
            payment_intent_id: paymentIntent.id,
          },
          include: {
            event: true,
            user: true,
          },
        });

        if (participation) {
          await prisma.notifications.create({
            data: {
              user_id: participation.user_id,
              title: "Paiement confirmé",
              message: `Votre paiement pour "${participation.event.title}" a été confirmé. Vous êtes maintenant inscrit !`,
              type: "SUCCESS",
            },
          });
        }

        console.log(`Paiement réussi pour PaymentIntent: ${paymentIntent.id}`);
        break;

      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Mettre à jour le statut de paiement
        await prisma.eventParticipants.updateMany({
          where: {
            payment_intent_id: failedPaymentIntent.id,
          },
          data: {
            payment_status: "FAILED",
          },
        });

        // Créer une notification d'échec
        const failedParticipation = await prisma.eventParticipants.findFirst({
          where: {
            payment_intent_id: failedPaymentIntent.id,
          },
          include: {
            event: true,
            user: true,
          },
        });

        if (failedParticipation) {
          await prisma.notifications.create({
            data: {
              user_id: failedParticipation.user_id,
              title: "Échec du paiement",
              message: `Le paiement pour "${failedParticipation.event.title}" a échoué. Veuillez réessayer.`,
              type: "ERROR",
            },
          });
        }

        console.log(`Paiement échoué pour PaymentIntent: ${failedPaymentIntent.id}`);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erreur lors du traitement du webhook:", error);
    return NextResponse.json(
      { message: "Erreur lors du traitement du webhook" },
      { status: 500 }
    );
  }
}