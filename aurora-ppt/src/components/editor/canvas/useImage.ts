import { useEffect, useState } from "react";

const cache = new Map<string, HTMLImageElement>();

export function useImage(src: string): HTMLImageElement | null {
  const [img, setImg] = useState<HTMLImageElement | null>(() => cache.get(src) ?? null);

  useEffect(() => {
    const cached = cache.get(src);
    if (cached) {
      setImg(cached);
      return;
    }
    let alive = true;
    const el = new window.Image();
    el.crossOrigin = "anonymous";
    el.onload = () => {
      cache.set(src, el);
      if (alive) setImg(el);
    };
    el.onerror = () => alive && setImg(null);
    el.src = src;
    return () => {
      alive = false;
    };
  }, [src]);

  return img;
}
