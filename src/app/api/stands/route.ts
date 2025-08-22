import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const stands = await prisma.stands.findMany({
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

    return NextResponse.json(stands);
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

    const { name, description, location, event_id } = await request.json();

    if (!name || !description || !location) {
      return NextResponse.json(
        { message: "Nom, description et localisation sont requis" },
        { status: 400 }
      );
    }

    const standData: Prisma.StandsCreateInput = {
      name,
      description,
      location,
      ...(event_id && {
        event: {
          connect: { id: parseInt(event_id) }
        }
      })
    };

    const stand = await prisma.stands.create({
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

    return NextResponse.json(stand, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du stand:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création du stand" },
      { status: 500 }
    );
  }
}