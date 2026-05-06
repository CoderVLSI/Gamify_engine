import { createDefaultEntity, createTransform } from "./defaults";
import type { Entity, MeshRenderer3DComponent, Scene, SceneComponent, TransformComponent, Vec3 } from "./types";

function replaceEntity(scene: Scene, entity: Entity): Scene {
  return { ...scene, entities: scene.entities.map((candidate) => (candidate.id === entity.id ? entity : candidate)) };
}

export function createEntity(scene: Scene, input: Partial<Entity> = {}): Scene {
  return { ...scene, entities: [...scene.entities, createDefaultEntity(input)] };
}

export function createPrimitiveEntity(
  scene: Scene,
  primitive: MeshRenderer3DComponent["primitive"],
  input: Partial<Entity> = {}
): Scene {
  const entity = createDefaultEntity({
    ...input,
    name: input.name ?? `${primitive[0].toUpperCase()}${primitive.slice(1)}`,
    components: [
      createTransform(),
      {
        id: "mesh-renderer",
        type: "MeshRenderer3D",
        version: 1,
        primitive,
        color: primitive === "sphere" ? "#93c5fd" : primitive === "plane" ? "#c4b5fd" : "#6ee7b7"
      }
    ]
  });
  return { ...scene, entities: [...scene.entities, entity] };
}

export function deleteEntity(scene: Scene, entityId: string): Scene {
  return {
    ...scene,
    entities: scene.entities
      .filter((entity) => entity.id !== entityId)
      .map((entity) => ({ ...entity, children: entity.children.filter((childId) => childId !== entityId) }))
  };
}

export function renameEntity(scene: Scene, entityId: string, name: string): Scene {
  const entity = scene.entities.find((candidate) => candidate.id === entityId);
  if (!entity) throw new Error(`Entity not found: ${entityId}`);
  return replaceEntity(scene, { ...entity, name });
}

export function setParent(scene: Scene, entityId: string, parentId: string | null): Scene {
  if (parentId === entityId) throw new Error("Entity cannot be its own parent");
  const entity = scene.entities.find((candidate) => candidate.id === entityId);
  if (!entity) throw new Error(`Entity not found: ${entityId}`);
  if (parentId && !scene.entities.some((candidate) => candidate.id === parentId)) {
    throw new Error(`Parent entity not found: ${parentId}`);
  }

  const withoutOldLinks = scene.entities.map((candidate) => ({
    ...candidate,
    children: candidate.children.filter((childId) => childId !== entityId)
  }));

  const withParent = withoutOldLinks.map((candidate) => {
    if (candidate.id === entityId) return { ...candidate, parentId };
    if (candidate.id === parentId) return { ...candidate, children: [...candidate.children, entityId] };
    return candidate;
  });

  return { ...scene, entities: withParent };
}

export function addComponent(scene: Scene, entityId: string, component: SceneComponent): Scene {
  const entity = scene.entities.find((candidate) => candidate.id === entityId);
  if (!entity) throw new Error(`Entity not found: ${entityId}`);
  if (entity.components.some((candidate) => candidate.id === component.id)) {
    throw new Error(`Component already exists: ${component.id}`);
  }
  return replaceEntity(scene, { ...entity, components: [...entity.components, component] });
}

export function removeComponent(scene: Scene, entityId: string, componentId: string): Scene {
  const entity = scene.entities.find((candidate) => candidate.id === entityId);
  if (!entity) throw new Error(`Entity not found: ${entityId}`);
  return replaceEntity(scene, {
    ...entity,
    components: entity.components.filter((component) => component.id !== componentId)
  });
}

export function updateComponent(scene: Scene, entityId: string, componentId: string, patch: Record<string, unknown>): Scene {
  const entity = scene.entities.find((candidate) => candidate.id === entityId);
  if (!entity) throw new Error(`Entity not found: ${entityId}`);
  return replaceEntity(scene, {
    ...entity,
    components: entity.components.map((component) =>
      component.id === componentId ? ({ ...component, ...patch } as SceneComponent) : component
    )
  });
}

export type TransformPatch = {
  position?: Partial<Vec3>;
  rotation?: Partial<Vec3>;
  scale?: Partial<Vec3>;
};

export function setTransform(scene: Scene, entityId: string, patch: TransformPatch): Scene {
  const entity = scene.entities.find((candidate) => candidate.id === entityId);
  if (!entity) throw new Error(`Entity not found: ${entityId}`);
  const transform = entity.components.find((component): component is TransformComponent => component.type === "Transform") ?? createTransform();
  const nextTransform: TransformComponent = {
    ...transform,
    position: mergeVec3(transform.position, patch.position),
    rotation: mergeVec3(transform.rotation, patch.rotation),
    scale: mergeVec3(transform.scale, patch.scale)
  };
  const others = entity.components.filter((component) => component.id !== transform.id);
  return replaceEntity(scene, { ...entity, components: [nextTransform, ...others] });
}

function mergeVec3(current: Vec3, patch?: Partial<Vec3>): Vec3 {
  return patch ? { ...current, ...patch } : current;
}
