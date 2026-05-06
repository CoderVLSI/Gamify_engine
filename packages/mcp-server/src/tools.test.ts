import { createDefaultScene } from "@gamify/scene-core";
import { describe, expect, it } from "vitest";
import { applyLocalTool } from "./tools";

describe("mcp tools", () => {
  it("creates an entity through the local command handler", async () => {
    const scene = createDefaultScene("Main");
    const result = await applyLocalTool(scene, "create_entity", { name: "Agent Cube" });

    expect(result.scene.entities.some((entity) => entity.name === "Agent Cube")).toBe(true);
  });

  it("sets transform through the local command handler", async () => {
    const scene = createDefaultScene("Main");
    const result = await applyLocalTool(scene, "set_transform", {
      entityId: "cube",
      position: { x: 10, y: 0, z: 2 }
    });

    expect(result.scene.entities.find((entity) => entity.id === "cube")?.components[0]).toMatchObject({
      position: { x: 10, y: 0, z: 2 }
    });
  });

  it("creates game starter entities through the local command handler", async () => {
    const scene = createDefaultScene("Main");
    const withPlayer = await applyLocalTool(scene, "create_platformer_player", {});
    const withVehicle = await applyLocalTool(withPlayer.scene, "create_racing_vehicle", {});
    const withDeck = await applyLocalTool(withVehicle.scene, "create_card_deck", {});

    expect(withPlayer.scene.entities.at(-1)?.components).toContainEqual(expect.objectContaining({ type: "PlatformerController2D" }));
    expect(withVehicle.scene.entities.at(-1)?.components).toContainEqual(expect.objectContaining({ type: "VehicleController3D" }));
    expect(withDeck.scene.entities.at(-1)?.components).toContainEqual(expect.objectContaining({ type: "CardDeck" }));
  });

  it("adds and updates components through the local command handler", async () => {
    const scene = createDefaultScene("Main");
    const withComponent = await applyLocalTool(scene, "add_component", {
      entityId: "cube",
      component: {
        id: "agent-audio",
        type: "AudioSource",
        version: 1,
        assetPath: "assets/audio/jump.wav",
        volume: 0.5,
        loop: false,
        autoplay: false
      }
    });
    const updated = await applyLocalTool(withComponent.scene, "update_component", {
      entityId: "cube",
      componentId: "agent-audio",
      patch: { volume: 0.9 }
    });

    expect(updated.scene.entities.find((entity) => entity.id === "cube")?.components).toContainEqual(
      expect.objectContaining({ id: "agent-audio", volume: 0.9 })
    );
  });
});
