"use client";

import { EventType } from "@/types/map";

interface MapFiltersProps {
  activeFilters: Set<EventType>;
  onFilterChange: (type: EventType, isActive: boolean) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
}

export function MapFilters({ 
  activeFilters, 
  onFilterChange, 
  onSearch, 
  searchQuery 
}: MapFiltersProps) {
  const eventTypes: { value: EventType; label: string; icon: string }[] = [
    { value: 'scene', label: 'Scènes', icon: '🎤' },
    { value: 'food', label: 'Restauration', icon: '🍔' },
    { value: 'toilettes', label: 'Sanitaires', icon: '🚻' },
    { value: 'bar', label: 'Bars', icon: '🍻' },
    { value: 'boutique', label: 'Boutiques', icon: '🛍️' },
    { value: 'info', label: 'Points info', icon: 'ℹ️' }
  ];

  return (
    <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-xs w-full border border-gray-100">
      <h3 className="font-bold mb-3 text-gray-800">Filtrer les événements</h3>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher..."
          className="w-full p-2 border rounded mb-4 text-sm"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
        
        <div className="space-y-2">
          {eventTypes.map(({ value, label, icon }) => (
            <label key={value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full text-lg ${activeFilters.has(value) ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                {icon}
              </div>
              <span className="text-sm font-medium text-gray-700">{label}</span>
              <input
                type="checkbox"
                checked={activeFilters.has(value)}
                onChange={(e) => onFilterChange(value, e.target.checked)}
                className="sr-only"
              />
              <div className={`ml-auto w-5 h-5 rounded border ${activeFilters.has(value) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                {activeFilters.has(value) && (
                  <svg className="w-4 h-4 m-0.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
