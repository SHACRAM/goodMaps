# 🗺️ Good Maps

> **Suggestions d'activités adaptées** — Application mobile Vue.js pour découvrir des lieux près de chez vous, avec support PMR, thème sombre/clair et multilangue.

---

## 📱 Aperçu

Good Maps est une Progressive Web App (PWA) mobile-first qui :

- **Détecte automatiquement** la localisation GPS de l'utilisateur
- **Recherche des lieux** via OpenStreetMap (Overpass API) — *aucune clé API requise*
- **Affiche les résultats** sur une carte interactive Leaflet avec markers personnalisés
- **Enrichit les descriptions** via l'API Wikipedia
- **Filtre les résultats** par intérêts, accessibilité PMR, et rayon de recherche
- **Supporte le thème sombre/clair** et le multilingue (FR/EN)

---

## 🏗️ Architecture

```
goodmaps/
├── src/
│   ├── assets/styles/    # Styles globaux SCSS + tokens CSS
│   ├── components/       # Composants réutilisables
│   │   ├── GmLogo.vue        — Logo SVG Good Maps
│   │   └── PlaceCard.vue     — Carte de lieu (liste)
│   ├── views/            # Pages / écrans
│   │   ├── SplashView.vue        — Écran d'accueil animé
│   │   ├── OnboardingView.vue    — Formulaire de préférences
│   │   ├── MapView.vue           — Carte principale + suggestions
│   │   ├── PlaceDetailView.vue   — Fiche détaillée d'un lieu
│   │   └── PreferencesView.vue   — Paramètres (thème, langue…)
│   ├── stores/           # State management Pinia
│   │   ├── preferences.js    — Thème, langue, rayon, PMR…
│   │   └── places.js         — Localisation, lieux, sélection
│   ├── services/         # Couche API / métier
│   │   └── places.service.js — Nominatim, Overpass, Wikipedia
│   ├── router/           # Vue Router (Hash mode)
│   │   └── index.js
│   ├── i18n/             # Traductions
│   │   └── index.js          — FR + EN
│   ├── App.vue           # Composant racine + transitions
│   └── main.js           # Bootstrap : Vue, Pinia, PrimeVue, i18n
├── server/db/
│   └── init.sql          # Schéma PostgreSQL (optionnel)
├── public/
│   └── favicon.svg
├── docker-compose.yml    # Stack complète avec Postgres
├── Dockerfile            # Build multi-stage (Node → nginx)
├── nginx.conf            # Config nginx + security headers
└── vite.config.js
```

---

## 🚀 Démarrage rapide

### Prérequis

- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
# Cloner le repo
git clone <repo-url> goodmaps
cd goodmaps

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

### Build production

```bash
npm run build
npm run preview
```

---

## 🐳 Docker (avec PostgreSQL)

```bash
# Lancer l'application complète
docker-compose up --build

# En arrière-plan
docker-compose up -d

# Arrêter
docker-compose down

# Supprimer les volumes (reset BDD)
docker-compose down -v
```

L'app sera sur `http://localhost:5173`, PostgreSQL sur le port `5432`.

---

## 🗄️ Base de données PostgreSQL

Le schéma SQL (`server/db/init.sql`) crée les tables suivantes :

| Table | Description |
|---|---|
| `users` | Utilisateurs anonymes (par device_id) |
| `user_preferences` | Préférences par utilisateur |
| `saved_places` | Lieux sauvegardés (OSM ID + coords) |
| `search_history` | Historique des recherches |

> **Note** : Par défaut, Good Maps fonctionne entièrement sans backend (localStorage + APIs publiques). La BDD n'est nécessaire que si vous souhaitez synchroniser les préférences multi-appareils ou analyser les données d'usage.

Pour activer le backend, décommenter le service `api` dans `docker-compose.yml` et implémenter `./server/` avec Express + pg.

---

## 🌐 APIs utilisées

| Service | Usage | Clé API |
|---|---|---|
| [OpenStreetMap / Nominatim](https://nominatim.openstreetmap.org) | Géocodage / Géocodage inverse | ❌ Gratuit |
| [Overpass API](https://overpass-api.de) | Recherche de POI par catégorie | ❌ Gratuit |
| [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/) | Descriptions des lieux | ❌ Gratuit |
| [Google Maps Directions](https://maps.google.com) | Itinéraire (lien externe) | ❌ Gratuit |

> ⚠️ **Limites de taux** : Nominatim et Overpass ont des limites de requêtes (1 req/s pour Nominatim). Pour une production à grande échelle, mettre en place un backend proxy avec cache Redis.

---

## 🎨 Design System

Les variables CSS sont définies dans `src/assets/styles/main.scss` :

```css
/* Couleurs principales */
--gm-red: #E84040;
--gm-red-dark: #C42929;

/* Thème (light / dark) */
--bg-primary: #F5F5F5;
--bg-surface: #FFFFFF;
--text-primary: #1A1A1A;

/* Typographie */
--font-display: 'Barlow Condensed', sans-serif;
--font-body: 'Barlow', sans-serif;
```

Le thème est contrôlé via `data-theme="dark"` sur `<html>`.

---

## 🔒 Sécurité

- **Content Security Policy** configurée dans `nginx.conf`
- **Headers de sécurité** : X-Frame-Options, X-Content-Type-Options, XSS-Protection
- **Aucune clé API** exposée côté client
- **Données utilisateur** stockées uniquement en `localStorage` (côté client)
- **PostgreSQL** : mots de passe via variables d'environnement (à sécuriser en production avec des secrets)
- **SQL injection** : utiliser des requêtes paramétrées (`pg` avec `$1, $2…`)

### Variables d'environnement (production)

```env
POSTGRES_PASSWORD=<mot-de-passe-fort>
VITE_API_URL=https://api.votre-domaine.com
```

---

## 🌍 Internationalisation (i18n)

Les traductions sont dans `src/i18n/index.js`. Pour ajouter une langue :

```js
const messages = {
  fr: { /* ... */ },
  en: { /* ... */ },
  es: { /* Ajouter ici */ }
}
```

---

## 📦 Stack technique

| Outil | Version | Rôle |
|---|---|---|
| Vue.js | 3.4 | Framework UI |
| PrimeVue | 4.x | Composants UI (Slider, Toggle, Select…) |
| Pinia | 2.x | State management |
| Vue Router | 4.x | Navigation SPA |
| Vue i18n | 9.x | Internationalisation |
| Leaflet | 1.9 | Cartes interactives |
| @vue-leaflet | 0.10 | Wrapper Vue pour Leaflet |
| Vite | 5.x | Build tool |
| SCSS | — | Styles + design tokens |
| PostgreSQL | 16 | Base de données (optionnel) |
| Docker | — | Containerisation |
| nginx | Alpine | Serveur web production |

---

## 📝 Développement

### Structure des commits

```
feat: nouvelle fonctionnalité
fix: correction de bug
style: changements de style
refactor: refactoring sans changement de comportement
docs: documentation
chore: tâches de maintenance
```

### Ajouter un écran

1. Créer `src/views/NouvelEcran.vue`
2. Ajouter la route dans `src/router/index.js`
3. Ajouter les traductions dans `src/i18n/index.js`

### Ajouter une catégorie de lieux

Dans `src/services/places.service.js`, ajouter à `INTEREST_TAGS` :

```js
const INTEREST_TAGS = {
  // ...
  wellness: ['amenity~"spa|massage"', 'leisure="sauna"'],
}
```

---

## 📄 Licence

MIT — Libre d'utilisation et de modification.

---

*Données cartographiques © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)*  
*Descriptions © [Wikipedia](https://www.wikipedia.org)*
