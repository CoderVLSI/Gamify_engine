import { useState } from "react";
import { Box, Circle, Copy, MoreVertical, Plus, Search, Square, Trash2 } from "lucide-react";
import { ContextMenu, type ContextMenuState } from "./ContextMenu";
import { useEditorStore } from "../state/editorStore";

export function HierarchyPanel() {
  const entities = useEditorStore((state) => state.scene.entities);
  const selectedEntityId = useEditorStore((state) => state.selectedEntityId);
  const selectEntity = useEditorStore((state) => state.selectEntity);
  const createEntity = useEditorStore((state) => state.createEntity);
  const createPrimitive = useEditorStore((state) => state.createPrimitive);
  const deleteSelectedEntity = useEditorStore((state) => state.deleteSelectedEntity);
  const duplicateSelectedEntity = useEditorStore((state) => state.duplicateSelectedEntity);
  const [menu, setMenu] = useState<ContextMenuState | null>(null);

  function openMenu(event: React.MouseEvent, entityId?: string) {
    event.preventDefault();
    if (entityId) selectEntity(entityId);
    setMenu({
      x: event.clientX,
      y: event.clientY,
      items: [
        { label: "Create Empty", onSelect: () => createEntity("Entity") },
        { label: "Create Cube", onSelect: () => createPrimitive("cube") },
        { label: "Create Sphere", onSelect: () => createPrimitive("sphere") },
        { label: "Create Plane", onSelect: () => createPrimitive("plane") },
        {
          label: "Duplicate Selected",
          onSelect: duplicateSelectedEntity,
          disabled: !entityId && !selectedEntityId,
          separatorBefore: true
        },
        {
          label: "Delete Selected",
          onSelect: deleteSelectedEntity,
          disabled: !entityId && !selectedEntityId,
          danger: true
        }
      ]
    });
  }

  return (
    <aside className="panel hierarchy" onContextMenu={(event) => openMenu(event)}>
      <div className="panel-titlebar">
        <h2>Hierarchy</h2>
        <button title="Create empty entity" onClick={() => createEntity("Entity")}>
          <Plus size={15} />
        </button>
        <button title="Hierarchy options" onClick={(event) => openMenu(event)}>
          <MoreVertical size={15} />
        </button>
      </div>
      <label className="panel-search">
        <Search size={14} />
        <input placeholder="All" />
      </label>
      <div className="hierarchy-list">
        {entities.map((entity) => (
          <button
            className={entity.id === selectedEntityId ? "entity-row selected" : "entity-row"}
            key={entity.id}
            onClick={() => selectEntity(entity.id)}
            onContextMenu={(event) => openMenu(event, entity.id)}
          >
            {entity.components.some((component) => component.type === "MeshRenderer3D" && component.primitive === "sphere") ? (
              <Circle size={15} />
            ) : entity.components.some((component) => component.type === "MeshRenderer3D" && component.primitive === "plane") ? (
              <Square size={15} />
            ) : (
              <Box size={15} />
            )}
            <span>{entity.name}</span>
          </button>
        ))}
      </div>
      <div className="panel-footer-actions">
        <button disabled={!selectedEntityId} title="Duplicate selected" onClick={duplicateSelectedEntity}>
          <Copy size={14} />
        </button>
        <button disabled={!selectedEntityId} title="Delete selected" onClick={deleteSelectedEntity}>
          <Trash2 size={14} />
        </button>
      </div>
      <ContextMenu menu={menu} onClose={() => setMenu(null)} />
    </aside>
  );
}
