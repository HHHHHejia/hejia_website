/**
 * Migrate flat folder structure to tree structure in Supabase Storage.
 *
 * Before: japan_2026_02/001.jpg
 * After:  japan/japan/2026-02_001.jpg
 *
 * Run: node scripts/migrate-tree.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^(\w+)=(.*)$/);
    if (match) process.env[match[1]] = match[2];
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BUCKET = "photos";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

// Flat location key → [country, city]
const LOCATION_MAP = {
  china_beijing: ["china", "beijing"],
  china_guilin: ["china", "guilin"],
  china_hangzhou: ["china", "hangzhou"],
  china_hefei: ["china", "hefei"],
  china_huangshan: ["china", "huangshan"],
  china_shanghai: ["china", "shanghai"],
  china_shangrila: ["china", "shangrila"],
  china_tianjin: ["china", "tianjin"],
  china_tibet: ["china", "tibet"],
  china_yunnan: ["china", "yunnan"],
  hongkong: ["china", "hongkong"],
  indonesia_bali: ["indonesia", "bali"],
  japan: ["japan", "japan"],
  srilanka: ["srilanka", "srilanka"],
  usa_santabarbara: ["usa", "santabarbara"],
};

async function listFolders() {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ prefix: "", limit: 1000 }),
  });
  const items = await res.json();
  return items.filter((i) => i.id === null && !i.name.startsWith(".")).map((i) => i.name);
}

async function listFiles(folder) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ prefix: folder, limit: 1000 }),
  });
  const items = await res.json();
  return items
    .filter((i) => i.id !== null && !i.name.startsWith("."))
    .map((i) => i.name);
}

async function moveFile(sourceKey, destinationKey) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/move`, {
    method: "POST",
    headers,
    body: JSON.stringify({ bucketId: BUCKET, sourceKey, destinationKey }),
  });
  if (res.ok) {
    console.log(`  MOVE ${sourceKey} → ${destinationKey}`);
  } else {
    const text = await res.text();
    console.error(`  ERR  ${sourceKey} → ${res.status} ${text}`);
  }
}

async function deleteFolder(folder) {
  // Delete the .emptyFolderPlaceholder if it exists
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ prefixes: [`${folder}/.emptyFolderPlaceholder`] }),
  });
  if (res.ok) console.log(`  DEL  ${folder}/`);
}

// Main
const folders = await listFolders();
console.log(`Found ${folders.length} folders\n`);

let moved = 0;

for (const folder of folders) {
  // Extract location key and date from folder name (e.g., "japan_2026_02" → key="japan", date="2026-02")
  const dateMatch = folder.match(/_(\d{4})_(\d{2})$/);
  if (!dateMatch) {
    console.log(`SKIP ${folder} (no date suffix)`);
    continue;
  }

  const locationKey = folder.replace(/_\d{4}_\d{2}$/, "");
  const datePart = `${dateMatch[1]}-${dateMatch[2]}`;
  const mapping = LOCATION_MAP[locationKey];

  if (!mapping) {
    console.log(`SKIP ${folder} (unknown location: ${locationKey})`);
    continue;
  }

  const [country, city] = mapping;
  const files = await listFiles(folder);
  console.log(`${folder} → ${country}/${city}/ (${files.length} files, date: ${datePart})`);

  // Move files in batches of 5
  for (let i = 0; i < files.length; i += 5) {
    const batch = files.slice(i, i + 5);
    await Promise.all(
      batch.map((file) => {
        const sourceKey = `${folder}/${file}`;
        const destinationKey = `${country}/${city}/${datePart}_${file}`;
        moved++;
        return moveFile(sourceKey, destinationKey);
      })
    );
  }

  // Clean up empty folder
  await deleteFolder(folder);
}

console.log(`\nDone! Moved ${moved} files.`);
