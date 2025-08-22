"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { EventType, EventMarker, eventIcons } from "@/types/map";
import Header from "@/components/ui/Header";
import { COLORS } from "@/lib/theme";
import { motion } from "framer-motion";

// Interface étendue pour les événements avec genre et type
interface ExtendedEventMarker extends EventMarker {
  genre?: string;
  eventType?: string;
}

export default function CartePage() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  
  const [events, setEvents] = useState<ExtendedEventMarker[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([
    'CONCERT', 'FESTIVAL', 'SHOWCASE'
  ]);
  const [loading, setLoading] = useState(true);


  // Charger les events depuis l'API
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

  // Mapper les types API -> types de markers
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
      style: "https://api.jawg.io/styles/jawg-lagoon.json?access-token=oo6UC2UPT5pq9FDfRyNVOuE6oQnM9KYJLFI1M5gkoPqOgvkqkONPWpqyI94AOj2i",
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

  // Gérer l'ajout des marqueurs
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
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          border: 3px solid ${COLORS.violet};
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          cursor: pointer;
          transform: translate(-50%, -50%);
          transition: all 0.2s ease;
        ">
          ${eventIcons[event.type] || "📍"}
        </div>
      `;

      // Animation au survol
      el.addEventListener('mouseenter', () => {
        (el.firstElementChild as HTMLElement).style.transform = 'translate(-50%, -50%) scale(1.1)';
      });
      
      el.addEventListener('mouseleave', () => {
        (el.firstElementChild as HTMLElement).style.transform = 'translate(-50%, -50%) scale(1)';
      });

      const popup = new maplibregl.Popup({ 
        offset: 25,
        className: 'custom-popup'
      }).setHTML(`
        <div style="padding: 12px; max-width: 280px; font-family: system-ui;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px; color: ${COLORS.violet};">
            ${event.title}
          </h3>
          <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; line-height: 1.4;">
            ${event.description || 'Aucune description disponible'}
          </p>
          <div style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: ${COLORS.violet};
            color: white;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
          ">
            ${eventIcons[event.type]} ${event.type.charAt(0).toUpperCase() + event.type.slice(1)}
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({
        element: el,
        anchor: "center",
      })
        .setLngLat(event.coordinates as [number, number])
        .setPopup(popup)
        .addTo(mapInstance.current!);



      markersRef.current.push(marker);
    });

    // Ajuster la vue si des événements sont visibles
    if (filteredEvents.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      filteredEvents.forEach((e) => bounds.extend(e.coordinates as [number, number]));
      if (!bounds.isEmpty()) {
        mapInstance.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 16
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
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="pt-20 pb-16 px-4 text-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${COLORS.violet}20, ${COLORS.rose}20)` }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          <h1 
            className="text-4xl md:text-6xl font-bold mb-4 font-display" 
            style={{ color: COLORS.violet }}
          >
            Carte Interactive
          </h1>
                      <p className="text-lg md:text-xl text-gray-600 mb-6">
              Explorez tous les lieux du festival en un coup d&apos;œil
            </p>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              🎤 <span>Scènes</span>
            </span>
            <span className="flex items-center gap-2">
              🍔 <span>Restauration</span>
            </span>
            <span className="flex items-center gap-2">
              🍻 <span>Bars</span>
            </span>
            <span className="flex items-center gap-2">
              🛍️ <span>Boutiques</span>
            </span>
          </div>
        </motion.div>
        
        {/* Élément décoratif */}
        <div 
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: COLORS.rose }}
        ></div>
      </section>

      {/* Filtres horizontaux */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2"
          style={{ borderColor: COLORS.lavande }}
        >
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
            {/* Titre et recherche */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: COLORS.violet }}>
                🎯 <span>Filtrer les lieux</span>
              </h3>
              <input
                type="text"
                placeholder="🔍 Rechercher un lieu..."
                className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm focus:border-violet-400 focus:outline-none transition-colors text-gray-800 bg-white placeholder-gray-500"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            {/* Filtres simples */}
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Filtres disponibles</h4>
              <div className="flex flex-wrap gap-2">
                {/* Liste simple des types d'événements */}
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
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                        isActive
                          ? 'bg-violet-100 border-violet-400 text-violet-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>{filter.icon}</span>
                      <span className="font-medium">{filter.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Compteur de résultats */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {filteredEvents.length} lieu{filteredEvents.length > 1 ? 'x' : ''} affiché{filteredEvents.length > 1 ? 's' : ''} sur {events.length}
              </span>
              <span className="text-gray-500">
                {activeFilters.length} filtre{activeFilters.length > 1 ? 's' : ''} actif{activeFilters.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Carte principale */}
      <section className="relative max-w-7xl mx-auto px-4 pb-16">
        <div className="relative w-full h-[calc(100vh-400px)] min-h-[500px] rounded-2xl overflow-hidden shadow-lg border-2" style={{ borderColor: COLORS.lavande }}>

          {/* Indicateur de chargement */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
              <div className="text-center">
                <div 
                  className="animate-spin rounded-full h-12 w-12 border-b-4 mx-auto mb-4" 
                  style={{ borderColor: COLORS.violet }}
                ></div>
                <p className="text-gray-600 font-medium">Chargement de la carte...</p>
              </div>
            </div>
          )}

          {/* Conteneur de la carte */}
          <div ref={mapContainer} className="w-full h-full" />

          {/* Légende */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border"
            style={{ borderColor: COLORS.lavande }}
          >
            <h4 className="font-bold text-sm mb-3" style={{ color: COLORS.violet }}>
              Légende
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(eventIcons).map(([type, icon]) => (
                <div key={type} className="flex items-center gap-2">
                  <span className="text-base">{icon}</span>
                  <span className="capitalize text-gray-700">{type}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-10 px-4 text-center" style={{ background: COLORS.violet }}>
        <p className="text-white font-semibold">
          &copy; {new Date().getFullYear()} Pulse Festival — Tous droits réservés.
        </p>
      </footer>

      {/* Styles CSS pour la popup personnalisée */}
      <style jsx global>{`
        .custom-popup .maplibregl-popup-content {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          border: 2px solid ${COLORS.lavande};
        }
        
        .custom-popup .maplibregl-popup-tip {
          border-top-color: ${COLORS.lavande};
        }
        
        .maplibregl-popup-close-button {
          color: ${COLORS.violet};
          font-size: 20px;
          font-weight: bold;
        }
        
        .maplibregl-popup-close-button:hover {
          color: ${COLORS.rose};
        }
      `}</style>
    </main>
  );
}
