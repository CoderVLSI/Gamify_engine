import {
  addComponent,
  createDefaultProject,
  createDefaultScene,
  createAssetRecord,
  createSpriteAnimationClip,
  createCardDeckEntity,
  createEntity,
  createPlatformerPlayer,
  createPlatformerTilemap,
  createPrimitiveEntity,
  createRacingVehicle,
  deleteEntity,
  duplicateEntity,
  setTransform,
  toPrettyJson,
  updateComponent,
  type AssetKind,
  type AssetRecord,
  type GamifyProject,
  type Scene,
  type SceneComponent,
  type MeshRenderer3DComponent,
  type SpriteAnimationClip,
  type Vec3
} from "@gamify/scene-core";
import { create } from "zustand";
import { createStore } from "zustand/vanilla";
import type { StateCreator } from "zustand/vanilla";

export type TransformTool = "move" | "rotate" | "scale";

type EditorStore = {
  project: GamifyProject;
  scene: Scene;
  selectedEntityId: string | null;
  activeTransformTool: TransformTool;
  setProject: (project: GamifyProject) => void;
  setScene: (scene: Scene) => void;
  selectEntity: (entityId: string | null) => void;
  setActiveTransformTool: (tool: TransformTool) => void;
  createEntity: (name?: string) => void;
  createPrimitive: (primitive: MeshRenderer3DComponent["primitive"]) => void;
  createPlatformerPlayer: () => void;
  createPlatformerTilemap: () => void;
  createRacingVehicle: () => void;
  createCardDeck: () => void;
  addAsset: (kind: AssetKind, input?: Partial<AssetRecord>) => void;
  addAnimationClip: (input?: Partial<SpriteAnimationClip>) => void;
  deleteSelectedEntity: () => void;
  duplicateSelectedEntity: () => void;
  setTransform: (entityId: string, patch: { position?: Partial<Vec3>; rotation?: Partial<Vec3>; scale?: Partial<Vec3> }) => void;
  addComponent: (entityId: string, component: SceneComponent) => void;
  updateComponent: (entityId: string, componentId: string, patch: Record<string, unknown>) => void;
  serializeScene: () => string;
};

const editorStoreInitializer: StateCreator<EditorStore> = (set, get) => ({
  project: createDefaultProject("Gamify Sample"),
  scene: createDefaultScene("Main"),
  selectedEntityId: "cube",
  activeTransformTool: "move",
  setProject: (project) => set({ project }),
  setScene: (scene) => set({ scene, selectedEntityId: scene.entities[0]?.id ?? null }),
  selectEntity: (selectedEntityId) => set({ selectedEntityId }),
  setActiveTransformTool: (activeTransformTool) => set({ activeTransformTool }),
  createEntity: (name = "Entity") =>
    set((state) => {
      const scene = createEntity(state.scene, { name });
      return { scene, selectedEntityId: scene.entities.at(-1)?.id ?? null };
    }),
  createPrimitive: (primitive) =>
    set((state) => {
      const scene = createPrimitiveEntity(state.scene, primitive);
      return { scene, selectedEntityId: scene.entities.at(-1)?.id ?? null };
    }),
  createPlatformerPlayer: () =>
    set((state) => {
      const scene = createPlatformerPlayer(state.scene);
      return { scene, selectedEntityId: scene.entities.at(-1)?.id ?? null };
    }),
  createPlatformerTilemap: () =>
    set((state) => {
      const scene = createPlatformerTilemap(state.scene);
      return { scene, selectedEntityId: scene.entities.at(-1)?.id ?? null };
    }),
  createRacingVehicle: () =>
    set((state) => {
      const scene = createRacingVehicle(state.scene);
      return { scene, selectedEntityId: scene.entities.at(-1)?.id ?? null };
    }),
  createCardDeck: () =>
    set((state) => {
      const scene = createCardDeckEntity(state.scene);
      return { scene, selectedEntityId: scene.entities.at(-1)?.id ?? null };
    }),
  addAsset: (kind, input = {}) =>
    set((state) => ({
      project: { ...state.project, assets: [...state.project.assets, createAssetRecord(kind, input)] }
    })),
  addAnimationClip: (input = {}) =>
    set((state) => ({
      project: { ...state.project, animationClips: [...state.project.animationClips, createSpriteAnimationClip(input)] }
    })),
  deleteSelectedEntity: () =>
    set((state) => {
      if (!state.selectedEntityId) return state;
      return { scene: deleteEntity(state.scene, state.selectedEntityId), selectedEntityId: null };
    }),
  duplicateSelectedEntity: () =>
    set((state) => {
      if (!state.selectedEntityId) return state;
      const scene = duplicateEntity(state.scene, state.selectedEntityId);
      return { scene, selectedEntityId: scene.entities.at(-1)?.id ?? null };
    }),
  setTransform: (entityId, patch) => set((state) => ({ scene: setTransform(state.scene, entityId, patch) })),
  addComponent: (entityId, component) => set((state) => ({ scene: addComponent(state.scene, entityId, component) })),
  updateComponent: (entityId, componentId, patch) =>
    set((state) => ({ scene: updateComponent(state.scene, entityId, componentId, patch) })),
  serializeScene: () => toPrettyJson(get().scene)
});

export function createEditorStore() {
  return createStore<EditorStore>(editorStoreInitializer);
}

export const useEditorStore = create<EditorStore>()(editorStoreInitializer);
