import menuJson from "@/data/menu.json";
import { enrichMenuWithImages } from "./enrich-menu-images";
import type { MenuData } from "./types";

export function getMenu(): MenuData {
  return enrichMenuWithImages(menuJson as MenuData);
}
