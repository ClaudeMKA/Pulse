import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// S'inscrire à un événement
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: "Vous devez être connecté pour vous inscrire" },
        { status: 401 }
      );
    }

    const { id: paramId } = await params;
    const eventId = parseInt(paramId);
    const userId = parseInt(session.user.id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { message: "ID d'événement invalide" },
        { status: 400 }
      );
    }

    // Vérifier que l'événement existe et est dans le futur
    const event = await prisma.events.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { message: "Événement introuvable" },
        { status: 404 }
      );
    }

    if (new Date(event.start_date) < new Date()) {
      return NextResponse.json(
        { message: "Vous ne pouvez pas vous inscrire à un événement passé" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur est déjà inscrit
    const existingParticipation = await prisma.eventParticipants.findUnique({
      where: {
        user_id_event_id: {
          user_id: userId,
          event_id: eventId,
        },
      },
    });

    if (existingParticipation) {
      return NextResponse.json(
        { message: "Vous êtes déjà inscrit à cet événement" },
        { status: 400 }
      );
    }

    // Créer l'inscription
    const participation = await prisma.eventParticipants.create({
      data: {
        user_id: userId,
        event_id: eventId,
        payment_status: event.price > 0 ? "PENDING" : "PAID", // Gratuit = directement payé
        amount_paid: event.price,
      },
      include: {
        event: {
          select: {
            title: true,
            start_date: true,
            location: true,
          },
        },
      },
    });

    // Créer une notification de confirmation
    await prisma.notifications.create({
      data: {
        user_id: userId,
        title: "Inscription confirmée",
        message: `Vous êtes inscrit à l'événement "${participation.event.title}"`,
        type: "SUCCESS",
      },
    });

    return NextResponse.json({
      message: "Inscription réussie",
      participation,
    }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { message: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}

// Se désinscrire d'un événement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: "Vous devez être connecté pour vous désinscrire" },
        { status: 401 }
      );
    }

    const { id: paramId } = await params;
    const eventId = parseInt(paramId);
    const userId = parseInt(session.user.id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { message: "ID d'événement invalide" },
        { status: 400 }
      );
    }

    // Vérifier que l'inscription existe
    const participation = await prisma.eventParticipants.findUnique({
      where: {
        user_id_event_id: {
          user_id: userId,
          event_id: eventId,
        },
      },
      include: {
        event: {
          select: {
            title: true,
            start_date: true,
          },
        },
      },
    });

    if (!participation) {
      return NextResponse.json(
        { message: "Vous n'êtes pas inscrit à cet événement" },
        { status: 404 }
      );
    }

    // Vérifier que l'événement n'est pas déjà passé
    if (new Date(participation.event.start_date) < new Date()) {
      return NextResponse.json(
        { message: "Vous ne pouvez pas vous désinscrire d'un événement passé" },
        { status: 400 }
      );
    }

    // Supprimer l'inscription
    await prisma.eventParticipants.delete({
      where: {
        id: participation.id,
      },
    });

    // Créer une notification de confirmation
    await prisma.notifications.create({
      data: {
        user_id: userId,
        title: "Désinscription confirmée",
        message: `Vous êtes désinscrit de l'événement "${participation.event.title}"`,
        type: "INFO",
      },
    });

    return NextResponse.json({
      message: "Désinscription réussie",
    });
  } catch (error) {
    console.error("Erreur lors de la désinscription:", error);
    return NextResponse.json(
      { message: "Erreur lors de la désinscription" },
      { status: 500 }
    );
  }
}

// Obtenir le statut d'inscription de l'utilisateur
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({
        isRegistered: false,
        requiresAuth: true,
      });
    }

    const { id: paramId } = await params;
    const eventId = parseInt(paramId);
    const userId = parseInt(session.user.id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { message: "ID d'événement invalide" },
        { status: 400 }
      );
    }

    const participation = await prisma.eventParticipants.findUnique({
      where: {
        user_id_event_id: {
          user_id: userId,
          event_id: eventId,
        },
      },
    });

    return NextResponse.json({
      isRegistered: !!participation,
      requiresAuth: false,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification:", error);
    return NextResponse.json(
      { message: "Erreur lors de la vérification" },
      { status: 500 }
    );
  }
}