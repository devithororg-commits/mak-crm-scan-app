import editorialImage from "@/assets/editorial-botanical.jpg";

/** Curated Unsplash hero imagery — stable CDN URLs for premium templates. */
export const STOCK_IMAGES: Record<string, string> = {
  botanical: editorialImage,
  marble: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80&auto=format",
  architecture: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1920&q=80&auto=format",
  tech: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80&auto=format",
  team: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80&auto=format",
  fashion: "https://images.unsplash.com/photo-1483985988359-763728e1935b?w=1920&q=80&auto=format",
  product: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1920&q=80&auto=format",
  nature: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&auto=format",
  abstract: "https://images.unsplash.com/photo-1614850523459-c9f403c7f263?w=1920&q=80&auto=format",
  workspace: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80&auto=format",
  city: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80&auto=format",
  gradient: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80&auto=format",
  luxury: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80&auto=format",
};

export const IMAGE_KEYS = Object.keys(STOCK_IMAGES);
