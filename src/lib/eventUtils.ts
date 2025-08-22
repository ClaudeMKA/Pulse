import { COLORS } from "@/lib/theme";

export function getGenreColor(genre: string) {
  switch (genre) {
    case 'RAP': return COLORS.violet;
    case 'RNB': return COLORS.rose;
    case 'REGGAE': return COLORS.corail;
    case 'ROCK': return COLORS.lavande;
    default: return COLORS.violet;
  }
}

export function getTypeColor(type: string) {
  switch (type) {
    case 'CONCERT': return COLORS.roseClair;
    case 'FESTIVAL': return COLORS.lavande;
    case 'SHOWCASE': return COLORS.rose;
    case 'OTHER': return COLORS.corail;
    default: return COLORS.roseClair;
  }
}

export function getGenreIcon(genre: string) {
  switch (genre) {
    case 'RAP': return '🎤';
    case 'RNB': return '🎵';
    case 'REGGAE': return '🌴';
    case 'ROCK': return '🎸';
    default: return '🎵';
  }
}

export function getTypeIcon(type: string) {
  switch (type) {
    case 'CONCERT': return '🎤';
    case 'FESTIVAL': return '🎪';
    case 'SHOWCASE': return '✨';
    case 'OTHER': return '📅';
    default: return '🎤';
  }
}
