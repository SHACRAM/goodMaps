/**
 * Places Service — Good Maps v1.3
 *
 * Fix majeur : requêtes Overpass compactes via regex groupées
 * Avant : 130 unions (timeout 504)
 * Après : ~12 unions max (rapide et fiable)
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

// Mirrors par ordre de fiabilité (CORS ouvert sur tous)
const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
]

// ─── Définition des catégories : regex groupées par clé OSM ───────────────────
// Format : { key, regex, categories[], label }
// Une seule union Overpass par entrée → compact et rapide
const QUERY_GROUPS = [
  // Culture
  {
    key: 'tourism',
    regex: 'museum|gallery|attraction|artwork|zoo|aquarium|theatre',
    categories: ['culture'],
  },
  {
    key: 'amenity',
    regex: 'theatre|cinema|library|arts_centre',
    categories: ['culture'],
  },
  {
    key: 'historic',
    regex: 'monument|castle|ruins|memorial|building|fort',
    categories: ['culture'],
  },
  // Nature
  {
    key: 'leisure',
    regex: 'park|garden|nature_reserve|beach_resort|playground|dog_park',
    categories: ['nature'],
  },
  {
    key: 'tourism',
    regex: 'viewpoint|camp_site',
    categories: ['nature', 'hotel'],
  },
  {
    key: 'natural',
    regex: 'beach|wood|waterfall|cave_entrance',
    categories: ['nature'],
  },
  // Food
  {
    key: 'amenity',
    regex: 'restaurant|cafe|fast_food|bar|pub|food_court|ice_cream|biergarten|bakery',
    categories: ['food', 'nightlife'],
  },
  {
    key: 'shop',
    regex: 'bakery|deli|confectionery',
    categories: ['food'],
  },
  // Sport
  {
    key: 'leisure',
    regex: 'sports_centre|swimming_pool|stadium|fitness_centre|golf_course|bowling_alley|ice_rink|climbing|pitch|tennis|track',
    categories: ['sport'],
  },
  // Shopping
  {
    key: 'shop',
    regex: 'mall|supermarket|department_store|clothes|books|electronics|jewelry|sports|toys|furniture|florist',
    categories: ['shopping'],
  },
  {
    key: 'amenity',
    regex: 'marketplace',
    categories: ['shopping'],
  },
  // Nightlife
  {
    key: 'amenity',
    regex: 'nightclub|casino|karaoke',
    categories: ['nightlife'],
  },
  // Services
  {
    key: 'amenity',
    regex: 'hospital|clinic|pharmacy|bank|post_office|police|fuel|car_wash|dentist|doctors',
    categories: ['services'],
  },
  // Hôtels
  {
    key: 'tourism',
    regex: 'hotel|hostel|apartment|guest_house|motel',
    categories: ['hotel'],
  },
  // Transport
  {
    key: 'amenity',
    regex: 'parking|bicycle_rental|car_rental|bus_station|ferry_terminal',
    categories: ['transport'],
  },
]

// Table de correspondance value → { category, label } pour le parsing
const VALUE_META = {
  // Culture
  museum: { category: 'culture', label: 'Musée' },
  gallery: { category: 'culture', label: 'Galerie' },
  attraction: { category: 'culture', label: 'Attraction touristique' },
  artwork: { category: 'culture', label: "Œuvre d'art" },
  zoo: { category: 'culture', label: 'Zoo' },
  aquarium: { category: 'culture', label: 'Aquarium' },
  theatre: { category: 'culture', label: 'Théâtre' },
  cinema: { category: 'culture', label: 'Cinéma' },
  library: { category: 'culture', label: 'Bibliothèque' },
  arts_centre: { category: 'culture', label: 'Centre culturel' },
  monument: { category: 'culture', label: 'Monument' },
  castle: { category: 'culture', label: 'Château' },
  ruins: { category: 'culture', label: 'Ruines' },
  memorial: { category: 'culture', label: 'Mémorial' },
  // Nature
  park: { category: 'nature', label: 'Parc' },
  garden: { category: 'nature', label: 'Jardin' },
  nature_reserve: { category: 'nature', label: 'Réserve naturelle' },
  viewpoint: { category: 'nature', label: 'Point de vue' },
  beach_resort: { category: 'nature', label: 'Plage' },
  beach: { category: 'nature', label: 'Plage' },
  playground: { category: 'nature', label: 'Aire de jeux' },
  dog_park: { category: 'nature', label: 'Parc canin' },
  wood: { category: 'nature', label: 'Forêt' },
  waterfall: { category: 'nature', label: 'Cascade' },
  // Food
  restaurant: { category: 'food', label: 'Restaurant' },
  cafe: { category: 'food', label: 'Café' },
  fast_food: { category: 'food', label: 'Fast-food' },
  food_court: { category: 'food', label: 'Food court' },
  ice_cream: { category: 'food', label: 'Glacier' },
  biergarten: { category: 'food', label: 'Biergarten' },
  bakery: { category: 'food', label: 'Boulangerie' },
  deli: { category: 'food', label: 'Traiteur' },
  // Bar / nightlife
  bar: { category: 'nightlife', label: 'Bar' },
  pub: { category: 'nightlife', label: 'Pub' },
  nightclub: { category: 'nightlife', label: 'Boîte de nuit' },
  casino: { category: 'nightlife', label: 'Casino' },
  karaoke: { category: 'nightlife', label: 'Karaoké' },
  // Sport
  sports_centre: { category: 'sport', label: 'Centre sportif' },
  swimming_pool: { category: 'sport', label: 'Piscine' },
  stadium: { category: 'sport', label: 'Stade' },
  fitness_centre: { category: 'sport', label: 'Salle de sport' },
  golf_course: { category: 'sport', label: 'Golf' },
  bowling_alley: { category: 'sport', label: 'Bowling' },
  ice_rink: { category: 'sport', label: 'Patinoire' },
  climbing: { category: 'sport', label: 'Escalade' },
  pitch: { category: 'sport', label: 'Terrain' },
  tennis: { category: 'sport', label: 'Tennis' },
  track: { category: 'sport', label: 'Piste athlétisme' },
  // Shopping
  mall: { category: 'shopping', label: 'Centre commercial' },
  supermarket: { category: 'shopping', label: 'Supermarché' },
  department_store: { category: 'shopping', label: 'Grand magasin' },
  clothes: { category: 'shopping', label: 'Vêtements' },
  books: { category: 'shopping', label: 'Librairie' },
  electronics: { category: 'shopping', label: 'Électronique' },
  marketplace: { category: 'shopping', label: 'Marché' },
  // Services
  hospital: { category: 'services', label: 'Hôpital' },
  clinic: { category: 'services', label: 'Clinique' },
  pharmacy: { category: 'services', label: 'Pharmacie' },
  bank: { category: 'services', label: 'Banque' },
  post_office: { category: 'services', label: 'La Poste' },
  police: { category: 'services', label: 'Police' },
  fuel: { category: 'services', label: 'Station-service' },
  dentist: { category: 'services', label: 'Dentiste' },
  doctors: { category: 'services', label: 'Médecin' },
  // Hôtels
  hotel: { category: 'hotel', label: 'Hôtel' },
  hostel: { category: 'hotel', label: 'Auberge de jeunesse' },
  apartment: { category: 'hotel', label: 'Appartement' },
  guest_house: { category: 'hotel', label: 'Chambre d\'hôtes' },
  motel: { category: 'hotel', label: 'Motel' },
  camp_site: { category: 'hotel', label: 'Camping' },
  // Transport
  parking: { category: 'transport', label: 'Parking' },
  bicycle_rental: { category: 'transport', label: 'Location vélos' },
  car_rental: { category: 'transport', label: 'Location voiture' },
  bus_station: { category: 'transport', label: 'Gare routière' },
}

// Export pour FilterPanel
export const ALL_POI_TYPES = Object.entries(VALUE_META).map(([value, meta]) => ({
  value,
  ...meta,
  key: 'amenity', // approximatif, utilisé uniquement pour l'UI
}))

// ─── Construction requête Overpass compacte ────────────────────────────────────
function buildOverpassQuery({ lat, lng, radius, interests, pmrFilter }) {
  const around = `(around:${radius},${lat},${lng})`

  // Filtrer les groupes selon les catégories sélectionnées
  let groups
  if (interests.length > 0) {
    // Garder un groupe si au moins une de ses catégories est sélectionnée
    groups = QUERY_GROUPS.filter(g =>
      g.categories.some(c => interests.includes(c))
    )
  } else {
    groups = QUERY_GROUPS
  }

  // Filtre PMR
  const wheelchair =
    pmrFilter === 'yes'     ? '["wheelchair"="yes"]' :
    pmrFilter === 'limited' ? '["wheelchair"~"yes|limited"]' :
    ''

  // Générer les unions : 1 node + 1 way par groupe (pas par valeur !)
  const parts = groups.map(({ key, regex }) =>
    `  node["${key}"~"${regex}"]${wheelchair}${around};
  way["${key}"~"${regex}"]${wheelchair}${around};`
  ).join('\n')

  return `[out:json][timeout:30];
(
${parts}
);
out center tags 100;`
}

// ─── Fetch avec fallback mirrors + timeout court ───────────────────────────────
async function fetchOverpass(query) {
  const errors = []
  for (const mirror of OVERPASS_MIRRORS) {
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 25000)

      const res = await fetch(mirror, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: ctrl.signal,
      })
      clearTimeout(timer)

      if (!res.ok) {
        errors.push(`${mirror}: HTTP ${res.status}`)
        // 504 = surcharge temporaire, on essaie le suivant
        // 400 = requête invalide, inutile de continuer
        if (res.status === 400) throw new Error(`Requête Overpass invalide (400)`)
        continue
      }

      const data = await res.json()
      if (!Array.isArray(data?.elements)) {
        errors.push(`${mirror}: réponse invalide`)
        continue
      }
      console.log(`[GoodMaps] Overpass OK via ${mirror} (${data.elements.length} éléments)`)
      return data
    } catch (err) {
      if (err.name === 'AbortError') {
        errors.push(`${mirror}: timeout 25s`)
      } else {
        errors.push(`${mirror}: ${err.message}`)
      }
    }
  }
  throw new Error(`Overpass indisponible. Détails: ${errors.join(' | ')}`)
}

// ─── Parse un élément OSM → objet Place ───────────────────────────────────────
function parseElement(el) {
  const tags = el.tags || {}
  const lat = el.type === 'node' ? el.lat : el.center?.lat
  const lng = el.type === 'node' ? el.lon : el.center?.lon
  if (!lat || !lng || !tags.name) return null

  // Chercher la catégorie/label dans VALUE_META
  let category = 'other'
  let typeLabel = ''
  for (const [value, meta] of Object.entries(VALUE_META)) {
    // Chercher dans toutes les clés OSM pertinentes
    for (const key of ['amenity', 'tourism', 'leisure', 'shop', 'historic', 'natural', 'public_transport']) {
      if (tags[key] === value) {
        category = meta.category
        typeLabel = meta.label
        break
      }
    }
    if (category !== 'other') break
  }

  const openingHours = tags.opening_hours || null
  const wheelchair = tags.wheelchair

  return {
    id: `${el.type}/${el.id}`,
    osmId: String(el.id),
    osmType: el.type,
    name: tags.name,
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    address: buildAddress(tags),
    phone: tags.phone || tags['contact:phone'] || null,
    website: tags.website || tags['contact:website'] || null,
    openingHours,
    closingTime: extractClosingTime(openingHours),
    isOpen: openingHours ? isCurrentlyOpen(openingHours) : null,
    pmrAccess: wheelchair === 'yes',
    pmrLimited: wheelchair === 'limited',
    pmrNo: wheelchair === 'no',
    pmrUnknown: !wheelchair,
    category,
    typeLabel,
    cuisine: tags.cuisine?.replace(/_/g, ' ') || null,
    tags,
  }
}

function buildAddress(tags) {
  return [tags['addr:housenumber'], tags['addr:street'], tags['addr:postcode'], tags['addr:city']]
    .filter(Boolean).join(', ') || null
}

// ─── Parseur horaires simplifié ────────────────────────────────────────────────
function isCurrentlyOpen(str) {
  try {
    if (!str) return null
    str = str.trim()
    if (str === '24/7') return true
    const now = new Date()
    const day = ['Su','Mo','Tu','We','Th','Fr','Sa'][now.getDay()]
    const cur = now.getHours() * 60 + now.getMinutes()
    for (const rule of str.split(/;\s*/)) {
      const m = rule.match(/^([A-Za-z,\-\s]+?)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/)
      if (!m) continue
      const [, days, s, e] = m
      if (dayInRange(days.trim(), day) && cur >= t2m(s) && cur <= t2m(e)) return true
    }
    return false
  } catch { return null }
}

