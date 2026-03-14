import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const photosDir = path.join(rootDir, "photos");
const outputFile = path.join(rootDir, "photo-data.js");

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

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

const placeMetadata = {
  "上海": {
    title: "Shanghai",
    location: "Shanghai, China",
    region: "East China",
    lat: 31.2304,
    lon: 121.4737,
    palette: ["#dfe3e6", "#8e98a4", "#3f4c57"],
  },
  "云南": {
    title: "Yunnan",
    location: "China",
    region: "Southwest China",
    lat: 25.0453,
    lon: 102.7097,
    palette: ["#ead8bf", "#af6e43", "#4f3a34"],
  },
  "北京": {
    title: "Beijing",
    location: "Beijing, China",
    region: "North China",
    lat: 39.9042,
    lon: 116.4074,
    palette: ["#e5ddd5", "#9b8a7b", "#473a35"],
  },
  "合肥": {
    title: "Hefei",
    location: "Anhui, China",
    region: "East China",
    lat: 31.8206,
    lon: 117.2272,
    palette: ["#dde5dd", "#92a08b", "#3f4b3d"],
  },
  "圣巴巴拉": {
    title: "Santa Barbara",
    location: "California, USA",
    region: "Pacific Coast",
    lat: 34.4208,
    lon: -119.6982,
    palette: ["#dce3e0", "#8aa0a6", "#38515d"],
  },
  "天津": {
    title: "Tianjin",
    location: "Tianjin, China",
    region: "North China",
    lat: 39.0842,
    lon: 117.2009,
    palette: ["#e3e2df", "#9d9e98", "#474844"],
  },
  "巴厘岛": {
    title: "Bali",
    location: "Indonesia",
    region: "Indian Ocean",
    lat: -8.3405,
    lon: 115.0920,
    palette: ["#e2dac8", "#c08b59", "#3e4b41"],
  },
  "斯里兰卡": {
    title: "Sri Lanka",
    location: "Sri Lanka",
    region: "South Asia",
    lat: 7.8731,
    lon: 80.7718,
    palette: ["#e8dcc3", "#bf865a", "#45513e"],
  },
  "日本": {
    title: "Japan",
    location: "Japan",
    region: "East Asia",
    lat: 36.2048,
    lon: 138.2529,
    palette: ["#efe2d1", "#c97f59", "#4d3d39"],
  },
  "杭州": {
    title: "Hangzhou",
    location: "Zhejiang, China",
    region: "East China",
    lat: 30.2741,
    lon: 120.1551,
    palette: ["#dde5df", "#82a08f", "#3c4f49"],
  },
  "桂林": {
    title: "Guilin",
    location: "Guangxi, China",
    region: "Karst South China",
    lat: 25.2736,
    lon: 110.2900,
    palette: ["#dbe5d6", "#88a182", "#39463d"],
  },
  "西藏": {
    title: "Tibet",
    location: "Tibet, China",
    region: "Tibetan Plateau",
    lat: 29.6520,
    lon: 91.1721,
    palette: ["#d9ddd9", "#8e9b96", "#444b4a"],
  },
  "香格里拉": {
    title: "Shangri-La",
    location: "Yunnan, China",
    region: "Tibetan Plateau",
    lat: 27.8297,
    lon: 99.7065,
    palette: ["#dbe0d5", "#80927a", "#38463e"],
  },
  "香港": {
    title: "Hong Kong",
    location: "Hong Kong",
    region: "South China Coast",
    lat: 22.3193,
    lon: 114.1694,
    palette: ["#ead9d1", "#ab7158", "#473536"],
  },
  "黄山": {
    title: "Huangshan",
    location: "Anhui, China",
    region: "Mountain East China",
    lat: 29.7147,
    lon: 118.3376,
    palette: ["#dbe3dc", "#8ea093", "#404b45"],
  },
};

const directoryEntries = await fs.readdir(photosDir, { withFileTypes: true });

