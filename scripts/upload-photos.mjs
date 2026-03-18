import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PHOTOS_DIR = path.join(__dirname, "..", "public", "photos");

// Load .env
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

// Chinese folder name → ASCII folder name mapping
// Format: country_city_YYYY_MM (or just location_YYYY_MM)
const FOLDER_MAP = {
  "日本_2026_02": "japan_2026_02",
  "香港_2025_09": "hongkong_2025_09",
  "香格里拉_2025_07": "china_shangrila_2025_07",
  "云南_2025_07": "china_yunnan_2025_07",
  "日本_2025_06": "japan_2025_06",
  "桂林_2025_05": "china_guilin_2025_05",
  "圣巴巴拉_2023_12": "usa_santabarbara_2023_12",
  "西藏_2022_08": "china_tibet_2022_08",
  "上海_2021_06": "china_shanghai_2021_06",
  "北京_2019_12": "china_beijing_2019_12",
  "香港_2019_01": "hongkong_2019_01",
  "杭州_2018_11": "china_hangzhou_2018_11",
  "合肥_2018_09": "china_hefei_2018_09",
  "斯里兰卡_2018_02": "srilanka_2018_02",
  "天津_2017_10": "china_tianjin_2017_10",
  "巴厘岛_2017_07": "indonesia_bali_2017_07",
  "黄山_2017_06": "china_huangshan_2017_06",
};

const mimeTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
};

async function upload(localPath, storagePath, contentType) {
  const body = fs.readFileSync(localPath);
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURI(storagePath)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body,
  });

  if (res.ok) {
    console.log(`OK  ${storagePath}`);
  } else {
    const text = await res.text();
    console.error(`ERR ${storagePath} → ${res.status} ${text}`);
  }
}

// Scan local photo directories
const folders = fs
  .readdirSync(PHOTOS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory());

let totalFiles = 0;

for (const folder of folders) {
  const asciiName = FOLDER_MAP[folder.name];
  if (!asciiName) {
    console.warn(`SKIP unknown folder: ${folder.name} (add to FOLDER_MAP)`);
    continue;
  }

  const folderPath = path.join(PHOTOS_DIR, folder.name);
  const files = fs
    .readdirSync(folderPath)
    .filter((f) => /\.(jpg|jpeg|png|gif|webp|mp4|mov)$/i.test(f))
    .sort();

  console.log(`\n${folder.name} → ${asciiName} (${files.length} files)`);

  // Upload in batches of 5, with sequential numbering (001.jpg, 002.jpg, ...)
  for (let i = 0; i < files.length; i += 5) {
    const batch = files.slice(i, i + 5);
    await Promise.all(
      batch.map((file, j) => {
        const idx = i + j;
        const ext = path.extname(file).toLowerCase();
        const newName = `${String(idx + 1).padStart(3, "0")}${ext}`;
        const storagePath = `${asciiName}/${newName}`;
        const localPath = path.join(folderPath, file);
        const contentType = mimeTypes[ext] || "application/octet-stream";
        totalFiles++;
        return upload(localPath, storagePath, contentType);
      })
    );
  }
}

console.log(`\nDone! Uploaded ${totalFiles} files.`);
