/**
 * Re-fetch menu from Tea Cup Cafe (Restolabs API) into data/menu.json
 * Run: node scripts/scrape-menu.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  pickCategoryImage,
  pickMenuItemImage,
} from "./menu-image.mjs";

const MENU_FALLBACK = "/images/menu-fallback.svg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROFILE_ID = "1402377";
const LOCATION_ID = "1402381";

const body = {
  profile_id: PROFILE_ID,
  api_key: "bypass",
  location_id: LOCATION_ID,
  customize_data: false,
  language: "en",
  app_version: 7,
};

const res = await fetch("https://app1.restolabs.com/api/profile", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
if (!res.ok) throw new Error(`API ${res.status}`);
const json = await res.json();
const rawLocation = json.response?.location;
const location = Array.isArray(rawLocation) ? rawLocation[0] : rawLocation;
const blocks = location?.menu;
if (!Array.isArray(blocks)) {
  throw new Error(
    `Unexpected menu shape (success=${json.success}, keys=${Object.keys(json.response ?? {}).join(",")})`
  );
}

const categories = [];
for (const block of blocks) {
  if (!block?.title || !Array.isArray(block.menu_item)) continue;
  const categoryImage = pickCategoryImage(block);
  const items = block.menu_item
    .filter((i) => i.item_availability === 1)
    .map((i) => ({
      id: String(i.id),
      name: String(i.title).trim(),
      description: i.description || "",
      price: Number(i.price) || 0,
      image: pickMenuItemImage(i),
    }));

  const categoryPhoto =
    categoryImage ||
    items.map((it) => it.image).find(Boolean) ||
    MENU_FALLBACK;

  for (const it of items) {
    if (!it.image) it.image = categoryPhoto;
  }

  if (!items.length) continue;
  categories.push({
    id: String(block.id),
    name: block.title,
    image: categoryPhoto,
    items,
  });
}

const out = {
  storeName: "Tea Cup Cafe",
  categories,
};
const outPath = path.join(__dirname, "..", "data", "menu.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
const itemCount = categories.reduce((a, c) => a + c.items.length, 0);
const withOwnPhoto = categories.reduce(
  (n, c) => n + c.items.filter((i) => i.image && i.image !== MENU_FALLBACK && i.image !== c.image).length,
  0
);
console.log(
  `Saved ${categories.length} categories, ${itemCount} items (${withOwnPhoto} with unique photos)`
);
