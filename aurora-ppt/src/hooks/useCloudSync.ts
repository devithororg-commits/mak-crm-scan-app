import { useEffect, useRef, useState } from "react";
import { useEditor } from "@/lib/editor/store";

export type CloudSyncStatus = "offline" | "idle" | "saving" | "saved" | "error";

const DECK_ID_KEY = "aurora-cloud-deck-id";
const DEBOUNCE_MS = 2500;

function apiBase(): string {
  if (typeof window === "undefined") return "/api";
  const { origin, pathname } = window.location;
  if (pathname.includes("/aurora-ppt")) {
    return `${origin}/api`;
  }
  return `${origin}/api`;
}

export function useCloudSync() {
  const deck = useEditor((s) => s.deck);
  const hydrated = useEditor((s) => s.hydrated);
  const [status, setStatus] = useState<CloudSyncStatus>("offline");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const deckIdRef = useRef(typeof localStorage !== "undefined" ? localStorage.getItem(DECK_ID_KEY) ?? "" : "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);

  useEffect(() => {
    if (!hydrated) return;

    const checkHealth = async (): Promise<boolean> => {
      try {
        const res = await fetch(`${apiBase()}/health.php`, { method: "GET" });
        if (!res.ok) return false;
        const data = await res.json();
        return data?.ok === true;
      } catch {
        return false;
      }
    };

    const save = async () => {
      if (savingRef.current) return;
      const online = await checkHealth();
      if (!online) {
        setStatus("offline");
        return;
      }

      savingRef.current = true;
      setStatus("saving");
      const id = deckIdRef.current;
      const url = id ? `${apiBase()}/decks.php?id=${encodeURIComponent(id)}` : `${apiBase()}/decks.php`;
      const method = id ? "PUT" : "POST";

      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: id || undefined,
            title: deck.title,
            ast: deck,
            ast_version: deck.version ?? 1,
            theme_id: deck.theme?.id ?? "noir",
          }),
        });
        const data = await res.json();
        if (!res.ok || !data?.ok) {
          setStatus("error");
          return;
        }
        if (data.id && data.id !== deckIdRef.current) {
          deckIdRef.current = data.id;
          localStorage.setItem(DECK_ID_KEY, data.id);
        }
        setLastSaved(new Date());
        setStatus("saved");
      } catch {
        setStatus("error");
      } finally {
        savingRef.current = false;
      }
    };

    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus((s) => (s === "offline" ? "idle" : s));
    timerRef.current = setTimeout(save, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [deck, hydrated]);

  return { status, lastSaved };
}
