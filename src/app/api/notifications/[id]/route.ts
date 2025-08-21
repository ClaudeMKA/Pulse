import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Non authentifié" },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "ID invalide" },
        { status: 400 }
      );
    }

    const { read } = await request.json();

    // Vérifier que l'utilisateur peut modifier cette notification
    const notification = await prisma.notifications.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json(
        { message: "Notification non trouvée" },
        { status: 404 }
      );
    }

    // Seul le propriétaire de la notification ou un admin peut la modifier
    if (notification.user_id !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const updatedNotification = await prisma.notifications.update({
      where: { id },
      data: { read: Boolean(read) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedNotification);
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour de la notification:", error);
    if (error?.code === "P2025") {
      return NextResponse.json(
        { message: "Notification non trouvée" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour de la notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Non authentifié" },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "ID invalide" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur peut supprimer cette notification
    const notification = await prisma.notifications.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json(
        { message: "Notification non trouvée" },
        { status: 404 }
      );
    }

    // Seul le propriétaire de la notification ou un admin peut la supprimer
    if (notification.user_id !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      );
    }

    await prisma.notifications.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Notification supprimée avec succès" });
  } catch (error: any) {
    console.error("Erreur lors de la suppression de la notification:", error);
    if (error?.code === "P2025") {
      return NextResponse.json(
        { message: "Notification non trouvée" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Erreur lors de la suppression de la notification" },
      { status: 500 }
    );
  }
}