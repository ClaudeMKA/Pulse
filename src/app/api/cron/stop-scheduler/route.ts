import { NextRequest, NextResponse } from "next/server";
import { NotificationScheduler } from "@/lib/notificationScheduler";
import { setSchedulerStatus } from "../status/route";
import { requireAdminAuth } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  // Vérifier l'authentification admin
  const { error, session } = await requireAdminAuth(request);
  if (error) return error;
  try {
    NotificationScheduler.stopScheduler();
    setSchedulerStatus("Arrêté");
    return NextResponse.json({ message: "Planificateur arrêté" });
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur lors de l'arrêt du planificateur" },
      { status: 500 }
    );
  }
}
