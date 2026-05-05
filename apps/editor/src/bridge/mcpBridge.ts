import type { TransformPatch } from "@gamify/scene-core";
import { useEditorStore } from "../state/editorStore";

export function applyEditorCommand(command: { type: string; payload: Record<string, unknown> }) {
  const store = useEditorStore.getState();

  if (command.type === "get_scene") {
    return { ok: true, scene: store.scene };
  }

  if (command.type === "create_entity") {
    store.createEntity(String(command.payload.name ?? "Entity"));
    return { ok: true, scene: useEditorStore.getState().scene };
  }

  if (command.type === "set_transform") {
    store.setTransform(String(command.payload.entityId), {
      position: command.payload.position as TransformPatch["position"],
      rotation: command.payload.rotation as TransformPatch["rotation"],
      scale: command.payload.scale as TransformPatch["scale"]
    });
    return { ok: true, scene: useEditorStore.getState().scene };
  }

  return { ok: false, error: `Unknown command: ${command.type}` };
}

export function startMcpBridge() {
  const socket = new WebSocket("ws://127.0.0.1:47621");
  socket.addEventListener("message", (event) => {
    const command = JSON.parse(event.data) as { type: string; payload: Record<string, unknown> };
    socket.send(JSON.stringify(applyEditorCommand(command)));
  });
  socket.addEventListener("error", () => {
    // The editor remains usable when no MCP sidecar is listening.
  });
  return () => socket.close();
}
