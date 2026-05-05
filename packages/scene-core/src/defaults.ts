import type { Entity, GamifyProject, MeshRenderer3DComponent, Scene, TransformComponent, Vec3 } from "./types";

const unit: Vec3 = { x: 1, y: 1, z: 1 };
const zero: Vec3 = { x: 0, y: 0, z: 0 };

function id(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function createTransform(componentId = "transform"): TransformComponent {
  return {
    id: componentId,
    type: "Transform",
    version: 1,
    position: zero,
    rotation: zero,
    scale: unit
  };
}

export function createMeshRenderer(componentId = "mesh-renderer"): MeshRenderer3DComponent {
  return {
    id: componentId,
    type: "MeshRenderer3D",
    version: 1,
    primitive: "cube",
    color: "#6ee7b7"
  };
}

export function createDefaultEntity(input: Partial<Entity> = {}): Entity {
  return {
    id: input.id ?? id("entity"),
    name: input.name ?? "Entity",
    parentId: input.parentId ?? null,
    children: input.children ?? [],
    enabled: input.enabled ?? true,
    components: input.components ?? [createTransform()]
  };
}

export function createDefaultScene(name = "Main"): Scene {
  return {
    id: id("scene"),
    name,
    entities: [
      createDefaultEntity({
        id: "camera",
        name: "Main Camera",
        components: [
          createTransform(),
          { id: "camera-3d", type: "Camera3D", version: 1, fov: 60, near: 0.1, far: 1000 }
        ]
      }),
      createDefaultEntity({
        id: "cube",
        name: "Cube",
        components: [createTransform(), createMeshRenderer()]
      })
    ],
    settings: { gravity: { x: 0, y: -9.81, z: 0 }, viewportMode: "3d" }
  };
}

export function createDefaultProject(name = "Untitled Gamify Project"): GamifyProject {
  return {
    id: id("project"),
    name,
    editorVersion: "0.1.0",
    defaultScenePath: "scenes/main.scene.json",
    assetRoots: ["assets"]
  };
}
