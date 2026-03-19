/**
 * One-time migration: move all files from country/city/photo.jpg → country/city/none/photo.jpg
 * This adds the attraction layer with "none" as default.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(__dirname, "../.env"), "utf8");
const env = Object.fromEntries(
  envText.split("\n").filter(Boolean).map((l) => l.split("=").map((s, i) => (i === 0 ? s.trim() : s.trim())))
    .map(([k, ...v]) => [k, v.join("=")])
);

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY;
const BUCKET = "photos";

async function listItems(prefix) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefix, limit: 1000 }),
  });
  if (!res.ok) throw new Error(`list(${prefix}) failed: ${res.status}`);
  return await res.json();
}

async function moveFile(from, to) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/move`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bucketId: BUCKET,
      sourceKey: from,
      destinationKey: to,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`move ${from} → ${to} failed: ${res.status} ${text}`);
  }
}

async function main() {
  console.log("Discovering countries...");
  const countries = (await listItems(""))
    .filter((i) => i.id === null && !i.name.startsWith("."))
    .map((i) => i.name);
  console.log(`Found ${countries.length} countries:`, countries);

  for (const country of countries) {
    const cities = (await listItems(country))
      .filter((i) => i.id === null && !i.name.startsWith("."))
      .map((i) => i.name);

    for (const city of cities) {
      const prefix = `${country}/${city}`;
      const items = await listItems(prefix);

      // Get files (not folders) at this level
      const files = items.filter(
        (i) => i.id !== null && !i.name.startsWith(".") &&
          /\.(jpg|jpeg|png|webp|gif|mp4|mov)$/i.test(i.name)
      );

      if (files.length === 0) {
        console.log(`  ${prefix}: no files to move (may already have attraction folders)`);
        continue;
      }

      console.log(`  ${prefix}: moving ${files.length} files → ${prefix}/none/`);

      for (const file of files) {
        const from = `${prefix}/${file.name}`;
        const to = `${prefix}/none/${file.name}`;
        process.stdout.write(`    ${file.name} ... `);
        await moveFile(from, to);
        console.log("ok");
      }
    }
  }

  console.log("\nDone! All files moved to country/city/none/ structure.");
}

main().catch(console.error);
