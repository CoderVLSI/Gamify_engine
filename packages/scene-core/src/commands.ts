import {
  createCardDeck,
  createDefaultEntity,
  createPlatformerController,
  createSpriteAnimation,
  createTilemap2D,
  createTransform,
  createVehicleController
} from "./defaults";
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

export function createPlatformerPlayer(scene: Scene, input: Partial<Entity> = {}): Scene {
  const entity = createDefaultEntity({
    ...input,
    name: input.name ?? "Platformer Player",
    components: [
      createTransform(),
      {
        id: "sprite-renderer",
        type: "SpriteRenderer2D",
        version: 1,
        assetPath: "assets/sprites/hero-run.png",
        color: "#ffffff"
      },
      createSpriteAnimation(),
      {
        id: "rigidbody-2d",
        type: "Rigidbody2D",
        version: 1,
        bodyType: "dynamic",
        gravityScale: 1
      },
      { id: "box-collider-2d", type: "BoxCollider2D", version: 1, size: { x: 0.8, y: 1.6, z: 0 } },
      createPlatformerController()
    ]
  });
  return { ...scene, settings: { ...scene.settings, viewportMode: "2d" }, entities: [...scene.entities, entity] };
}

export function createPlatformerTilemap(scene: Scene, input: Partial<Entity> = {}): Scene {
  const entity = createDefaultEntity({
    ...input,
    name: input.name ?? "Platform Tilemap",
    components: [createTransform(), createTilemap2D(), { id: "tilemap-collider", type: "BoxCollider2D", version: 1, size: { x: 64, y: 1, z: 0 } }]
  });
  return { ...scene, settings: { ...scene.settings, viewportMode: "2d" }, entities: [...scene.entities, entity] };
}

export function createRacingVehicle(scene: Scene, input: Partial<Entity> = {}): Scene {
  const entity = createDefaultEntity({
    ...input,
    name: input.name ?? "Racing Vehicle",
    components: [
      createTransform(),
      { id: "vehicle-mesh", type: "MeshRenderer3D", version: 1, primitive: "cube", color: "#ef4444" },
      { id: "vehicle-rigidbody", type: "Rigidbody3D", version: 1, size: { x: 1.8, y: 0.7, z: 3.2 } },
      { id: "vehicle-collider", type: "BoxCollider3D", version: 1, size: { x: 1.8, y: 0.7, z: 3.2 } },
      createVehicleController()
    ]
  });
  return { ...scene, settings: { ...scene.settings, viewportMode: "3d" }, entities: [...scene.entities, entity] };
}

export function createCardDeckEntity(scene: Scene, input: Partial<Entity> = {}): Scene {
  const entity = createDefaultEntity({
    ...input,
    name: input.name ?? "Card Deck",
    components: [createTransform(), createCardDeck()]
  });
  return { ...scene, entities: [...scene.entities, entity] };
}

export function duplicateEntity(scene: Scene, entityId: string, input: Partial<Entity> = {}): Scene {
  const entity = scene.entities.find((candidate) => candidate.id === entityId);
  if (!entity) throw new Error(`Entity not found: ${entityId}`);

  const duplicateId = input.id ?? crypto.randomUUID();
  const duplicate: Entity = {
    ...entity,
    ...input,
    id: duplicateId,
    name: input.name ?? `${entity.name} Copy`,
    parentId: entity.parentId,
    children: [],
    components: entity.components.map((component) => ({
      ...component,
      id: `${component.id}-${duplicateId}`
    }))
  };

  return { ...scene, entities: [...scene.entities, duplicate] };
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
