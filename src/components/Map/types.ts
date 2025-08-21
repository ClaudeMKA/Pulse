export interface MapEvent extends Event {
  coordinates: [number, number];
}

export interface MapFilters {
  genres: string[];
  types: string[];
  searchQuery: string;
}

export const eventTypeColors: Record<string, string> = {
  concert: "#FF6B6B",
  atelier: "#4ECDC4",
  conference: "#45B7D1",
  exposition: "#96CEB4",
  afterparty: "#FFEEAD",
  rencontre: "#D4A5A5"
};

export const eventTypeIcons: Record<string, string> = {
  concert: "🎤",
  atelier: "🎨",
  conference: "🎓",
  exposition: "🖼️",
  afterparty: "🎉",
  rencontre: "🤝"
};

export const genreOptions = ['ROCK', 'RAP', 'RNB', 'REGGAE'];
export const typeOptions = ['concert', 'atelier', 'conference', 'exposition', 'afterparty', 'rencontre'];
