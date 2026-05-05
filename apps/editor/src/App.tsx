import { HierarchyPanel } from "./components/HierarchyPanel";
import { InspectorPanel } from "./components/InspectorPanel";
import { ProjectPanel } from "./components/ProjectPanel";
import { Toolbar } from "./components/Toolbar";

export function App() {
  return (
    <main className="editor-shell">
      <Toolbar />
      <section className="editor-grid">
        <HierarchyPanel />
        <div className="viewport-placeholder">3D Viewport loads next</div>
        <InspectorPanel />
        <ProjectPanel />
      </section>
    </main>
  );
}
