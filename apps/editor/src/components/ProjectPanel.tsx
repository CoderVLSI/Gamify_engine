import { useEditorStore } from "../state/editorStore";

export function ProjectPanel() {
  const project = useEditorStore((state) => state.project);

  return (
    <aside className="panel project-panel">
      <h2>Project</h2>
      <dl>
        <dt>Name</dt>
        <dd>{project.name}</dd>
        <dt>Scene</dt>
        <dd>{project.defaultScenePath}</dd>
      </dl>
    </aside>
  );
}
