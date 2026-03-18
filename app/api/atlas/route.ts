import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY!;
const BUCKET = "photos";

interface StorageItem {
  name: string;
  id: string | null;
}

// In-memory cache survives across requests on Railway (long-running server)
const metadataCache = new Map<string, Record<string, unknown>>();

async function listFolders(): Promise<string[]> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefix: "", limit: 1000 }),
  });
  if (!res.ok) throw new Error(`listFolders failed: ${res.status}`);
  const items: StorageItem[] = await res.json();
  return items
    .filter((i) => i.id === null && !i.name.startsWith("."))
    .map((i) => i.name);
}

async function listFiles(folder: string): Promise<string[]> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefix: folder, limit: 1000 }),
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

// Parse folder name as fallback when LLM fails
function fallbackMeta(folder: string) {
  const parts = folder.replace(/-/g, "_").split("_");
  const year = parts.find((p) => /^\d{4}$/.test(p));
  const month = parts.find(
    (p, i) => /^\d{2}$/.test(p) && i > 0 && /^\d{4}$/.test(parts[i - 1])
  );
  const monthNames = [
    "",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const locationParts = parts.filter((p) => !/^\d{2,4}$/.test(p));
  const title = locationParts
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    folder,
    title,
    location: title,
    region: "Unknown",
    when: month
      ? `${monthNames[parseInt(month)]} ${year}`
      : year
        ? year
        : "Unknown",
    lat: 0,
    lon: 0,
    palette: ["#dde3df", "#8aa0a6", "#38515d"],
  };
}

async function inferMetadata(
  folders: string[]
): Promise<Record<string, unknown>[]> {
  const uncached = folders.filter((f) => !metadataCache.has(f));

  if (uncached.length > 0) {
    try {
      const res = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
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
                content: `Given these folder names from a travel photo collection, infer metadata for each.
The naming convention is "country_city_YYYY_MM" or "location_YYYY_MM" (all lowercase ASCII).
For each folder, provide: display title, location, geographic region, human-readable date, latitude, longitude, and 3 hex color codes representing the visual mood of that destination.

Folder names: ${JSON.stringify(uncached)}`,
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
                          folder: {
                            type: "string",
                            description: "Original folder name",
                          },
                          title: {
                            type: "string",
                            description:
                              "Display title, e.g. 'Tokyo, Japan' or 'Bali'",
                          },
                          location: {
                            type: "string",
                            description:
                              "Geographic location, e.g. 'Yunnan, China'",
                          },
                          region: {
                            type: "string",
                            description:
                              "Geographic region, e.g. 'East Asia', 'South Asia', 'Pacific Coast'",
                          },
                          when: {
                            type: "string",
                            description:
                              "Human readable date, e.g. 'February 2026'",
                          },
                          lat: {
                            type: "number",
                            description: "Latitude of the destination",
                          },
                          lon: {
                            type: "number",
                            description: "Longitude of the destination",
                          },
                          palette: {
                            type: "array",
                            items: { type: "string" },
                            description:
                              "Exactly 3 hex color codes representing the visual mood",
                          },
                        },
                        required: [
                          "folder",
                          "title",
                          "location",
                          "region",
                          "when",
                          "lat",
                          "lon",
                          "palette",
                        ],
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
        }
      );

      if (!res.ok) {
        console.error("OpenRouter API error:", res.status, await res.text());
        throw new Error("LLM inference failed");
      }

      const data = await res.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      for (const item of parsed.items) {
        metadataCache.set(item.folder, item);
      }
    } catch (err) {
      console.error("LLM inference error, using fallback:", err);
      for (const f of uncached) {
        if (!metadataCache.has(f)) {
          metadataCache.set(f, fallbackMeta(f));
        }
      }
    }
  }

  return folders.map(
    (f) => metadataCache.get(f) ?? (fallbackMeta(f) as Record<string, unknown>)
  );
}

export const revalidate = 3600;

export async function GET() {
  try {
    const folders = await listFolders();
    if (folders.length === 0) {
      return NextResponse.json({ stops: [], carouselPhotos: [] });
    }

    const metadataList = await inferMetadata(folders);
    const fileLists = await Promise.all(folders.map((f) => listFiles(f)));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stops = folders.map((folder, i) => {
      const meta = metadataList[i] as any;
      const files = fileLists[i];
      const photoUrl = (file: string) =>
        `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${folder}/${file}`;

      return {
        id: folder,
        title: meta.title,
        location: meta.location,
        region: meta.region,
        when: meta.when,
        lat: meta.lat,
        lon: meta.lon,
        summary: `${files.length} photos from ${meta.title}, ${meta.when}.`,
        palette: meta.palette,
        photos: files.map((file, j) => ({
          src: photoUrl(file),
          alt: `${meta.title} photo ${j + 1}`,
          caption: `${meta.location}, ${meta.when}`,
        })),
      };
    });

    const carouselPhotos = stops
      .filter((s) => s.photos.length > 0)
      .map((s) => s.photos[0].src);

    return NextResponse.json({ stops, carouselPhotos });
  } catch (error) {
    console.error("Atlas API error:", error);
    return NextResponse.json(
      { error: "Failed to load atlas data" },
      { status: 500 }
    );
  }
}
