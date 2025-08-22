export function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Date invalide';
  }
}

export function formatDateOnly(dateString: string) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
  } catch {
    return 'Date invalide';
  }
}

export function formatDateShort(dateString: string) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short'
    });
  } catch {
    return 'Date invalide';
  }
}
