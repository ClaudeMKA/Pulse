// Constantes d'espacement pour une cohérence visuelle parfaite
export const SPACING = {
  // Espacements de base
  xs: 'py-2',      // 8px
  sm: 'py-4',      // 16px  
  md: 'py-8',      // 32px
  lg: 'py-12',     // 48px
  xl: 'py-16',     // 64px
  xxl: 'py-20',    // 80px

  // Espacements spécifiques par section
  section: {
    // Hero sections
    hero: {
      padding: 'pt-20 pb-16',
      margin: 'mb-0',
    },
    // Sections de contenu principal
    content: {
      padding: 'py-16',
      margin: 'mb-0',
    },
    // Sections de filtres
    filters: {
      padding: 'py-6',
      margin: 'mb-0',
    },
    // Footer
    footer: {
      padding: 'py-10',
      margin: 'mt-0',
    }
  },

  // Espacements pour les conteneurs
  container: {
    // Conteneurs principaux
    main: 'max-w-7xl mx-auto px-4',
    // Conteneurs de contenu
    content: 'max-w-4xl mx-auto px-4',
    // Conteneurs de cartes/grilles
    grid: 'max-w-7xl mx-auto px-4',
  },

  // Espacements entre éléments
  elements: {
    // Entre titre et contenu
    titleToContent: 'mb-6',
    // Entre sections
    betweenSections: 'mb-12',
    // Entre cartes dans une grille
    cardGap: 'gap-8',
    // Entre lignes de texte
    textGap: 'mb-4',
  },

  // Espacements pour les cartes
  cards: {
    // Padding interne des cartes
    padding: 'p-6',
    largePadding: 'p-8',
    // Margin entre cartes
    margin: 'mb-6',
    // Border radius cohérent
    radius: 'rounded-2xl',
    largeRadius: 'rounded-3xl',
  }
} as const;

export const LAYOUT_CLASSES = {
  standardFooter: `w-full ${SPACING.section.footer.padding} px-4 text-center`,
} as const;
