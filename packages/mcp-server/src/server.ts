import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { EditorClient } from "./editorClient";

const server = new McpServer({ name: "gamify-editor", version: "0.1.0" });
const editor = new EditorClient();
const vec3Patch = z.object({ x: z.number().optional(), y: z.number().optional(), z: z.number().optional() });
const assetKind = z.enum(["sprite", "spritesheet", "tileset", "audio", "music", "model", "material", "scene", "card"]);
const primitive = z.enum(["cube", "sphere", "plane"]);
const componentPayload = z.object({}).passthrough();
const assetInput = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    path: z.string().optional(),
    tags: z.array(z.string()).optional()
  })
  .optional();
const clipInput = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    spritesheetAssetId: z.string().optional(),
    frameWidth: z.number().optional(),
    frameHeight: z.number().optional(),
    frameCount: z.number().optional(),
    fps: z.number().optional(),
    loop: z.boolean().optional()
  })
  .optional();

server.tool("get_scene", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(await editor.send({ type: "get_scene", payload: {} }), null, 2) }]
}));

server.tool("get_project", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(await editor.send({ type: "get_project", payload: {} }), null, 2) }]
}));

server.tool("list_entities", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(await editor.send({ type: "list_entities", payload: {} }), null, 2) }]
}));

server.tool("create_entity", { name: z.string().default("Entity") }, async ({ name }) => ({
  content: [{ type: "text", text: JSON.stringify(await editor.send({ type: "create_entity", payload: { name } }), null, 2) }]
}));

server.tool("create_primitive", { primitive: primitive.default("cube") }, async ({ primitive }) => ({
  content: [{ type: "text", text: JSON.stringify(await editor.send({ type: "create_primitive", payload: { primitive } }), null, 2) }]
}));

server.tool("create_platformer_player", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(await editor.send({ type: "create_platformer_player", payload: {} }), null, 2) }]
}));

server.tool("create_platformer_tilemap", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(await editor.send({ type: "create_platformer_tilemap", payload: {} }), null, 2) }]
}));

server.tool("create_racing_vehicle", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(await editor.send({ type: "create_racing_vehicle", payload: {} }), null, 2) }]
}));

server.tool("create_card_deck", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(await editor.send({ type: "create_card_deck", payload: {} }), null, 2) }]
}));

server.tool(
  "set_transform",
  {
    entityId: z.string(),
    position: vec3Patch.optional(),
    rotation: vec3Patch.optional(),
    scale: vec3Patch.optional()
  },
  async (args) => ({
    content: [{ type: "text", text: JSON.stringify(await editor.send({ type: "set_transform", payload: args }), null, 2) }]
  })
);

server.tool(
  "add_component",
  {
    entityId: z.string(),
    component: componentPayload
  },
  async (args) => ({
    content: [{ type: "text", text: JSON.stringify(await editor.send({ type: "add_component", payload: args }), null, 2) }]
  })
);

server.tool(
  "update_component",
  {
    entityId: z.string(),
    componentId: z.string(),
    patch: componentPayload
  },
  async (args) => ({
    content: [{ type: "text", text: JSON.stringify(await editor.send({ type: "update_component", payload: args }), null, 2) }]
  })
);

server.tool("select_entity", { entityId: z.string().nullable().optional() }, async ({ entityId }) => ({
  content: [{ type: "text", text: JSON.stringify(await editor.send({ type: "select_entity", payload: { entityId } }), null, 2) }]
}));

server.tool("add_asset", { kind: assetKind, input: assetInput }, async (args) => ({
  content: [{ type: "text", text: JSON.stringify(await editor.send({ type: "add_asset", payload: args }), null, 2) }]
}));

server.tool("add_animation_clip", { input: clipInput }, async (args) => ({
  content: [{ type: "text", text: JSON.stringify(await editor.send({ type: "add_animation_clip", payload: args }), null, 2) }]
}));

server.tool(
  "update_animation_clip",
  {
    clipId: z.string(),
    patch: clipInput.unwrap()
  },
  async (args) => ({
    content: [{ type: "text", text: JSON.stringify(await editor.send({ type: "update_animation_clip", payload: args }), null, 2) }]
  })
);

server.tool("select_animation_clip", { clipId: z.string().nullable().optional() }, async ({ clipId }) => ({
  content: [{ type: "text", text: JSON.stringify(await editor.send({ type: "select_animation_clip", payload: { clipId } }), null, 2) }]
}));

await server.connect(new StdioServerTransport());
