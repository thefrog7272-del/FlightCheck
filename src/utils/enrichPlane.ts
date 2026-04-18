/**
 * Plane enrichment: auto-fills missing image, manufacturer, and type
 * by querying public APIs (no key required for base functionality).
 *
 * Image sources (tried in order):
 *  1. Wikimedia Commons photo search — aviation-focused query
 *  2. Wikipedia article thumbnail (fallback)
 *
 * Metadata source: Wikipedia REST API summary
 *
 * Optional: set VITE_UNSPLASH_ACCESS_KEY in .env.local for Unsplash fallback.
 */

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined;

export interface PlaneEnrichment {
  image?: string;
  manufacturer?: string;
  type?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Clean up the plane name into a good search term */
function buildSearchTerm(planeName: string): string {
  return planeName
    .replace(/\s+v[\d.]+$/i, '')           // strip version suffixes like "v2.4"
    .replace(/\s+professional\b/i, '')      // strip "Professional"
    .replace(/^[A-Z]{2,6}\s+/, '')          // strip all-caps prefixes (PMDG, FBW, FSL)
    .replace(/^[A-Z][a-z]+[A-Z][a-zA-Z]{0,5}\s+/, '') // strip CamelCase prefixes (BkSq, FlyByWire)
    .trim();
}

/** Derive aircraft type from a Wikipedia description / categories */
function deriveType(summary: string): string | undefined {
  const text = summary.toLowerCase();
  if (/fighter|military|combat|attack aircraft|bomber|reconnaissance|jet trainer/.test(text)) return 'Military';
  if (/airliner|commercial|airline|passenger jet|wide.?body|narrow.?body/.test(text)) return 'Airliner';
  if (/helicopter|rotorcraft/.test(text)) return 'Helicopter';
  if (/turboprop|regional/.test(text)) return 'Regional';
  if (/glider|sailplane/.test(text)) return 'Glider';
  if (/ultralight|microlight/.test(text)) return 'Ultralight';
  if (/general aviation|light aircraft|single.engine|twin.engine|piston/.test(text)) return 'GA';
  return undefined;
}

/** Extract manufacturer from a Wikipedia extract */
function deriveManufacturer(extract: string, planeName: string): string | undefined {
  // Common pattern: "The XYZ is a ... aircraft manufactured by Acme"
  const mfgMatch = extract.match(
    /manufactured by ([A-Z][A-Za-z\s&]+?)[\.,]|produced by ([A-Z][A-Za-z\s&]+?)[\.,]|by ([A-Z][A-Za-z\s&]+?) (?:is|was|are)/,
  );
  if (mfgMatch) {
    return (mfgMatch[1] ?? mfgMatch[2] ?? mfgMatch[3]).trim();
  }

  // Try to pull from the first token(s) of the aircraft name itself
  const knownPrefixes = [
    'Beechcraft', 'Beech', 'Boeing', 'Airbus', 'Cessna', 'Piper', 'Cirrus',
    'Diamond', 'Daher', 'TBM', 'Mooney', 'Socata', 'Robin', 'Pilatus',
    'Embraer', 'Bombardier', 'ATR', 'Grumman', 'Lockheed', 'McDonnell',
    'North American', 'Northrop', 'Dassault', 'Saab', 'Fokker',
  ];
  for (const prefix of knownPrefixes) {
    if (planeName.toLowerCase().startsWith(prefix.toLowerCase())) return prefix;
  }
  return undefined;
}

// ── Image sources ─────────────────────────────────────────────────────────────

/**
 * Search Wikimedia Commons for an aviation photo.
 * Prefers MSFS-tagged images, falls back to general aircraft photos.
 * Returns a thumbnail URL (up to 800px wide) or null.
 */
async function fetchCommonsImage(planeName: string): Promise<string | null> {
  const term = buildSearchTerm(planeName);

  // Prefer MSFS 2024 screenshots first, then fall back to general aviation photos
  const queries = [
    `${term} MSFS 2024`,
    `${term} Microsoft Flight Simulator`,
    `${term} aircraft`,
    term,
  ];

  for (const q of queries) {
    const params = new URLSearchParams({
      action: 'query',
      generator: 'search',
      gsrnamespace: '6',        // File namespace
      gsrsearch: q,
      gsrlimit: '5',
      prop: 'imageinfo',
      iiprop: 'url|mime',
      iiurlwidth: '800',
      format: 'json',
      origin: '*',
    });

    try {
      const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
      if (!res.ok) continue;
      const data = await res.json() as {
        query?: {
          pages?: Record<string, {
            imageinfo?: Array<{ thumburl?: string; mime?: string }>;
          }>;
        };
      };

      const pages = data.query?.pages;
      if (!pages) continue;

      for (const page of Object.values(pages)) {
        const info = page.imageinfo?.[0];
        if (!info?.thumburl) continue;
        if (!info.mime?.startsWith('image/')) continue;
        // Prefer JPEG/PNG, skip SVG diagrams
        if (info.mime === 'image/svg+xml') continue;
        return info.thumburl;
      }
    } catch {
      // network failure — try next query
    }
  }
  return null;
}

/** Wikipedia article thumbnail via REST summary API */
async function fetchWikipediaImage(planeName: string): Promise<string | null> {
  const term = buildSearchTerm(planeName).replace(/\s+/g, '_');
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`,
      { headers: { Accept: 'application/json' } },
    );
    if (!res.ok) return null;
    const data = await res.json() as { thumbnail?: { source?: string } };
    return data.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

/** Unsplash (requires VITE_UNSPLASH_ACCESS_KEY) */
async function fetchUnsplashImage(planeName: string): Promise<string | null> {
  if (!UNSPLASH_KEY) return null;
  const term = buildSearchTerm(planeName);
  try {
    const params = new URLSearchParams({
      query: `${term} aircraft`,
      per_page: '1',
      orientation: 'landscape',
    });
    const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
      headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
    });
    if (!res.ok) return null;
    const data = await res.json() as { results?: Array<{ urls?: { regular?: string } }> };
    return data.results?.[0]?.urls?.regular ?? null;
  } catch {
    return null;
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

interface WikiSummary {
  extract?: string;
  description?: string;
}

async function fetchWikipediaMetadata(planeName: string): Promise<WikiSummary | null> {
  const term = buildSearchTerm(planeName).replace(/\s+/g, '_');
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`,
      { headers: { Accept: 'application/json' } },
    );
    if (!res.ok) return null;
    return await res.json() as WikiSummary;
  } catch {
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Enrich a plane record with image, manufacturer, and type from public web sources.
 * Only fills fields that are currently empty/default.
 * Safe to call speculatively — all failures return partial/empty results.
 */
export async function enrichPlane(
  planeName: string,
  existing: { image?: string; manufacturer?: string; type?: string },
): Promise<PlaneEnrichment> {
  const result: PlaneEnrichment = {};

  const needsImage = !existing.image;
  const needsMfg = !existing.manufacturer;
  const needsType = !existing.type || existing.type === 'GA';

  // Fetch metadata once (used for both manufacturer + type)
  let meta: WikiSummary | null = null;
  if (needsMfg || needsType) {
    meta = await fetchWikipediaMetadata(planeName);
  }

  if (meta) {
    const fullText = [meta.extract ?? '', meta.description ?? ''].join(' ');
    if (needsMfg) result.manufacturer = deriveManufacturer(fullText, planeName);
    if (needsType) result.type = deriveType(fullText);
  }

  // Image: Commons → Wikipedia article thumbnail → Unsplash
  if (needsImage) {
    result.image =
      (await fetchCommonsImage(planeName)) ??
      (await fetchWikipediaImage(planeName)) ??
      (await fetchUnsplashImage(planeName)) ??
      undefined;
  }

  return result;
}
