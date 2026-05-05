import { useEditorStore } from "../state/editorStore";

export function HierarchyPanel() {
  const entities = useEditorStore((state) => state.scene.entities);
  const selectedEntityId = useEditorStore((state) => state.selectedEntityId);
  const selectEntity = useEditorStore((state) => state.selectEntity);

  return (
    <aside className="panel hierarchy">
      <h2>Hierarchy</h2>
      {entities.map((entity) => (
        <button
          className={entity.id === selectedEntityId ? "entity-row selected" : "entity-row"}
          key={entity.id}
          onClick={() => selectEntity(entity.id)}
        >
          {entity.name}
        </button>
      ))}
    </aside>
  );
}
