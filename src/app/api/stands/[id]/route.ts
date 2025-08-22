import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "ID invalide" },
        { status: 400 }
      );
    }

    const stand = await prisma.stands.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!stand) {
      return NextResponse.json(
        { message: "Stand non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(stand);
  } catch (error) {
    console.error("Erreur lors de la récupération du stand:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération du stand" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "ID invalide" },
        { status: 400 }
      );
    }

    const { name, description, location, event_id } = await request.json();

    if (!name || !description || !location) {
      return NextResponse.json(
        { message: "Nom, description et localisation sont requis" },
        { status: 400 }
      );
    }

    const updateData: Prisma.StandsUpdateInput = {
      name,
      description,
      location,
      ...(event_id ? {
        event: {
          connect: { id: parseInt(event_id) }
        }
      } : {
        event: {
          disconnect: true
        }
      })
    };

    const stand = await prisma.stands.update({
      where: { id },
      data: updateData,
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(stand);
  } catch (error: any) {
    console.error("Erreur lors de la modification du stand:", error);
    if (error?.code === "P2025") {
      return NextResponse.json(
        { message: "Stand non trouvé" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Erreur lors de la modification du stand" },
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
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "ID invalide" },
        { status: 400 }
      );
    }

    await prisma.stands.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Stand supprimé avec succès" });
  } catch (error: any) {
    console.error("Erreur lors de la suppression du stand:", error);
    if (error?.code === "P2025") {
      return NextResponse.json(
        { message: "Stand non trouvé" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Erreur lors de la suppression du stand" },
      { status: 500 }
    );
  }
}