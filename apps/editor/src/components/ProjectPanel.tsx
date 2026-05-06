import { useState } from "react";
import { Folder, FolderPlus, MoreVertical, Search, Star } from "lucide-react";
import { ContextMenu, type ContextMenuState } from "./ContextMenu";
import { useEditorStore } from "../state/editorStore";

export function ProjectPanel() {
  const project = useEditorStore((state) => state.project);
  const [menu, setMenu] = useState<ContextMenuState | null>(null);

  function openMenu(event: React.MouseEvent) {
    event.preventDefault();
    setMenu({
      x: event.clientX,
      y: event.clientY,
      items: [
        { label: "Create Folder", onSelect: () => undefined },
        { label: "Import Asset", onSelect: () => undefined },
        { label: "Create Scene", onSelect: () => undefined },
        { label: "Reveal In Explorer", onSelect: () => undefined, separatorBefore: true }
      ]
    });
  }

  return (
    <aside className="panel project-panel" onContextMenu={openMenu}>
      <div className="panel-titlebar">
        <h2>Project</h2>
        <button title="Create folder" onClick={() => undefined}>
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
        <div className="asset-row nested">
          <Folder size={16} /> Materials
        </div>
        <div className="asset-row nested">
          <Folder size={16} /> Models
        </div>
        <div className="asset-row nested">
          <Folder size={16} /> Prefabs
        </div>
        <div className="asset-row nested">
          <Folder size={16} /> Scenes
        </div>
        <div className="asset-row nested">
          <Folder size={16} /> Sprites
        </div>
        <div className="asset-row nested">
          <Folder size={16} /> Audio
        </div>
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
