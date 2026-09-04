import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

// The canvas engine touches window at import time, so it only loads in the browser.
const Editor = lazy(() => import("@/components/editor/Editor"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurora Studio PPT — Living Slide Editor" },
      { name: "description", content: "Canvas-native presentation editor with editorial typography, typed slide structure, and 60fps editing." },
      { property: "og:title", content: "Aurora Studio PPT — Living Slide Editor" },
      { property: "og:description", content: "A canvas-native presentation editor with editorial typography and fluid block layouts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Shell() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-canvas">
      <div className="text-center">
        <p className="font-display text-3xl tracking-tight">Aurora</p>
        <p className="eyebrow mt-2">Loading canvas</p>
      </div>
    </div>
  );
}

function Index() {
  return (
    <ClientOnly fallback={<Shell />}>
      <Suspense fallback={<Shell />}>
        <Editor />
      </Suspense>
    </ClientOnly>
  );
}
