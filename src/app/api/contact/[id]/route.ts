import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const { read } = await request.json();

    const message = await prisma.contactMessages.update({
      where: { id },
      data: { read: Boolean(read) },
    });

    return NextResponse.json(message);
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour du message:", error);
    if (error?.code === "P2025") {
      return NextResponse.json(
        { message: "Message non trouvé" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour du message" },
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

    await prisma.contactMessages.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Message supprimé avec succès" });
  } catch (error: any) {
    console.error("Erreur lors de la suppression du message:", error);
    if (error?.code === "P2025") {
      return NextResponse.json(
        { message: "Message non trouvé" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Erreur lors de la suppression du message" },
      { status: 500 }
    );
  }
}