import {
  addComponent,
  createDefaultProject,
  createDefaultScene,
  createEntity,
  setTransform,
  toPrettyJson,
  updateComponent,
  type GamifyProject,
  type Scene,
  type SceneComponent,
  type Vec3
} from "@gamify/scene-core";
import { create } from "zustand";

type EditorStore = {
  project: GamifyProject;
  scene: Scene;
  selectedEntityId: string | null;
  setProject: (project: GamifyProject) => void;
  setScene: (scene: Scene) => void;
  selectEntity: (entityId: string | null) => void;
  createEntity: (name?: string) => void;
  setTransform: (entityId: string, patch: { position?: Partial<Vec3>; rotation?: Partial<Vec3>; scale?: Partial<Vec3> }) => void;
  addComponent: (entityId: string, component: SceneComponent) => void;
  updateComponent: (entityId: string, componentId: string, patch: Record<string, unknown>) => void;
  serializeScene: () => string;
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  project: createDefaultProject("Gamify Sample"),
  scene: createDefaultScene("Main"),
  selectedEntityId: "cube",
  setProject: (project) => set({ project }),
  setScene: (scene) => set({ scene, selectedEntityId: scene.entities[0]?.id ?? null }),
  selectEntity: (selectedEntityId) => set({ selectedEntityId }),
  createEntity: (name = "Entity") =>
    set((state) => {
      const scene = createEntity(state.scene, { name });
      return { scene, selectedEntityId: scene.entities.at(-1)?.id ?? null };
    }),
  setTransform: (entityId, patch) => set((state) => ({ scene: setTransform(state.scene, entityId, patch) })),
  addComponent: (entityId, component) => set((state) => ({ scene: addComponent(state.scene, entityId, component) })),
  updateComponent: (entityId, componentId, patch) =>
    set((state) => ({ scene: updateComponent(state.scene, entityId, componentId, patch) })),
  serializeScene: () => toPrettyJson(get().scene)
}));
