import { createEntity, setTransform, type Scene, type TransformPatch } from "@gamify/scene-core";

export async function applyLocalTool(scene: Scene, toolName: string, args: Record<string, unknown>): Promise<{ scene: Scene }> {
  if (toolName === "create_entity") {
    return { scene: createEntity(scene, { name: String(args.name ?? "Entity") }) };
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

  throw new Error(`Unsupported tool: ${toolName}`);
}
