import type { MenuData, MenuItem } from "./types";

const FALLBACK = "/images/menu-fallback.svg";

function isUsableImage(url: string | null | undefined): url is string {
  if (!url) return false;
  return !/no_image/i.test(url);
}

function resolveCategoryPhoto(items: MenuItem[]): string {
  const fromItem = items.map((i) => i.image).find(isUsableImage);
  return fromItem ?? FALLBACK;
}

/** Ensures every item has a display image (own photo, category photo, or fallback). */
export function enrichMenuWithImages(data: MenuData): MenuData {
  return {
    ...data,
    categories: data.categories.map((cat) => {
      const categoryPhoto = isUsableImage(cat.image)
        ? cat.image
        : resolveCategoryPhoto(cat.items);

      return {
        ...cat,
        image: categoryPhoto,
        items: cat.items.map((item) => ({
          ...item,
          image: isUsableImage(item.image) ? item.image : categoryPhoto,
        })),
      };
    }),
  };
}
