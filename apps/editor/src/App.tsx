import { useEffect } from "react";
import { startMcpBridge } from "./bridge/mcpBridge";
import { HierarchyPanel } from "./components/HierarchyPanel";
import { InspectorPanel } from "./components/InspectorPanel";
import { ProjectPanel } from "./components/ProjectPanel";
import { Toolbar } from "./components/Toolbar";
import { Viewport3D } from "./components/Viewport3D";
import { useEditorStore } from "./state/editorStore";

export function App() {
  const deleteSelectedEntity = useEditorStore((state) => state.deleteSelectedEntity);

  useEffect(() => startMcpBridge(), []);
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === "INPUT" || target?.tagName === "SELECT" || target?.tagName === "TEXTAREA";
      if (isTyping) return;
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelectedEntity();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelectedEntity]);

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
