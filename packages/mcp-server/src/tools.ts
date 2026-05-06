import {
  addComponent,
  createCardDeckEntity,
  createEntity,
  createPlatformerPlayer,
  createPlatformerTilemap,
  createPrimitiveEntity,
  createRacingVehicle,
  setTransform,
  updateComponent,
  type MeshRenderer3DComponent,
  type Scene,
  type SceneComponent,
  type TransformPatch
} from "@gamify/scene-core";

export async function applyLocalTool(scene: Scene, toolName: string, args: Record<string, unknown>): Promise<{ scene: Scene }> {
  if (toolName === "create_entity") {
    return { scene: createEntity(scene, { name: String(args.name ?? "Entity") }) };
  }

  if (toolName === "create_primitive") {
    return { scene: createPrimitiveEntity(scene, String(args.primitive ?? "cube") as MeshRenderer3DComponent["primitive"]) };
  }

  if (toolName === "create_platformer_player") {
    return { scene: createPlatformerPlayer(scene) };
  }

  if (toolName === "create_platformer_tilemap") {
    return { scene: createPlatformerTilemap(scene) };
  }

  if (toolName === "create_racing_vehicle") {
    return { scene: createRacingVehicle(scene) };
  }

  if (toolName === "create_card_deck") {
    return { scene: createCardDeckEntity(scene) };
  }

  if (toolName === "set_transform") {
    return {
      scene: setTransform(scene, String(args.entityId), {
        position: args.position as TransformPatch["position"],
        rotation: args.rotation as TransformPatch["rotation"],
        scale: args.scale as TransformPatch["scale"]
      })
    };
  }

  if (toolName === "add_component") {
    return { scene: addComponent(scene, String(args.entityId), args.component as SceneComponent) };
  }

  if (toolName === "update_component") {
    return { scene: updateComponent(scene, String(args.entityId), String(args.componentId), args.patch as Record<string, unknown>) };
  }

  throw new Error(`Unsupported tool: ${toolName}`);
}
