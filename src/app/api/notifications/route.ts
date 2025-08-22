import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Non authentifié" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    
    // Si un admin demande toutes les notifications ou celles d'un utilisateur spécifique
    if (session.user.role === "ADMIN") {
      const notifications = await prisma.notifications.findMany({
        where: userId ? { user_id: parseInt(userId) } : {},
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });
      return NextResponse.json(notifications);
    }
    
    // Pour un utilisateur normal, seulement ses notifications
    const notifications = await prisma.notifications.findMany({
      where: { user_id: parseInt(session.user.id) },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const { title, message, type, user_id, send_to_all } = await request.json();

    if (!title || !message || !type) {
      return NextResponse.json(
        { message: "Titre, message et type sont requis" },
        { status: 400 }
      );
    }

    // Validation du type
    const validTypes = ['INFO', 'WARNING', 'SUCCESS', 'ERROR'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { message: "Type de notification invalide" },
        { status: 400 }
      );
    }

    // Si envoyer à tous les utilisateurs
    if (send_to_all) {
      const users = await prisma.users.findMany({
        select: { id: true }
      });

      const notifications = await Promise.all(
        users.map(user => 
          prisma.notifications.create({
            data: {
              title,
              message,
              type,
              user_id: user.id,
            },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                },
              },
            },
          })
        )
      );

      return NextResponse.json(notifications, { status: 201 });
    }
    
    // Si envoyer à un utilisateur spécifique
    if (!user_id) {
      return NextResponse.json(
        { message: "ID utilisateur requis" },
        { status: 400 }
      );
    }

    const notification = await prisma.notifications.create({
      data: {
        title,
        message,
        type,
        user_id: parseInt(user_id),
      },
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

    return NextResponse.json(notification, { status: 201 });
  } catch (error: any) {
    console.error("Erreur lors de la création de la notification:", error);
    if (error?.code === "P2003") {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Erreur lors de la création de la notification" },
      { status: 500 }
    );
  }
}