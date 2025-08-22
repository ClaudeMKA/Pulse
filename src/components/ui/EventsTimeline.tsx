"use client";
import Link from "next/link";
import { COLORS } from "@/lib/theme";
import { format } from "date-fns";

export type TimelineEvent = {
  id: number;
  title: string;
  desc: string;
  start_date: Date;
  genre: string;
  type: string;
  location: string;
  artist: { name: string };
};

function formatDate(date: Date) {
  try {
    return format(date, 'd MMMM yyyy');
  } catch {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}

export default function EventsTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <section id="events" className="max-w-5xl mx-auto py-16 px-4">
      <h2 className="text-4xl font-bold mb-10 text-center font-display" style={{ color: COLORS.corail }}>
        Prochains événements
      </h2>
      <div className="relative border-l-4 border-[#FFD0E6] pl-8">
        {events.map((event) => (
          <div key={event.id} className="mb-12 flex items-center group">
            <div className="absolute -left-6 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-4" style={{ background: COLORS.violet, color: '#fff', borderColor: COLORS.roseClair }}>
              {event.artist.name.charAt(0)}
            </div>
            <div className="flex-1 bg-white rounded-2xl shadow-lg p-8 ml-6 border-2" style={{ borderColor: COLORS.lavande }}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <span className="text-lg font-semibold" style={{ color: COLORS.rose }}>{event.artist.name}</span>
                <span className="text-sm font-medium px-3 py-1 rounded-full ml-2" style={{ background: COLORS.roseClair, color: COLORS.corail }}>{event.type}</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 font-display" style={{ color: COLORS.violet }}>{event.title}</h3>
              <p className="text-gray-600 mb-2">{event.desc}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-2">
                <span><b>Date :</b> {formatDate(event.start_date)}</span>
                <span><b>Lieu :</b> {event.location}</span>
                <span><b>Genre :</b> {event.genre}</span>
              </div>
              <Link href={`/events/${event.id}`} className="inline-block mt-2 px-6 py-2 rounded-full text-white font-semibold shadow transition hover:scale-105" style={{ background: COLORS.corail }}>
                Voir l&apos;événement
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-12">
        <a href="#billetterie" className="px-10 py-4 rounded-full text-xl font-bold shadow-lg transition hover:scale-105" style={{ background: COLORS.violet, color: '#fff' }}>
          Acheter un billet
        </a>
      </div>
    </section>
  );
}


