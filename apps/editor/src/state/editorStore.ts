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
  selectedAssetId: string | null;
  selectedAnimationClipId: string | null;
  activeTransformTool: TransformTool;
  setProject: (project: GamifyProject) => void;
  setScene: (scene: Scene) => void;
  selectEntity: (entityId: string | null) => void;
  selectAsset: (assetId: string | null) => void;
  selectAnimationClip: (clipId: string | null) => void;
  setActiveTransformTool: (tool: TransformTool) => void;
  createEntity: (name?: string) => void;
  createPrimitive: (primitive: MeshRenderer3DComponent["primitive"]) => void;
  createPlatformerPlayer: () => void;
  createPlatformerTilemap: () => void;
  createRacingVehicle: () => void;
  createCardDeck: () => void;
  addAsset: (kind: AssetKind, input?: Partial<AssetRecord>) => void;
  addAnimationClip: (input?: Partial<SpriteAnimationClip>) => void;
  updateAnimationClip: (clipId: string, patch: Partial<SpriteAnimationClip>) => void;
  updateAsset: (assetId: string, patch: Partial<AssetRecord>) => void;
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
  selectedAssetId: "asset-hero-run",
  selectedAnimationClipId: "clip-hero-run",
  activeTransformTool: "move",
  setProject: (project) => set({ project }),
  setScene: (scene) => set({ scene, selectedEntityId: scene.entities[0]?.id ?? null }),
  selectEntity: (selectedEntityId) => set({ selectedEntityId }),
  selectAsset: (selectedAssetId) => set({ selectedAssetId }),
  selectAnimationClip: (selectedAnimationClipId) => set({ selectedAnimationClipId }),
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
    set((state) => {
      const asset = createAssetRecord(kind, input);
      return {
        project: { ...state.project, assets: [...state.project.assets, asset] },
        selectedAssetId: asset.id
      };
    }),
  addAnimationClip: (input = {}) =>
    set((state) => {
      const clip = createSpriteAnimationClip(input);
      return {
        project: { ...state.project, animationClips: [...state.project.animationClips, clip] },
        selectedAnimationClipId: clip.id,
        selectedAssetId: clip.spritesheetAssetId
      };
    }),
  updateAnimationClip: (clipId, patch) =>
    set((state) => ({
      project: {
        ...state.project,
        animationClips: state.project.animationClips.map((clip) => (clip.id === clipId ? { ...clip, ...patch } : clip))
      }
    })),
  updateAsset: (assetId, patch) =>
    set((state) => ({
      project: {
        ...state.project,
        assets: state.project.assets.map((asset) => (asset.id === assetId ? { ...asset, ...patch } : asset))
      }
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
