"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { EventType, EventMarker, eventIcons } from "@/types/map";
import { COLORS } from "@/lib/theme";

// Interface étendue pour les événements avec genre et type
interface ExtendedEventMarker extends EventMarker {
  genre?: string;
  eventType?: string;
}

export default function Map() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  
  const [events, setEvents] = useState<ExtendedEventMarker[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([
    'CONCERT', 'FESTIVAL', 'SHOWCASE'
  ]);
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
        const formatted: ExtendedEventMarker[] = fetchedEvents
          .filter((e: { latitude: number | null; longitude: number | null }) => e.latitude !== null && e.longitude !== null)
          .map((e: { id: number; longitude: number; latitude: number; title: string; desc: string; type: string; genre: string }) => ({
            id: String(e.id),
            coordinates: [e.longitude, e.latitude],
            title: e.title,
            description: e.desc,
            type: mapApiTypeToMarkerType(e.type),
            genre: e.genre,
            eventType: e.type,
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

  // Filtrer les events - logique simple
  const filteredEvents = events.filter((event) => {
    // On ne montre que les scènes
    if (event.type !== 'scene') return false;
    
    // Si aucun filtre actif, montrer tout
    if (activeFilters.length === 0) return true;
    
    // Vérifier si l'événement correspond aux filtres de type
    const matchesType = event.eventType && activeFilters.includes(event.eventType);
    
    // L'événement doit correspondre au filtre de type
    if (!matchesType) return false;
    
    // Filtrer par recherche si il y en a une
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return event.title.toLowerCase().includes(search) ||
             event.description?.toLowerCase().includes(search);
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

  // Fonctions simples pour gérer les filtres
  const toggleFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      // Enlever le filtre
      setActiveFilters(activeFilters.filter(f => f !== filter));
    } else {
      // Ajouter le filtre
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const handleSearch = (query: string) => setSearchQuery(query);

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden">      
      {/* Filtres simples en position absolue */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border-2 max-w-xs w-full" style={{ borderColor: COLORS.lavande }}>
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: COLORS.violet }}>
          🎯 <span>Filtres</span>
        </h3>
        
        {/* Recherche */}
        <input
          type="text"
          placeholder="🔍 Rechercher..."
          className="w-full p-2 border-2 border-gray-200 rounded-lg mb-3 text-sm focus:border-violet-400 focus:outline-none transition-colors text-gray-800 bg-white placeholder-gray-500"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        
        {/* Filtres */}
        <div className="space-y-2">
          {[
            { name: 'CONCERT', icon: '🎤' },
            { name: 'FESTIVAL', icon: '🎪' },
            { name: 'SHOWCASE', icon: '✨' }
          ].map((filter) => {
            const isActive = activeFilters.includes(filter.name);
            return (
              <button
                key={filter.name}
                onClick={() => toggleFilter(filter.name)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg border-2 transition-all text-sm ${
                  isActive
                    ? 'bg-violet-100 border-violet-400 text-violet-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{filter.icon}</span>
                <span className="font-medium">{filter.name}</span>
              </button>
            );
          })}
        </div>
        
        {/* Compteur */}
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500 text-center">
          {filteredEvents.length} lieu{filteredEvents.length > 1 ? 'x' : ''} affiché{filteredEvents.length > 1 ? 's' : ''}
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
          <p>Chargement des événements...</p>
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full rounded-xl" />
    </div>
  );
}
