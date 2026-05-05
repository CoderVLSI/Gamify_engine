import { HierarchyPanel } from "./components/HierarchyPanel";
import { InspectorPanel } from "./components/InspectorPanel";
import { ProjectPanel } from "./components/ProjectPanel";
import { Toolbar } from "./components/Toolbar";
import { Viewport3D } from "./components/Viewport3D";

export function App() {
  return (
    <main className="editor-shell">
      <Toolbar />
      <section className="editor-grid">
        <HierarchyPanel />
        <Viewport3D />
        <InspectorPanel />
        <ProjectPanel />
      </section>
    </main>
  );
}
