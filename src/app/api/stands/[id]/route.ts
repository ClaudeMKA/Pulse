import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "ID invalide" },
        { status: 400 }
      );
    }

    const stand = await (prisma as any).stands.findUnique({
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

    // Récupérer les détails de la location séparément
    let locationDetails = null;
    if (stand.location_id) {
      locationDetails = await (prisma as any).locations.findUnique({
        where: { id: stand.location_id },
        select: {
          id: true,
          name: true,
          address: true,
          latitude: true,
          longitude: true,
        },
      });
    }

    // Transformer le stand pour inclure les détails de la location
    const transformedStand = {
      ...stand,
      location: locationDetails?.name || null,
      latitude: locationDetails?.latitude || null,
      longitude: locationDetails?.longitude || null,
      location_address: locationDetails?.address || null,
    };

    return NextResponse.json(transformedStand);
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "ID invalide" },
        { status: 400 }
      );
    }

    const { name, description, location_id, event_id, type, opened_at, closed_at } = await request.json();

    if (!name || !description || !location_id || !type || !opened_at || !closed_at) {
      return NextResponse.json(
        { message: "Nom, description, lieu, type, heure d'ouverture et heure de fermeture sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que la location existe
    const locationExists = await (prisma as any).locations.findUnique({
      where: { id: parseInt(location_id) },
    });
    if (!locationExists) {
      return NextResponse.json(
        { message: "Le lieu spécifié n'existe pas" },
        { status: 400 }
      );
    }

    const updateData: Prisma.StandsUpdateInput = {
      name,
      description,
      location: {
        connect: { id: parseInt(location_id) }
      },
      type: type as "FOOD" | "ACTIVITE" | "TATOOS" | "SOUVENIRS" | "MERCH",
      opened_at: new Date(opened_at),
      closed_at: new Date(closed_at),
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

    const stand = await (prisma as any).stands.update({
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

    // Récupérer les détails de la location séparément
    let locationDetails = null;
    if (stand.location_id) {
      locationDetails = await (prisma as any).locations.findUnique({
        where: { id: stand.location_id },
        select: {
          id: true,
          name: true,
          address: true,
          latitude: true,
          longitude: true,
        },
      });
    }

    // Transformer le stand pour inclure les détails de la location
    const transformedStand = {
      ...stand,
      location: locationDetails?.name || null,
      latitude: locationDetails?.latitude || null,
      longitude: locationDetails?.longitude || null,
      location_address: locationDetails?.address || null,
    };

    return NextResponse.json(transformedStand);
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
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