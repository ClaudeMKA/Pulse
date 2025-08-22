import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const stands = await (prisma as any).stands.findMany({
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Récupérer tous les location_id uniques
    const locationIds = [...new Set(stands.map((stand: any) => stand.location_id).filter(Boolean))];
    
    // Récupérer les détails de toutes les locations
    let locationsMap = new Map();
    if (locationIds.length > 0) {
      const locations = await (prisma as any).$queryRaw`
        SELECT id, name, address, latitude, longitude 
        FROM locations 
        WHERE id = ANY(${locationIds})
      `;
      locations.forEach((loc: any) => {
        locationsMap.set(loc.id, loc);
      });
    }

    // Transformer les stands pour inclure les détails de la location
    const transformedStands = stands.map((stand: any) => {
      const locationDetails = locationsMap.get(stand.location_id);
      return {
        ...stand,
        location: locationDetails?.name || null,
        latitude: locationDetails?.latitude || null,
        longitude: locationDetails?.longitude || null,
        location_address: locationDetails?.address || null,
      };
    });

    return NextResponse.json(transformedStands);
  } catch (error) {
    console.error("Erreur lors de la récupération des stands:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération des stands" },
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

    const standData: Prisma.StandsCreateInput = {
      name,
      description,
      location: {
        connect: { id: parseInt(location_id) }
      },
      type: type as "FOOD" | "ACTIVITE" | "TATOOS" | "SOUVENIRS" | "MERCH",
      opened_at: new Date(opened_at),
      closed_at: new Date(closed_at),
      ...(event_id && {
        event: {
          connect: { id: parseInt(event_id) }
        }
      })
    };

    const stand = await (prisma as any).stands.create({
      data: standData,
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

    return NextResponse.json(transformedStand, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du stand:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création du stand" },
      { status: 500 }
    );
  }
}