import { EDITORIAL_GREEN, GALLERY_WHITE, NOIR, type Theme } from "./defaults";

export const PREMIUM_THEMES: Theme[] = [
  NOIR,
  EDITORIAL_GREEN,
  GALLERY_WHITE,
  {
    id: "midnight-violet",
    name: "Midnight Violet",
    colors: { background: "#0D0B1A", surface: "#1A1630", foreground: "#F4F0FF", muted: "#9B93B8", accent: "#A78BFA", line: "#F4F0FF1A" },
    fonts: { display: "Fraunces", body: "Manrope", mono: "JetBrains Mono" },
  },
  {
    id: "carbon-lime",
    name: "Carbon Lime",
    colors: { background: "#050505", surface: "#141414", foreground: "#F5F5F5", muted: "#8A8A8A", accent: "#C8F542", line: "#F5F5F51A" },
    fonts: { display: "Fraunces", body: "Manrope", mono: "JetBrains Mono" },
  },
  {
    id: "ocean-teal",
    name: "Ocean Teal",
    colors: { background: "#041218", surface: "#0C2430", foreground: "#E8F4F8", muted: "#7BA3B0", accent: "#2DD4BF", line: "#E8F4F81A" },
    fonts: { display: "Fraunces", body: "Manrope", mono: "JetBrains Mono" },
  },
  {
    id: "rose-gold",
    name: "Rose Gold",
    colors: { background: "#120E0C", surface: "#241C18", foreground: "#FAF0EB", muted: "#B8A396", accent: "#E8B4A0", line: "#FAF0EB1A" },
    fonts: { display: "Fraunces", body: "Manrope", mono: "JetBrains Mono" },
  },
  {
    id: "corporate-navy",
    name: "Corporate Navy",
    colors: { background: "#0B1426", surface: "#152238", foreground: "#F0F4FA", muted: "#8FA3BF", accent: "#3B82F6", line: "#F0F4FA1A" },
    fonts: { display: "Fraunces", body: "Manrope", mono: "JetBrains Mono" },
  },
  {
    id: "warm-sand",
    name: "Warm Sand",
    colors: { background: "#F5F0E8", surface: "#EBE4D8", foreground: "#1C1917", muted: "#78716C", accent: "#B45309", line: "#1C19171A" },
    fonts: { display: "Fraunces", body: "Manrope", mono: "JetBrains Mono" },
  },
  {
    id: "scarlet-bold",
    name: "Scarlet Bold",
    colors: { background: "#140808", surface: "#2A1010", foreground: "#FFF5F5", muted: "#C4A0A0", accent: "#EF4444", line: "#FFF5F51A" },
    fonts: { display: "Fraunces", body: "Manrope", mono: "JetBrains Mono" },
  },
  {
    id: "lavender-dream",
    name: "Lavender Dream",
    colors: { background: "#12101C", surface: "#1E1A2E", foreground: "#F5F0FF", muted: "#A89EC4", accent: "#C4B5FD", line: "#F5F0FF1A" },
    fonts: { display: "Fraunces", body: "Manrope", mono: "JetBrains Mono" },
  },
  {
    id: "forest-luxe",
    name: "Forest Luxe",
    colors: { background: "#08120E", surface: "#122820", foreground: "#ECFDF5", muted: "#86B09A", accent: "#34D399", line: "#ECFDF51A" },
    fonts: { display: "Fraunces", body: "Manrope", mono: "JetBrains Mono" },
  },
  {
    id: "copper-industrial",
    name: "Copper Industrial",
    colors: { background: "#100E0C", surface: "#201A14", foreground: "#FAF5F0", muted: "#A8947E", accent: "#D97706", line: "#FAF5F01A" },
    fonts: { display: "Fraunces", body: "Manrope", mono: "JetBrains Mono" },
  },
  {
    id: "ice-minimal",
    name: "Ice Minimal",
    colors: { background: "#F8FAFC", surface: "#EEF2F7", foreground: "#0F172A", muted: "#64748B", accent: "#0EA5E9", line: "#0F172A14" },
    fonts: { display: "Fraunces", body: "Manrope", mono: "JetBrains Mono" },
  },
  {
    id: "neon-tokyo",
    name: "Neon Tokyo",
    colors: { background: "#080810", surface: "#12121F", foreground: "#F8F8FF", muted: "#9494B8", accent: "#F472B6", line: "#F8F8FF1A" },
    fonts: { display: "Fraunces", body: "Manrope", mono: "JetBrains Mono" },
  },
  {
    id: "champagne",
    name: "Champagne",
    colors: { background: "#141210", surface: "#242018", foreground: "#FAF6EE", muted: "#B8A88E", accent: "#F5E6C8", line: "#FAF6EE1A" },
    fonts: { display: "Fraunces", body: "Manrope", mono: "JetBrains Mono" },
  },
  {
    id: "slate-pro",
    name: "Slate Pro",
    colors: { background: "#0F1419", surface: "#1A2332", foreground: "#F1F5F9", muted: "#94A3B8", accent: "#60A5FA", line: "#F1F5F91A" },
    fonts: { display: "Fraunces", body: "Manrope", mono: "JetBrains Mono" },
  },
  {
    id: "magenta-pulse",
    name: "Magenta Pulse",
    colors: { background: "#100A12", surface: "#1E1220", foreground: "#FDF2F8", muted: "#C49AB8", accent: "#E879F9", line: "#FDF2F81A" },
    fonts: { display: "Fraunces", body: "Manrope", mono: "JetBrains Mono" },
  },
];

export function themeById(id: string): Theme {
  return PREMIUM_THEMES.find((t) => t.id === id) ?? NOIR;
}
