import type { Block, TextBlock } from "@/lib/ast/schema";

export function blockLabel(b: Block): string {
  if (b.name) return b.name;
  if (b.type === "text") {
    const t = b as TextBlock;
    const snippet = t.text.trim().slice(0, 28);
    if (snippet) return snippet;
    return t.role ?? "Text";
  }
  if (b.type === "image") return "Image";
  if (b.type === "group") return "Group";
  if (b.type === "shape") return b.shape ?? "Shape";
  return b.type;
}