function extractClosingTime(str) {
  if (!str) return null
  try {
    const day = ['Su','Mo','Tu','We','Th','Fr','Sa'][new Date().getDay()]
    for (const rule of str.split(/;\s*/)) {
      const m = rule.match(/^([A-Za-z,\-\s]+?)\s+\d{1,2}:\d{2}\s*-\s*(\d{1,2}:\d{2})/)
      if (!m) continue
      if (dayInRange(m[1].trim(), day)) return m[2]
    }
  } catch {}
  return null
}

function t2m(t) { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0) }

function dayInRange(part, today) {
  const ORD = ['Mo','Tu','We','Th','Fr','Sa','Su']
  for (const seg of part.split(',').map(s => s.trim())) {
    if (seg.includes('-')) {
      const [a, b] = seg.split('-').map(s => s.trim())
      const ai = ORD.indexOf(a), bi = ORD.indexOf(b), ci = ORD.indexOf(today)
      if (ai >= 0 && bi >= 0 && ci >= ai && ci <= bi) return true
    } else if (seg === today) return true
  }
  return false
}

function score(p) {
  let s = 0
  if (p.address) s += 3
  if (p.phone) s += 2
  if (p.website) s += 2
  if (p.openingHours) s += 3
  if (p.pmrAccess) s += 1
  if (p.category !== 'other') s += 2
  if (p.isOpen) s += 1
  return s
}

