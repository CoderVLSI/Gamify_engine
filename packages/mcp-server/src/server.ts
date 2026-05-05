import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { EditorClient } from "./editorClient";

const server = new McpServer({ name: "gamify-editor", version: "0.1.0" });
const editor = new EditorClient();
const vec3Patch = z.object({ x: z.number().optional(), y: z.number().optional(), z: z.number().optional() });

server.tool("get_scene", {}, async () => ({
  content: [{ type: "text", text: JSON.stringify(await editor.send({ type: "get_scene", payload: {} }), null, 2) }]
}));

server.tool("create_entity", { name: z.string().default("Entity") }, async ({ name }) => ({
  content: [{ type: "text", text: JSON.stringify(await editor.send({ type: "create_entity", payload: { name } }), null, 2) }]
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

await server.connect(new StdioServerTransport());
