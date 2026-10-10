export function isPlaceholderImage(url) {
  if (!url || typeof url !== "string") return true;
  return /no_image/i.test(url);
}

/** Best product photo from Restolabs item payload. */
export function pickMenuItemImage(item) {
  const candidates = [
    item.zoomed_image_url,
    item.image_url,
    ...(Array.isArray(item.multi_image)
      ? item.multi_image.map((m) => m?.image_url || m?.url)
      : []),
  ].filter(Boolean);

  for (const url of candidates) {
    if (!isPlaceholderImage(url)) return url;
  }
  return null;
}

export function pickCategoryImage(block) {
  const url = block?.image_url;
  return url && !isPlaceholderImage(url) ? url : null;
}
