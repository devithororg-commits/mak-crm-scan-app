import type { Viewport } from "./store";

export type ViewportDims = { w: number; h: number; label: string };

export const VIEWPORT_DIMS: Record<Viewport, ViewportDims> = {
  desktop: { w: 1920, h: 1080, label: "16:9 Desktop" },
  tablet: { w: 1024, h: 1366, label: "Tablet" },
  mobile: { w: 1080, h: 1920, label: "9:16 Mobile" },
};

export function viewportDims(v: Viewport): ViewportDims {
  return VIEWPORT_DIMS[v];
}