const folderData = (
  await Promise.all(
    directoryEntries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const match = entry.name.match(/^(.+?)_(\d{4})_(\d{2})$/);
        if (!match) {
          return null;
        }

        const [, placeKey, yearText, monthText] = match;
        const year = Number(yearText);
        const month = Number(monthText);
        const directoryPath = path.join(photosDir, entry.name);
        const files = (await fs.readdir(directoryPath))
          .filter((fileName) =>
            imageExtensions.has(path.extname(fileName).toLowerCase())
          )
          .sort((left, right) => left.localeCompare(right, "zh-Hans-CN"));

        if (files.length === 0) {
          return null;
        }

        return {
          key: entry.name,
          placeKey,
          year,
          month,
          files,
          metadata: placeMetadata[placeKey] || createFallbackMetadata(placeKey),
          missingMetadata: !placeMetadata[placeKey],
        };
      })
  )
).filter(Boolean);

folderData.sort(
  (left, right) =>
    right.year - left.year ||
    right.month - left.month ||
    left.placeKey.localeCompare(right.placeKey, "zh-Hans-CN")
);

const duplicateTotals = new Map();
for (const folder of folderData) {
  duplicateTotals.set(
    folder.placeKey,
    (duplicateTotals.get(folder.placeKey) || 0) + 1
  );
}

const duplicateSeen = new Map();
const photoSets = {};

const atlasStops = folderData.map((folder) => {
  const when = formatWhen(folder.year, folder.month);
  const duplicateTotal = duplicateTotals.get(folder.placeKey) || 1;
  const duplicateIndex = duplicateSeen.get(folder.placeKey) || 0;
  duplicateSeen.set(folder.placeKey, duplicateIndex + 1);

  const id = createStopId(folder, duplicateIndex);
  const title =
    duplicateTotal > 1 ? `${folder.metadata.title} / ${when}` : folder.metadata.title;
  const photoCount = folder.files.length;
  const photoNoun = photoCount === 1 ? "photo" : "photos";

  photoSets[id] = folder.files.map(
    (fileName) => `./photos/${folder.key}/${fileName}`
  );

  return {
    id,
    title,
    location: folder.metadata.location,
    region: folder.metadata.region,
    when,
    lat: folder.metadata.lat,
    lon:
      folder.metadata.lon +
      spreadDuplicateMarkers(duplicateTotal, duplicateIndex),
    summary: `${photoCount} ${photoNoun} from ${folder.metadata.title} in ${when}.`,
    palette: folder.metadata.palette,
    altLabel: title,
    caption: `${folder.metadata.title}, ${when}`,
  };
});

const output = `${buildHeader()}${JSON.stringify(
  photoSets,
  null,
  2
)};\n\nexport const atlasStops = ${JSON.stringify(
  atlasStops,
  null,
  2
)};\n\nfor (const stop of atlasStops) {\n  stop.photos = createPhotoSet(photoSets[stop.id], stop.altLabel, stop.caption);\n  delete stop.altLabel;\n  delete stop.caption;\n}\n`;

await fs.writeFile(outputFile, output, "utf8");

const missingMetadataKeys = folderData
  .filter((folder) => folder.missingMetadata)
  .map((folder) => folder.placeKey);

console.log(
  `Generated ${path.relative(rootDir, outputFile)} from ${folderData.length} folders.`
);
if (missingMetadataKeys.length > 0) {
  console.log(
    `Missing metadata for: ${missingMetadataKeys.join(", ")}. Added fallback values.`
  );
}

function buildHeader() {
  return [
    "function createPhotoSet(paths, label, caption) {",
    "  return paths.map((src, index) => ({",
    "    src,",
    "    alt: `${label} photo ${index + 1}`,",
    "    caption,",
    "  }));",
    "}",
    "",
    "const photoSets = ",
  ].join("\n");
}

function formatWhen(year, month) {
  return `${monthNames[month]} ${year}`;
}

function spreadDuplicateMarkers(total, index) {
  if (total <= 1) {
    return 0;
  }

  return (index - (total - 1) / 2) * 1.4;
}

function createFallbackMetadata(placeKey) {
  return {
    title: placeKey,
    location: placeKey,
    region: "Travel archive",
    lat: 0,
    lon: 0,
    palette: ["#e5ddd1", "#b88a64", "#4a3b35"],
  };
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function createStopId(folder, duplicateIndex) {
  const month = String(folder.month).padStart(2, "0");
  const base = slugify(`${folder.metadata.title}-${folder.year}-${month}`);

  if (base) {
    return base;
  }

  return `stop-${folder.year}-${month}-${duplicateIndex + 1}`;
}
