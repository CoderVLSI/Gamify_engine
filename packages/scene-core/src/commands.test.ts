import { describe, expect, it } from "vitest";
import {
  addComponent,
  createCardDeckEntity,
  createDefaultProject,
  createDefaultScene,
  createEntity,
  createPlatformerPlayer,
  createPlatformerTilemap,
  createPrimitiveEntity,
  createRacingVehicle,
  duplicateEntity,
  setTransform,
  updateComponent
} from "./index";

describe("scene commands", () => {
  it("creates an entity with a transform", () => {
    const scene = createDefaultScene("Main");
    const updated = createEntity(scene, { name: "Player" });
    const entity = updated.entities.find((candidate) => candidate.name === "Player");

    expect(entity).toBeDefined();
    expect(entity?.components.some((component) => component.type === "Transform")).toBe(true);
  });

  it("sets transform values without mutating the original scene", () => {
    const scene = createEntity(createDefaultScene("Main"), { id: "player", name: "Player" });
    const updated = setTransform(scene, "player", { position: { x: 3, y: 4, z: 5 } });

    expect(scene.entities.find((entity) => entity.id === "player")?.components[0]).not.toEqual(
      updated.entities.find((entity) => entity.id === "player")?.components[0]
    );
    expect(updated.entities.find((entity) => entity.id === "player")?.components[0]).toMatchObject({
      type: "Transform",
      position: { x: 3, y: 4, z: 5 }
    });
  });

  it("adds and updates sprite animation data", () => {
    const scene = createEntity(createDefaultScene("Main"), { id: "hero", name: "Hero" });
    const withAnimation = addComponent(scene, "hero", {
      id: "anim",
      type: "SpriteAnimation2D",
      version: 1,
      assetPath: "assets/sprites/hero.png",
      frameWidth: 32,
      frameHeight: 32,
      frameCount: 6,
      fps: 12,
      loop: true,
      playing: true
    });

    const updated = updateComponent(withAnimation, "hero", "anim", { fps: 8, playing: false });

    expect(updated.entities.find((entity) => entity.id === "hero")?.components).toContainEqual(
      expect.objectContaining({ id: "anim", fps: 8, playing: false })
    );
  });

  it("creates visible primitive entities", () => {
    const scene = createDefaultScene("Main");
    const updated = createPrimitiveEntity(scene, "sphere", { id: "orb", name: "Orb" });
    const entity = updated.entities.find((candidate) => candidate.id === "orb");

    expect(entity?.components).toContainEqual(expect.objectContaining({ type: "Transform" }));
    expect(entity?.components).toContainEqual(expect.objectContaining({ type: "MeshRenderer3D", primitive: "sphere" }));
  });

  it("duplicates entities with new ids and copied components", () => {
    const scene = createDefaultScene("Main");
    const updated = duplicateEntity(scene, "cube", { id: "cube-copy" });
    const duplicate = updated.entities.find((entity) => entity.id === "cube-copy");

    expect(duplicate?.name).toBe("Cube Copy");
    expect(duplicate?.components).toContainEqual(expect.objectContaining({ type: "Transform" }));
    expect(duplicate?.components).toContainEqual(expect.objectContaining({ type: "MeshRenderer3D", primitive: "cube" }));
    expect(duplicate?.components.map((component) => component.id)).not.toContain("mesh-renderer");
  });

  it("creates starter asset and animation manifests for game workflows", () => {
    const project = createDefaultProject("Game");

    expect(project.assets).toContainEqual(expect.objectContaining({ id: "asset-hero-run", kind: "spritesheet" }));
    expect(project.assets).toContainEqual(expect.objectContaining({ id: "asset-racing-kart", kind: "model" }));
    expect(project.animationClips).toContainEqual(expect.objectContaining({ id: "clip-hero-run", frameCount: 8 }));
  });

  it("creates platformer, racing, and card game starter entities", () => {
    const withPlayer = createPlatformerPlayer(createDefaultScene("Main"), { id: "player" });
    const player = withPlayer.entities.find((entity) => entity.id === "player");
    expect(withPlayer.settings.viewportMode).toBe("2d");
    expect(player?.components).toContainEqual(expect.objectContaining({ type: "PlatformerController2D" }));
    expect(player?.components).toContainEqual(expect.objectContaining({ type: "SpriteAnimation2D", clipId: "clip-hero-run" }));

    const withTilemap = createPlatformerTilemap(withPlayer, { id: "tilemap" });
    expect(withTilemap.entities.find((entity) => entity.id === "tilemap")?.components).toContainEqual(
      expect.objectContaining({ type: "Tilemap2D", tilesetAssetId: "asset-platform-tileset" })
    );

    const withVehicle = createRacingVehicle(withTilemap, { id: "vehicle" });
    expect(withVehicle.settings.viewportMode).toBe("3d");
    expect(withVehicle.entities.find((entity) => entity.id === "vehicle")?.components).toContainEqual(
      expect.objectContaining({ type: "VehicleController3D", maxSpeed: 42 })
    );

    const withDeck = createCardDeckEntity(withVehicle, { id: "deck" });
    expect(withDeck.entities.find((entity) => entity.id === "deck")?.components).toContainEqual(
      expect.objectContaining({ type: "CardDeck", shuffleOnStart: true })
    );
  });
});
