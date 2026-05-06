import { describe, expect, it } from "vitest";
import { addComponent, createDefaultScene, createEntity, createPrimitiveEntity, setTransform, updateComponent } from "./index";

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
});
