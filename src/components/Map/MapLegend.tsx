import { eventTypeIcons } from "./types";

export function MapLegend() {
  return (
    <div className="absolute bottom-4 right-4 z-10 bg-white p-3 rounded-lg shadow-md">
      <h4 className="font-semibold text-sm mb-2">Légende</h4>
      <div className="space-y-1">
        {Object.entries(eventTypeIcons).map(([type, icon]) => (
          <div key={type} className="flex items-center space-x-2">
            <span className="text-lg">{icon}</span>
            <span className="text-xs capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
