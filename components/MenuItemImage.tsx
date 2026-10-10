"use client";

import Image from "next/image";
import { useState } from "react";

const FALLBACK = "/images/menu-fallback.svg";

type Props = {
  src: string | null;
  alt: string;
  categoryFallback?: string | null;
};

export function MenuItemImage({ src, alt, categoryFallback }: Props) {
  const [current, setCurrent] = useState(
    src || categoryFallback || FALLBACK
  );

  return (
    <Image
      src={current}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, 33vw"
      unoptimized={current.startsWith("http")}
      referrerPolicy="no-referrer"
      onError={() => {
        if (current !== categoryFallback && categoryFallback) {
          setCurrent(categoryFallback);
        } else if (current !== FALLBACK) {
          setCurrent(FALLBACK);
        }
      }}
    />
  );
}
