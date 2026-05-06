# Gamify Editor MCP Agent Connection

Gamify exposes a stdio MCP server that talks to the running editor through the local WebSocket bridge at `ws://127.0.0.1:47621`.

## Start The Editor

Use either the web editor:

```powershell
npm run dev
```

Or the Tauri desktop app:

```powershell
npm run tauri:dev
```

Keep the editor open so the MCP bridge can receive commands.

## MCP Server Command

Configure MCP clients to run this command from the repository root:

```powershell
npm --workspace @gamify/mcp-server run dev
```

The server uses stdio, so Codex, Claude Code, and other MCP clients should launch it as a child process.

## Example MCP Client Config

Use the absolute repository path for `cwd`.

```json
{
  "mcpServers": {
    "gamify-editor": {
      "command": "npm",
      "args": ["--workspace", "@gamify/mcp-server", "run", "dev"],
      "cwd": "D:\\gamify_editor\\.worktrees\\gamify-editor-foundation"
    }
  }
}
```

## Tools

- `get_project`: read project metadata, assets, and sprite animation clips.
- `get_scene`: read the full active scene.
- `list_entities`: read a compact hierarchy and component list.
- `create_entity`: create an empty entity.
- `create_primitive`: create `cube`, `sphere`, or `plane`.
- `create_platformer_player`: add a 2D platformer-ready player entity.
- `create_platformer_tilemap`: add a 2D tilemap entity.
- `create_racing_vehicle`: add a 3D racing vehicle entity.
- `create_card_deck`: add a card deck entity.
- `set_transform`: patch entity position, rotation, or scale.
- `add_component`: add a full component payload to an entity.
- `update_component`: patch a component.
- `select_entity`: select an entity in the editor.
- `add_asset`: add an asset manifest record.
- `add_animation_clip`: add a sprite animation clip.
- `update_animation_clip`: patch sprite clip timing, frame size, frame count, loop, or source sheet.
- `select_animation_clip`: select a clip in Sprite Studio.

## Example Agent Flow

1. Call `get_project` to inspect available spritesheets and clips.
2. Call `create_platformer_player`.
3. Call `add_animation_clip` with a run, idle, jump, or attack clip.
4. Call `select_animation_clip` so the editor opens it in Sprite Studio.
5. Call `set_transform` to position the player.

The current server controls the active in-memory editor session. Persistent save/load and packaged game export are still separate editor features.
