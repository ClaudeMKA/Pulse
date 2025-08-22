"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { COLORS } from "@/lib/theme";

interface EventLocationMapProps {
  latitude: number;
  longitude: number;
  title: string;
  location?: string | null;
  className?: string;
}

export default function EventLocationMap({ 
  latitude, 
  longitude, 
  title, 
  location,
  className = "" 
}: EventLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapInstance.current) return;

    // Initialiser la carte
    mapInstance.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://api.jawg.io/styles/jawg-lagoon.json?access-token=oo6UC2UPT5pq9FDfRyNVOuE6oQnM9KYJLFI1M5gkoPqOgvkqkONPWpqyI94AOj2i",
      center: [longitude, latitude],
      zoom: 15,
    });

    // Ajouter les contrôles de navigation
    mapInstance.current.addControl(new maplibregl.NavigationControl());

    // Créer un marqueur personnalisé
    const markerElement = document.createElement("div");
    markerElement.innerHTML = `
      <div style="
        background: ${COLORS.violet};
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <div style="
          transform: rotate(45deg);
          font-size: 18px;
          color: white;
        ">📍</div>
      </div>
    `;

    // Créer la popup
    const popup = new maplibregl.Popup({ 
      offset: 25,
      className: 'event-popup'
    }).setHTML(`
      <div style="padding: 12px; max-width: 280px; font-family: system-ui;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px; color: ${COLORS.violet};">
          ${title}
        </h3>
        ${location ? `
          <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; line-height: 1.4;">
            📍 ${location}
          </p>
        ` : ''}
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
          🎪 Événement
        </div>
      </div>
    `);

    // Ajouter le marqueur à la carte
    markerRef.current = new maplibregl.Marker({
      element: markerElement,
      anchor: "bottom",
    })
      .setLngLat([longitude, latitude])
      .setPopup(popup)
      .addTo(mapInstance.current);

    // Nettoyer lors du démontage
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
    };
  }, [latitude, longitude, title, location]);

  return (
    <>
      <div 
        ref={mapContainer} 
        className={`w-full h-full ${className}`}
      />
      
      {/* Styles CSS pour la popup personnalisée */}
      <style jsx global>{`
        .event-popup .maplibregl-popup-content {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          border: 2px solid ${COLORS.lavande};
        }
        
        .event-popup .maplibregl-popup-tip {
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
    </>
  );
}
