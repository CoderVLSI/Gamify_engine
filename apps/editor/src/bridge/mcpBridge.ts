import type { AssetKind, AssetRecord, SceneComponent, SpriteAnimationClip, TransformPatch } from "@gamify/scene-core";
import { useEditorStore } from "../state/editorStore";

export function applyEditorCommand(command: { type: string; payload: Record<string, unknown> }) {
  const store = useEditorStore.getState();

  if (command.type === "get_scene") {
    return { ok: true, scene: store.scene };
  }

  if (command.type === "get_project") {
    return { ok: true, project: store.project };
  }

  if (command.type === "list_entities") {
    return {
      ok: true,
      entities: store.scene.entities.map((entity) => ({
        id: entity.id,
        name: entity.name,
        parentId: entity.parentId,
        enabled: entity.enabled,
        components: entity.components.map((component) => ({ id: component.id, type: component.type }))
      }))
    };
  }

  if (command.type === "create_entity") {
    store.createEntity(String(command.payload.name ?? "Entity"));
    return { ok: true, scene: useEditorStore.getState().scene };
  }

  if (command.type === "create_primitive") {
    const primitive = String(command.payload.primitive ?? "cube");
    if (primitive !== "cube" && primitive !== "sphere" && primitive !== "plane") {
      return { ok: false, error: `Unsupported primitive: ${primitive}` };
    }
    store.createPrimitive(primitive);
    return { ok: true, scene: useEditorStore.getState().scene };
  }

  if (command.type === "create_platformer_player") {
    store.createPlatformerPlayer();
    return { ok: true, scene: useEditorStore.getState().scene };
  }

  if (command.type === "create_platformer_tilemap") {
    store.createPlatformerTilemap();
    return { ok: true, scene: useEditorStore.getState().scene };
  }

  if (command.type === "create_racing_vehicle") {
    store.createRacingVehicle();
    return { ok: true, scene: useEditorStore.getState().scene };
  }

  if (command.type === "create_card_deck") {
    store.createCardDeck();
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

  if (command.type === "add_component") {
    store.addComponent(String(command.payload.entityId), command.payload.component as SceneComponent);
    return { ok: true, scene: useEditorStore.getState().scene };
  }

  if (command.type === "update_component") {
    store.updateComponent(String(command.payload.entityId), String(command.payload.componentId), command.payload.patch as Record<string, unknown>);
    return { ok: true, scene: useEditorStore.getState().scene };
  }

  if (command.type === "select_entity") {
    store.selectEntity(command.payload.entityId ? String(command.payload.entityId) : null);
    return { ok: true, selectedEntityId: useEditorStore.getState().selectedEntityId };
  }

  if (command.type === "add_asset") {
    store.addAsset(String(command.payload.kind ?? "sprite") as AssetKind, command.payload.input as Partial<AssetRecord>);
    return { ok: true, project: useEditorStore.getState().project };
  }

  if (command.type === "add_animation_clip") {
    store.addAnimationClip(command.payload.input as Partial<SpriteAnimationClip>);
    return { ok: true, project: useEditorStore.getState().project };
  }

  if (command.type === "update_animation_clip") {
    store.updateAnimationClip(String(command.payload.clipId), command.payload.patch as Partial<SpriteAnimationClip>);
    return { ok: true, project: useEditorStore.getState().project };
  }

  if (command.type === "select_animation_clip") {
    store.selectAnimationClip(command.payload.clipId ? String(command.payload.clipId) : null);
    return { ok: true, selectedAnimationClipId: useEditorStore.getState().selectedAnimationClipId };
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
