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
});
