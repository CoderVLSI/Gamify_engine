import { describe, expect, it } from "vitest";
import { createEditorStore } from "./editorStore";

describe("editor store transform tools", () => {
  it("defaults to move and switches between move rotate and scale", () => {
    const store = createEditorStore();

    expect(store.getState().activeTransformTool).toBe("move");

    store.getState().setActiveTransformTool("rotate");
    expect(store.getState().activeTransformTool).toBe("rotate");

    store.getState().setActiveTransformTool("scale");
    expect(store.getState().activeTransformTool).toBe("scale");

    store.getState().setActiveTransformTool("move");
    expect(store.getState().activeTransformTool).toBe("move");
  });

  it("deletes the selected entity and clears selection", () => {
    const store = createEditorStore();

    store.getState().selectEntity("cube");
    store.getState().deleteSelectedEntity();

    expect(store.getState().scene.entities.some((entity) => entity.id === "cube")).toBe(false);
    expect(store.getState().selectedEntityId).toBeNull();
  });

  it("duplicates the selected entity and selects the duplicate", () => {
    const store = createEditorStore();

    store.getState().selectEntity("cube");
    store.getState().duplicateSelectedEntity();

    const duplicate = store.getState().scene.entities.find((entity) => entity.name === "Cube Copy");
    expect(duplicate).toBeDefined();
    expect(store.getState().selectedEntityId).toBe(duplicate?.id);
  });

  it("creates genre starter entities from editor actions", () => {
    const store = createEditorStore();

    store.getState().createPlatformerPlayer();
    expect(store.getState().scene.settings.viewportMode).toBe("2d");
    expect(store.getState().scene.entities.at(-1)?.components).toContainEqual(
      expect.objectContaining({ type: "PlatformerController2D" })
    );

    store.getState().createRacingVehicle();
    expect(store.getState().scene.settings.viewportMode).toBe("3d");
    expect(store.getState().scene.entities.at(-1)?.components).toContainEqual(
      expect.objectContaining({ type: "VehicleController3D" })
    );

    store.getState().createCardDeck();
    expect(store.getState().scene.entities.at(-1)?.components).toContainEqual(expect.objectContaining({ type: "CardDeck" }));
  });

  it("adds project assets and sprite animation clips", () => {
    const store = createEditorStore();
    const initialAssets = store.getState().project.assets.length;
    const initialClips = store.getState().project.animationClips.length;

    store.getState().addAsset("spritesheet", { name: "Hero Attack", path: "assets/sprites/hero-attack.png" });
    store.getState().addAnimationClip({ name: "Hero Attack", frameCount: 6, fps: 14 });

    expect(store.getState().project.assets).toHaveLength(initialAssets + 1);
    expect(store.getState().project.assets.at(-1)).toMatchObject({ kind: "spritesheet", name: "Hero Attack" });
    expect(store.getState().project.animationClips).toHaveLength(initialClips + 1);
    expect(store.getState().project.animationClips.at(-1)).toMatchObject({ name: "Hero Attack", frameCount: 6, fps: 14 });
    expect(store.getState().selectedAnimationClipId).toBe(store.getState().project.animationClips.at(-1)?.id);
  });

  it("updates selected project assets and animation clips", () => {
    const store = createEditorStore();

    store.getState().updateAsset("asset-hero-run", { name: "Hero Run XL" });
    store.getState().updateAnimationClip("clip-hero-run", { fps: 18, frameCount: 10 });
    store.getState().selectAsset("asset-hero-run");
    store.getState().selectAnimationClip("clip-hero-run");

    expect(store.getState().project.assets.find((asset) => asset.id === "asset-hero-run")).toMatchObject({ name: "Hero Run XL" });
    expect(store.getState().project.animationClips.find((clip) => clip.id === "clip-hero-run")).toMatchObject({
      fps: 18,
      frameCount: 10
    });
    expect(store.getState().selectedAssetId).toBe("asset-hero-run");
    expect(store.getState().selectedAnimationClipId).toBe("clip-hero-run");
  });
});