// ─── Service public ────────────────────────────────────────────────────────────
export const placesService = {

  getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Geolocation non supporté'))
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        err => {
          const msgs = { 1: 'Accès refusé', 2: 'Position indisponible', 3: 'Délai dépassé' }
          reject(new Error(msgs[err.code] || 'Erreur géolocalisation'))
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
      )
    })
  },

  async reverseGeocode(lat, lng) {
    try {
      const res = await fetch(
        `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lng}&format=json&zoom=12`,
        { headers: { 'Accept-Language': 'fr', 'User-Agent': 'GoodMaps/1.3' } }
      )
      if (!res.ok) return 'Votre ville'
      const d = await res.json()
      return d.address?.city || d.address?.town || d.address?.village || d.address?.municipality || 'Votre ville'
    } catch { return 'Votre ville' }
  },

  async searchNearby({ lat, lng, radius, interests, pmr, pmrFilter }) {
    const query = buildOverpassQuery({
      lat, lng, radius, interests,
      pmrFilter: pmrFilter || (pmr ? 'yes' : 'all'),
    })

    // Log pour debug
    const lineCount = query.split('\n').length
    console.log(`[GoodMaps] Requête Overpass: ${lineCount} lignes, rayon ${radius}m`)

    const data = await fetchOverpass(query)

    let places = data.elements.map(parseElement).filter(Boolean)

    // Déduplication
    const seen = new Set()
    places = places.filter(p => {
      if (seen.has(p.osmId)) return false
      seen.add(p.osmId)
      return true
    })

    places.sort((a, b) => score(b) - score(a))
    console.log(`[GoodMaps] ${places.length} lieux après parsing`)
    return places
  },

  async getWikipediaDescription(name, lang = 'fr') {
    if (!name) return null
    try {
      const res = await fetch(
        `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
        { headers: { 'User-Agent': 'GoodMaps/1.3' } }
      )
      if (res.ok) {
        const d = await res.json()
        if (d.type !== 'disambiguation' && d.extract) return d.extract
      }
      // Fallback search
      const sRes = await fetch(
        `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&format=json&origin=*&srlimit=1`
      )
      if (!sRes.ok) return null
      const first = (await sRes.json()).query?.search?.[0]
      if (!first) return null
      const r2 = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(first.title)}`)
      if (!r2.ok) return null
      return (await r2.json()).extract || null
    } catch { return null }
  },

  async geocodeSearch(query, lat = null, lng = null) {
    let url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=7&addressdetails=1`
    if (lat && lng) url += `&viewbox=${lng-0.5},${lat+0.5},${lng+0.5},${lat-0.5}&bounded=0`
    const res = await fetch(url, { headers: { 'Accept-Language': 'fr', 'User-Agent': 'GoodMaps/1.3' } })
    if (!res.ok) throw new Error('Recherche échouée')
    return res.json()
  },
}