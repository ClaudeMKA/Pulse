import { NextResponse } from "next/server";

// Variable globale pour tracker le statut
let schedulerStatus = "Arrêté";

export function setSchedulerStatus(status: string) {
  schedulerStatus = status;
}

export async function GET() {
  return NextResponse.json({ 
    status: schedulerStatus,
    timestamp: new Date().toISOString()
  });
}
