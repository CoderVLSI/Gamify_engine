import { useState } from "react";
import { AudioLines, Box, Clapperboard, Folder, FolderPlus, Image, Layers, MoreVertical, Music, Search, Star } from "lucide-react";
import { ContextMenu, type ContextMenuState } from "./ContextMenu";
import { useEditorStore } from "../state/editorStore";

export function ProjectPanel() {
  const project = useEditorStore((state) => state.project);
  const addAsset = useEditorStore((state) => state.addAsset);
  const addAnimationClip = useEditorStore((state) => state.addAnimationClip);
  const [menu, setMenu] = useState<ContextMenuState | null>(null);

  function openMenu(event: React.MouseEvent) {
    event.preventDefault();
    setMenu({
      x: event.clientX,
      y: event.clientY,
      items: [
        { label: "Add Sprite Sheet", onSelect: () => addAsset("spritesheet", { name: "New Sprite Sheet", path: "assets/sprites/new-sheet.png", tags: ["2d"] }) },
        { label: "Add Animation Clip", onSelect: () => addAnimationClip({ name: "New Clip" }) },
        { label: "Add 3D Model", onSelect: () => addAsset("model", { name: "New Model", path: "assets/models/new-model.glb", tags: ["3d"] }) },
        { label: "Add Music Loop", onSelect: () => addAsset("music", { name: "New Music", path: "assets/audio/new-loop.ogg", tags: ["audio"] }) },
        { label: "Reveal In Explorer", onSelect: () => undefined, separatorBefore: true }
      ]
    });
  }

  return (
    <aside className="panel project-panel" onContextMenu={openMenu}>
      <div className="panel-titlebar">
        <h2>Project</h2>
        <button title="Add sprite sheet" onClick={() => addAsset("spritesheet", { name: "New Sprite Sheet", path: "assets/sprites/new-sheet.png", tags: ["2d"] })}>
          <FolderPlus size={15} />
        </button>
        <button title="Project options" onClick={openMenu}>
          <MoreVertical size={15} />
        </button>
      </div>
      <div className="project-tools">
        <label className="panel-search">
          <Search size={14} />
          <input placeholder="Search assets" />
        </label>
        <button title="Favorites">
          <Star size={15} />
        </button>
      </div>
      <div className="asset-tree">
        <div className="asset-row">
          <Folder size={16} /> Assets
        </div>
        {project.assets.map((asset) => (
          <div className="asset-row nested asset-record" key={asset.id} title={asset.path}>
            <AssetIcon kind={asset.kind} />
            <span>{asset.name}</span>
            <small>{asset.kind}</small>
          </div>
        ))}
        <div className="asset-row">
          <Clapperboard size={16} /> Animation Clips
        </div>
        {project.animationClips.map((clip) => (
          <div className="asset-row nested asset-record" key={clip.id}>
            <Clapperboard size={16} />
            <span>{clip.name}</span>
            <small>{clip.frameCount}f @ {clip.fps}fps</small>
          </div>
        ))}
        <div className="asset-row muted">
          <Folder size={16} /> Packages
        </div>
      </div>
      <div className="project-meta">
        <span>{project.name}</span>
        <span>{project.defaultScenePath}</span>
      </div>
      <ContextMenu menu={menu} onClose={() => setMenu(null)} />
    </aside>
  );
}

function AssetIcon({ kind }: { kind: string }) {
  if (kind === "model" || kind === "material") return <Box size={16} />;
  if (kind === "audio") return <AudioLines size={16} />;
  if (kind === "music") return <Music size={16} />;
  if (kind === "card") return <Layers size={16} />;
  return <Image size={16} />;
}
