import type { TransformComponent } from "@gamify/scene-core";
import { useEditorStore } from "../state/editorStore";

export function InspectorPanel() {
  const scene = useEditorStore((state) => state.scene);
  const selectedEntityId = useEditorStore((state) => state.selectedEntityId);
  const setTransform = useEditorStore((state) => state.setTransform);
  const entity = scene.entities.find((candidate) => candidate.id === selectedEntityId);
  const transform = entity?.components.find((component): component is TransformComponent => component.type === "Transform");

  return (
    <aside className="panel inspector">
      <h2>Inspector</h2>
      {!entity ? <p>No entity selected.</p> : null}
      {entity ? <h3>{entity.name}</h3> : null}
      {entity && transform ? (
        <section className="component-editor">
          <h4>Transform</h4>
          {(["x", "y", "z"] as const).map((axis) => (
            <label key={axis}>
              Position {axis.toUpperCase()}
              <input
                type="number"
                value={transform.position[axis]}
                onChange={(event) =>
                  setTransform(entity.id, { position: { [axis]: Number(event.currentTarget.value) } })
                }
              />
            </label>
          ))}
        </section>
      ) : null}
      {entity?.components.map((component) => (
        <section className="component-editor" key={component.id}>
          <h4>{component.type}</h4>
          <code>{component.id}</code>
        </section>
      ))}
    </aside>
  );
}
