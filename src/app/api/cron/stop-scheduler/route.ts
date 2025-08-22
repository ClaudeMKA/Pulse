import { NextResponse } from "next/server";
import { NotificationScheduler } from "@/lib/notificationScheduler";
import { setSchedulerStatus } from "../status/route";

export async function POST() {
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
