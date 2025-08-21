import { LngLatLike } from 'maplibre-gl';

export type EventType = 'scene' | 'food' | 'toilettes' | 'bar' | 'boutique' | 'info';

export interface EventMarker {
  id: string;
  coordinates: LngLatLike;
  title: string;
  type: EventType;
  description?: string;
}

export const eventIcons: Record<EventType, string> = {
  scene: '🎤',
  food: '🍔',
  toilettes: '🚻',
  bar: '🍻',
  boutique: '🛍️',
  info: 'ℹ️'
};

export const eventLabels: Record<EventType, string> = {
  scene: 'Scènes',
  food: 'Restauration',
  toilettes: 'Toilettes',
  bar: 'Bars',
  boutique: 'Boutiques',
  info: 'Infos'
};

export const eventMarkers: EventMarker[] = [
  {
    id: '1',
    coordinates: [1.0993, 49.4431],
    title: 'Scène principale',
    type: 'scene',
    description: 'Scène principale du festival avec vue imprenable'
  },
  {
    id: '2',
    coordinates: [1.094, 49.445],
    title: 'Food Truck',
    type: 'food',
    description: 'Découvrez nos délicieuses spécialités culinaires'
  },
  {
    id: '3',
    coordinates: [1.102, 49.441],
    title: 'Toilettes',
    type: 'toilettes',
    description: 'Toilettes publiques accessibles PMR'
  },
  {
    id: '4',
    coordinates: [1.098, 49.442],
    title: 'Bar à cocktails',
    type: 'bar',
    description: 'Dégustez nos cocktails maison'
  },
  {
    id: '5',
    coordinates: [1.101, 49.444],
    title: 'Boutique officielle',
    type: 'boutique',
    description: 'Goodies et souvenirs du festival'
  },
  {
    id: '6',
    coordinates: [1.097, 49.443],
    title: 'Point info',
    type: 'info',
    description: 'Renseignements et assistance'
  }
];
