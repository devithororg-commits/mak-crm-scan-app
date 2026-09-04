import { Circle, Heading1, Image as ImageIcon, Minus, Monitor, Play, Redo2, Smartphone, Square, Tag, Tablet, Type, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { defaultBlock } from "@/lib/ast/defaults";
import { useEditor, type Viewport } from "@/lib/editor/store";
import { VIEWPORT_DIMS } from "@/lib/editor/viewport";

const VIEWPORT_OPTIONS: { id: Viewport; icon: typeof Monitor; title: string }[] = [
  { id: "desktop", icon: Monitor, title: VIEWPORT_DIMS.desktop.label },
  { id: "tablet", icon: Tablet, title: VIEWPORT_DIMS.tablet.label },
  { id: "mobile", icon: Smartphone, title: VIEWPORT_DIMS.mobile.label },
];

export function Toolbar() {
  const title = useEditor((s) => s.deck.title);
  const setTitle = useEditor((s) => s.setTitle);
  const addBlock = useEditor((s) => s.addBlock);
  const undo = useEditor((s) => s.undo);
  const redo = useEditor((s) => s.redo);
  const canUndo = useEditor((s) => s.past.length > 0);
  const canRedo = useEditor((s) => s.future.length > 0);
  const zoom = useEditor((s) => s.zoom);
  const setZoom = useEditor((s) => s.setZoom);
  const viewport = useEditor((s) => s.viewport);
  const setViewport = useEditor((s) => s.setViewport);
  const setPan = useEditor((s) => s.setPan);
  const setPresenting = useEditor((s) => s.setPresenting);

  const insertImage = () => {
    const url = window.prompt("Image URL");
    if (url) addBlock(defaultBlock("image", url.trim()));
  };

  return (
    <header className="panel flex h-12 shrink-0 items-center gap-1 border-b px-3">
      <div className="mr-3 flex items-baseline gap-2">
        <span className="font-display text-lg leading-none tracking-tight">Aurora Studio</span>
        <span className="eyebrow">PPT</span>
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="field h-7 w-52 bg-transparent text-xs"
        aria-label="Deck title"
      />

      <span className="mx-3 h-5 w-px bg-border" />

      <button className="tool-btn" title="Display headline" onClick={() => addBlock(defaultBlock("display"))}>
        <Heading1 /> <span className="hidden lg:inline">Display</span>
      </button>
      <button className="tool-btn" title="Heading" onClick={() => addBlock(defaultBlock("heading"))}>
        <Type /> <span className="hidden lg:inline">Heading</span>
      </button>
      <button className="tool-btn" title="Body text" onClick={() => addBlock(defaultBlock("body"))}>
        <span className="font-sans text-[13px]">¶</span> <span className="hidden lg:inline">Body</span>
      </button>
      <button className="tool-btn" title="Kicker label" onClick={() => addBlock(defaultBlock("kicker"))}>
        <Tag /> <span className="hidden lg:inline">Kicker</span>
      </button>

      <span className="mx-2 h-5 w-px bg-border" />

      <button className="tool-btn" title="Rectangle" onClick={() => addBlock(defaultBlock("rect"))}>
        <Square />
      </button>
      <button className="tool-btn" title="Ellipse" onClick={() => addBlock(defaultBlock("ellipse"))}>
        <Circle />
      </button>
      <button className="tool-btn" title="Rule" onClick={() => addBlock(defaultBlock("line"))}>
        <Minus />
      </button>
      <button className="tool-btn" title="Image" onClick={insertImage}>
        <ImageIcon />
      </button>

      <span className="mx-2 h-5 w-px bg-border" />

      <button className="tool-btn" title="Undo (⌘Z)" onClick={undo} disabled={!canUndo}>
        <Undo2 />
      </button>
      <button className="tool-btn" title="Redo (⇧⌘Z)" onClick={redo} disabled={!canRedo}>
        <Redo2 />
      </button>

      <div className="ml-auto flex items-center gap-1">
        <span className="eyebrow mr-1 hidden md:inline">Viewport</span>
        {VIEWPORT_OPTIONS.map(({ id, icon: Icon, title: vpTitle }) => (
          <button
            key={id}
            className="tool-btn data-[active=true]:bg-accent/15 data-[active=true]:text-accent"
            data-active={viewport === id}
            title={vpTitle}
            onClick={() => {
              setViewport(id);
              setPan({ x: 0, y: 0 });
              setZoom(1);
            }}
          >
            <Icon className="!h-3.5 !w-3.5" />
          </button>
        ))}
        <span className="mx-2 h-5 w-px bg-border" />
        <button className="tool-btn" onClick={() => setZoom(zoom / 1.2)} title="Zoom out">
          <ZoomOut />
        </button>
        <button className="tool-btn w-14 font-mono text-[11px] tabular-nums" onClick={() => setZoom(1)} title="Reset zoom">
          {Math.round(zoom * 100)}%
        </button>
        <button className="tool-btn" onClick={() => setZoom(zoom * 1.2)} title="Zoom in">
          <ZoomIn />
        </button>
        <span className="mx-2 h-5 w-px bg-border" />
        <button
          className="inline-flex h-8 items-center gap-2 rounded-sm bg-accent px-3 text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          onClick={() => setPresenting(true)}
        >
          <Play className="h-3.5 w-3.5 fill-current" /> Present
        </button>
      </div>
    </header>
  );
}
