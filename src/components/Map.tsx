"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { EventType, EventMarker, eventIcons } from "@/types/map";
import { MapFilters } from "./Map/MapFilters";
import { COLORS } from "@/lib/theme";

export default function Map() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  
  const [events, setEvents] = useState<EventMarker[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<EventType>>(
    new Set(['scene', 'food', 'bar', 'boutique', 'info', 'toilettes'] as EventType[])
  );
  const [loading, setLoading] = useState(true);

  // Charger les events depuis ton API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/events?upcoming=true");
        if (!res.ok) throw new Error("Erreur lors du chargement des événements");

        const { events: fetchedEvents } = await res.json();

        // Adapter les données API au format EventMarker attendu
        const formatted: EventMarker[] = fetchedEvents
          .filter((e: any) => e.latitude !== null && e.longitude !== null) // éviter les null
          .map((e: any) => ({
            id: String(e.id),
            coordinates: [e.longitude, e.latitude], // ⚠️ attention : [lng, lat]
            title: e.title,
            description: e.desc,
            type: mapApiTypeToMarkerType(e.type), // conversion si besoin
          }));

        setEvents(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Mapper les types API -> types de ton EventMarker
  const mapApiTypeToMarkerType = (type: string): EventType => {
    switch (type) {
      case "CONCERT":
      case "FESTIVAL":
      case "SHOWCASE":
        return "scene";
      case "OTHER":
        return "info";
      default:
        return "info";
    }
  };

  // Initialiser la carte
  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapInstance.current) return;

    mapInstance.current = new maplibregl.Map({
      container: mapContainer.current,
      style:
        "https://api.jawg.io/styles/jawg-lagoon.json?access-token=oo6UC2UPT5pq9FDfRyNVOuE6oQnM9KYJLFI1M5gkoPqOgvkqkONPWpqyI94AOj2i",
      center: [1.0993, 49.4431], // Rouen
      zoom: 14,
    });

    mapInstance.current.addControl(new maplibregl.NavigationControl());
  }, []);

  // Filtrer les events
  const filteredEvents = events.filter((event) => {
    if (!activeFilters.has(event.type)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(q) ||
        event.description.toLowerCase().includes(q) ||
        event.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Gérer l’ajout des marqueurs
  useEffect(() => {
    if (!mapInstance.current) return;

    // Supprimer les anciens
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Ajouter les nouveaux
    filteredEvents.forEach((event) => {
      const el = document.createElement("div");
      el.innerHTML = `
        <div style="
          background: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          border: 2px solid #4A90E2;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          cursor: pointer;
          transform: translate(-50%, -50%);
        ">
          ${eventIcons[event.type] || "📍"}
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px; max-width: 250px;">
          <h3 style="margin: 0 0 5px 0; font-weight: bold; font-size: 14px;">
            ${event.title}
          </h3>
          <p style="margin: 0; color: #666; font-size: 12px;">
            ${event.description}
          </p>
          <a 
            href="/events/${event.id}" 
            style="
              display: inline-block;
              margin-top: 8px;
              padding: 4px 8px;
              background: #4A90E2;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              font-size: 12px;
              text-align: center;
            "
          >
            Voir les détails
          </a>
        </div>
      `);

      const marker = new maplibregl.Marker({
        element: el,
        anchor: "bottom",
      })
        .setLngLat(event.coordinates as [number, number])
        .setPopup(popup)
        .addTo(mapInstance.current!);

      markersRef.current.push(marker);
    });

    // Ajuster la vue
    if (filteredEvents.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      filteredEvents.forEach((e) => bounds.extend(e.coordinates as [number, number]));
      if (!bounds.isEmpty()) {
        mapInstance.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
        });
      }
    }
  }, [filteredEvents]);

  // Handlers
  const handleFilterChange = useCallback((type: EventType, isActive: boolean) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      isActive ? next.add(type) : next.delete(type);
      return next;
    });
  }, []);

  const handleSearch = useCallback((query: string) => setSearchQuery(query), []);

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden">
      <h2 className="text-4xl font-bold mb-20 text-center" style={{ color: COLORS.rose }}>Tous les lieux, une seule carte</h2>
      <MapFilters
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
          <p>Chargement des événements...</p>
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full rounded-xl" />
    </div>
  );
}
