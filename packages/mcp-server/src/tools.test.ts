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
});
