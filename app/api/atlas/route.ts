import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY!;
const BUCKET = "photos";

interface StorageItem {
  name: string;
  id: string | null;
}

const metadataCache = new Map<string, Record<string, unknown>>();

async function listSubfolders(prefix: string): Promise<string[]> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefix, limit: 1000 }),
  });
  if (!res.ok) throw new Error(`listSubfolders(${prefix}) failed: ${res.status}`);
  const items: StorageItem[] = await res.json();
  return items
    .filter((i) => i.id === null && !i.name.startsWith("."))
    .map((i) => i.name);
}

async function listFiles(prefix: string): Promise<string[]> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefix, limit: 1000 }),
  });
  if (!res.ok) return [];
  const items: StorageItem[] = await res.json();
  return items
    .filter(
      (i) =>
        i.id !== null &&
        !i.name.startsWith(".") &&
        /\.(jpg|jpeg|png|webp|gif|mp4|mov)$/i.test(i.name)
    )
    .map((i) => i.name)
    .sort();
}

interface Destination {
  country: string;
  city: string;
  attraction: string;
  path: string;
}

async function discoverDestinations(): Promise<Destination[]> {
  const countries = await listSubfolders("");
  const destinations: Destination[] = [];

  // Level 1: countries → cities
  const cityLists = await Promise.all(countries.map((c) => listSubfolders(c)));

  // Level 2: cities → attractions
  const attractionPromises: { country: string; city: string; promise: Promise<string[]> }[] = [];
  for (let i = 0; i < countries.length; i++) {
    for (const city of cityLists[i]) {
      attractionPromises.push({
        country: countries[i],
        city,
        promise: listSubfolders(`${countries[i]}/${city}`),
      });
    }
  }

  const attractionResults = await Promise.all(attractionPromises.map((a) => a.promise));

  for (let i = 0; i < attractionPromises.length; i++) {
    const { country, city } = attractionPromises[i];
    for (const attraction of attractionResults[i]) {
      destinations.push({
        country,
        city,
        attraction,
        path: `${country}/${city}/${attraction}`,
      });
    }
  }

  return destinations;
}

function fallbackMeta(dest: Destination) {
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const title = dest.attraction === "none" ? cap(dest.city) : cap(dest.attraction);
  return {
    path: dest.path,
    country_display: cap(dest.country),
    title,
    location: `${cap(dest.city)}, ${cap(dest.country)}`,
    region: "Unknown",
    lat: 0,
    lon: 0,
    palette: ["#dde3df", "#8aa0a6", "#38515d"],
  };
}

async function inferMetadata(
  destinations: Destination[]
): Promise<Record<string, unknown>[]> {
  const uncached = destinations.filter((d) => !metadataCache.has(d.path));

  if (uncached.length > 0) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-5.4-nano",
          messages: [
            {
              role: "user",
              content: `Given these folder paths from a travel photo collection organized as country/city/attraction (all lowercase ASCII), infer metadata for each.

Note: when attraction is "none", it means the photos represent the city itself with no specific attraction — use the city name as the title (e.g. "Beijing"). Otherwise use the attraction name as the title (e.g. "The Great Wall").

Destinations: ${JSON.stringify(uncached.map((d) => ({ path: d.path, country: d.country, city: d.city, attraction: d.attraction })))}

For each, provide: path, country_display (English name with capitalization), title (attraction display name, or city name if attraction is "none"), location (city + country, e.g. "Beijing, China"), region (e.g. "East Asia"), lat, lon (coordinates of the specific attraction, or city center if "none"), palette (3 hex colors inspired by the place).`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "destinations",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        path: { type: "string" },
                        country_display: { type: "string", description: "Country name, e.g. 'China'" },
                        title: { type: "string", description: "Attraction display name, e.g. 'The Great Wall'" },
                        location: { type: "string", description: "City, Country format" },
                        region: { type: "string", description: "e.g. 'East Asia', 'South Asia'" },
                        lat: { type: "number" },
                        lon: { type: "number" },
                        palette: { type: "array", items: { type: "string" }, description: "3 hex colors" },
                      },
                      required: ["path", "country_display", "title", "location", "region", "lat", "lon", "palette"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["items"],
                additionalProperties: false,
              },
            },
          },
        }),
      });

      if (!res.ok) {
        console.error("OpenRouter error:", res.status, await res.text());
        throw new Error("LLM failed");
      }

      const data = await res.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      for (const item of parsed.items) {
        metadataCache.set(item.path, item);
      }
    } catch (err) {
      console.error("LLM error, using fallback:", err);
      for (const d of uncached) {
        if (!metadataCache.has(d.path)) {
          metadataCache.set(d.path, fallbackMeta(d));
        }
      }
    }
  }

  return destinations.map(
    (d) => metadataCache.get(d.path) ?? (fallbackMeta(d) as Record<string, unknown>)
  );
}

export const revalidate = 3600;

export async function GET() {
  try {
    const destinations = await discoverDestinations();
    if (destinations.length === 0) {
      return NextResponse.json({ stops: [], carouselPhotos: [], countries: [] });
    }

    const metadataList = await inferMetadata(destinations);
    const fileLists = await Promise.all(destinations.map((d) => listFiles(d.path)));

    // Merge attractions into city-level stops, tag each photo with attraction name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cityMap = new Map<string, {
      country: string;
      cityMeta: any;
      photos: { src: string; alt: string; caption: string; attraction?: string }[];
    }>();

    for (let i = 0; i < destinations.length; i++) {
      const dest = destinations[i];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const meta = metadataList[i] as any;
      const files = fileLists[i];
      const cityKey = `${dest.country}/${dest.city}`;
      const attractionName = dest.attraction === "none" ? "" : meta.title;

      const photoUrl = (file: string) =>
        `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${dest.path}/${file}`;

      const photos = files.map((file, j) => ({
        src: photoUrl(file),
        alt: `${attractionName || meta.title} photo ${j + 1}`,
        caption: meta.location,
        ...(attractionName ? { attraction: attractionName } : {}),
      }));

      const existing = cityMap.get(cityKey);
      if (existing) {
        existing.photos.push(...photos);
        // Prefer "none" meta for city-level display
        if (dest.attraction === "none") existing.cityMeta = meta;
      } else {
        cityMap.set(cityKey, {
          country: meta.country_display,
          cityMeta: meta,
          photos,
        });
      }
    }

    const stops = Array.from(cityMap.entries()).map(([cityKey, data]) => {
      const m = data.cityMeta;
      // Use LLM location (e.g. "Beijing, China") as title for city-level display
      // m.location is always "City, Country" format which is reliable
      const cityTitle = m.location.split(",")[0].trim();
      return {
        id: cityKey,
        country: data.country,
        title: cityTitle,
        location: m.location,
        region: m.region,
        lat: m.lat,
        lon: m.lon,
        summary: `${data.photos.length} photos from ${m.title}.`,
        palette: m.palette,
        photos: data.photos,
      };
    });

    // Group by country
    const countryMap2 = new Map<string, string[]>();
    for (const stop of stops) {
      const ids = countryMap2.get(stop.country) ?? [];
      ids.push(stop.id);
      countryMap2.set(stop.country, ids);
    }
    const countries = Array.from(countryMap2.entries()).map(([name, stopIds]) => ({
      name,
      stopIds,
    }));

    const carouselPhotos = stops
      .filter((s) => s.photos.length > 0)
      .map((s) => s.photos[0].src);

    return NextResponse.json({ stops, carouselPhotos, countries });
  } catch (error) {
    console.error("Atlas API error:", error);
    return NextResponse.json({ error: "Failed to load atlas data" }, { status: 500 });
  }
}
