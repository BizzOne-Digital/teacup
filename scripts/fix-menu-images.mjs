/** Fill missing item images in data/menu.json (category photo or fallback). */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const menuPath = path.join(__dirname, "..", "data", "menu.json");
const FALLBACK = "/images/menu-fallback.svg";

function isUsable(url) {
  return url && typeof url === "string" && !/no_image/i.test(url);
}

const menu = JSON.parse(fs.readFileSync(menuPath, "utf8").replace(/^\uFEFF/, ""));
let filled = 0;

for (const cat of menu.categories) {
  const categoryPhoto =
    (isUsable(cat.image) ? cat.image : null) ||
    cat.items.map((i) => i.image).find(isUsable) ||
    FALLBACK;
  cat.image = categoryPhoto;
  for (const item of cat.items) {
    if (!isUsable(item.image)) {
      item.image = categoryPhoto;
      filled++;
    }
  }
}

fs.writeFileSync(menuPath, JSON.stringify(menu, null, 2));
const nulls = menu.categories.reduce(
  (n, c) => n + c.items.filter((i) => !i.image).length,
  0
);
console.log(`Updated menu.json — filled ${filled} items, remaining without image: ${nulls}`);
