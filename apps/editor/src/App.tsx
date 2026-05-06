import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { startMcpBridge } from "./bridge/mcpBridge";
import { HierarchyPanel } from "./components/HierarchyPanel";
import { InspectorPanel } from "./components/InspectorPanel";
import { ProjectPanel } from "./components/ProjectPanel";
import { Toolbar } from "./components/Toolbar";
import { Viewport3D } from "./components/Viewport3D";
import { useEditorStore } from "./state/editorStore";

export function App() {
  const deleteSelectedEntity = useEditorStore((state) => state.deleteSelectedEntity);
  const gridRef = useRef<HTMLElement | null>(null);
  const [layout, setLayout] = useState({ left: 300, right: 360, bottom: 420 });

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

  function startResize(kind: "left" | "right" | "bottom", event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    const grid = gridRef.current;
    if (!grid) return;
    const rect = grid.getBoundingClientRect();
    const start = { x: event.clientX, y: event.clientY, layout };
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);

    function handlePointerMove(moveEvent: PointerEvent) {
      const minViewportWidth = 460;
      const minViewportHeight = 260;
      setLayout(() => {
        if (kind === "left") {
          const left = clamp(start.layout.left + moveEvent.clientX - start.x, 220, Math.max(220, rect.width - start.layout.right - minViewportWidth));
          return { ...start.layout, left };
        }
        if (kind === "right") {
          const right = clamp(start.layout.right - (moveEvent.clientX - start.x), 300, Math.max(300, rect.width - start.layout.left - minViewportWidth));
          return { ...start.layout, right };
        }
        const bottom = clamp(start.layout.bottom - (moveEvent.clientY - start.y), 260, Math.max(260, rect.height - minViewportHeight));
        return { ...start.layout, bottom };
      });
    }

    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  }

  return (
    <main className="editor-shell">
      <Toolbar />
      <section
        className="editor-grid"
        ref={gridRef}
        style={
          {
            "--left-panel-width": `${layout.left}px`,
            "--right-panel-width": `${layout.right}px`,
            "--bottom-panel-height": `${layout.bottom}px`
          } as CSSProperties
        }
      >
        <HierarchyPanel />
        <Viewport3D />
        <InspectorPanel />
        <ProjectPanel />
        <div className="resize-handle resize-handle-left" title="Resize hierarchy" onPointerDown={(event) => startResize("left", event)} />
        <div className="resize-handle resize-handle-right" title="Resize inspector" onPointerDown={(event) => startResize("right", event)} />
        <div className="resize-handle resize-handle-bottom" title="Resize project panel" onPointerDown={(event) => startResize("bottom", event)} />
      </section>
    </main>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
