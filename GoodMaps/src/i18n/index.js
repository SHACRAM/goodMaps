import { createI18n } from 'vue-i18n'

const messages = {
  fr: {
    app: {
      name: 'Good Maps',
      tagline: "Suggestions d'activités adaptées"
    },
    onboarding: {
      title: 'Bienvenue !',
      subtitle: 'Pour mieux personnaliser vos suggestions d\'activités, merci de remplir ce formulaire.',
      mobility: 'Mobilité réduite (PMR)',
      interests: 'Centres d\'intérêt',
      radius: 'Rayon de recherche',
      ageGroup: 'Tranche d\'âge',
      language: 'Langue préférée',
      submit: 'Passer à la carte',
      interests_options: {
        culture: 'Culture & musées',
        nature: 'Nature & parcs',
        food: 'Gastronomie',
        sport: 'Sport & loisirs',
        shopping: 'Shopping',
        nightlife: 'Vie nocturne'
      },
      age_options: {
        child: 'Enfant (0–12)',
        teen: 'Adolescent (13–17)',
        adult: 'Adulte (18–59)',
        senior: 'Senior (60+)'
      }
    },
    map: {
      getSuggestions: 'Obtenir des suggestions',
      loading: 'Chargement...',
      locating: 'Localisation en cours...',
      noResults: 'Aucun résultat trouvé',
      openNow: 'Ouvert maintenant',
      closedNow: 'Fermé',
      until: "jusqu'à"
    },
    place: {
      bookOnline: 'Réservez en ligne',
      callNow: 'Appelez maintenant',
      description: 'Description',
      openingHours: 'Horaires',
      accessibility: 'Accessibilité',
      rating: 'Note',
      reviews: 'avis',
      share: 'Partager',
      directions: 'Itinéraire'
    },
    preferences: {
      title: 'Préférences',
      theme: 'Thème',
      language: 'Langue',
      light: 'Clair',
      dark: 'Sombre',
      system: 'Système',
      notifications: 'Notifications',
      radius: 'Rayon de recherche',
      accessibility: 'Accessibilité PMR',
      about: 'À propos',
      version: 'Version',
      save: 'Enregistrer'
    },
    errors: {
      locationDenied: 'Accès à la localisation refusé. Veuillez l\'autoriser dans les paramètres.',
      networkError: 'Erreur réseau. Vérifiez votre connexion.',
      apiError: 'Erreur lors de la récupération des données.'
    },
    disclaimer: 'Les informations peuvent contenir des erreurs. Vérifiez les informations importantes.'
  },
  en: {
    app: {
      name: 'Good Maps',
      tagline: 'Adapted activity suggestions'
    },
    onboarding: {
      title: 'Welcome!',
      subtitle: 'To better personalize your activity suggestions, please fill in this form.',
      mobility: 'Reduced mobility (PRM)',
      interests: 'Interests',
      radius: 'Search radius',
      ageGroup: 'Age group',
      language: 'Preferred language',
      submit: 'Go to map',
      interests_options: {
        culture: 'Culture & museums',
        nature: 'Nature & parks',
        food: 'Gastronomy',
        sport: 'Sports & leisure',
        shopping: 'Shopping',
        nightlife: 'Nightlife'
      },
      age_options: {
        child: 'Child (0–12)',
        teen: 'Teen (13–17)',
        adult: 'Adult (18–59)',
        senior: 'Senior (60+)'
      }
    },
    map: {
      getSuggestions: 'Get suggestions',
      loading: 'Loading...',
      locating: 'Locating...',
      noResults: 'No results found',
      openNow: 'Open now',
      closedNow: 'Closed',
      until: 'until'
    },
    place: {
      bookOnline: 'Book online',
      callNow: 'Call now',
      description: 'Description',
      openingHours: 'Opening hours',
      accessibility: 'Accessibility',
      rating: 'Rating',
      reviews: 'reviews',
      share: 'Share',
      directions: 'Directions'
    },
    preferences: {
      title: 'Preferences',
      theme: 'Theme',
      language: 'Language',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      notifications: 'Notifications',
      radius: 'Search radius',
      accessibility: 'PRM Accessibility',
      about: 'About',
      version: 'Version',
      save: 'Save'
    },
    errors: {
      locationDenied: 'Location access denied. Please enable it in settings.',
      networkError: 'Network error. Check your connection.',
      apiError: 'Error retrieving data.'
    },
    disclaimer: 'Information may contain errors. Please verify important details.'
  }
}

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  fallbackLocale: 'en',
  messages
})

export default i18n
