# Gamify Editor V1 Design

## Summary

Gamify Editor is a Unity-like desktop game editor built with Tauri. Version 1 establishes a real, working editor foundation: a native desktop shell, shared 2D/3D scene model, editor UI, 3D viewport, project save/load, basic 2D sprite animation, audio components, physics components, and an MCP server so AI agents and IDEs can inspect and control the editor.

The first version favors a small but complete vertical slice over a large unfinished engine. It should be possible to create a project, add entities, edit transforms and components, preview the scene, save/load files, and drive those operations through MCP tools.

## Goals

- Build a Tauri desktop editor with a Unity-like layout.
- Use one shared entity/component scene model for both 2D and 3D.
- Provide an initial 3D viewport powered by Three.js.
- Represent 2D sprites, sprite animations, audio, and physics as first-class components in the scene model.
- Store projects in transparent JSON files that are easy for humans, IDEs, and agents to inspect.
- Run a local MCP sidecar server that exposes scene and editor operations.
- Keep the architecture ready for richer 2D/3D runtime systems without blocking the first working editor.

## Non-Goals For V1

- No production game export/build pipeline.
- No full Unity-compatible feature parity.
- No terrain editor, material graph, visual scripting, or animation state machine.
- No complete 3D physics authoring system with constraints and joints.
- No advanced audio mixer, buses, DSP effects, or timeline.
- No marketplace/package manager.

## Product Shape

The editor opens as a native desktop application with five primary regions:

- Toolbar: project actions, scene actions, transform tools, play/stop, viewport mode.
- Hierarchy: tree/list of entities in the active scene.
- Viewport: first version uses a Three.js 3D viewport with grid, camera, lights, primitives, selection, and transform editing.
- Inspector: component editing for the selected entity.
- Project panel: project metadata, scenes, and assets.

The layout should feel like an editor first, not a landing page. It should prioritize dense, scannable controls and predictable workflows.

## Architecture

The system has three cooperating processes/layers:

1. Tauri Desktop Shell
   - Owns the native window.
   - Provides secure file system access.
   - Opens and saves project files.
   - Starts and stops the MCP sidecar.
   - Provides native app affordances such as menus and dialogs.

2. Editor Frontend
   - React and TypeScript UI.
   - Three.js viewport for the initial 3D editing experience.
   - Shared editor state for scene data, selection, undo/redo, active tool, and viewport mode.
   - Component editors for transforms, primitives, sprites, audio, and physics.

3. MCP Sidecar Server
   - Node/TypeScript process launched locally.
   - Exposes MCP tools for AI agents and IDEs.
   - Communicates with the live editor over a local WebSocket bridge.
   - Can also read/write project JSON files when the editor is not actively connected, where safe.

## Scene Model

The core scene model is TypeScript-first and serializable to JSON.

Each scene contains:

- `id`
- `name`
- `entities`
- `settings`

Each entity contains:

- `id`
- `name`
- `parentId`
- `children`
- `enabled`
- `components`

Every entity can have a `Transform` component. 2D and 3D use the same component contract but can interpret fields differently depending on renderer and mode.

Initial component types:

- `Transform`
- `MeshRenderer3D`
- `Camera3D`
- `Light3D`
- `SpriteRenderer2D`
- `SpriteAnimation2D`
- `Camera2D`
- `AudioSource`
- `MusicTrack`
- `Rigidbody2D`
- `BoxCollider2D`
- `CircleCollider2D`
- `Rigidbody3D`
- `BoxCollider3D`
- `SphereCollider3D`

Component schemas should include stable type names and version fields so project files can be migrated later.

## 2D, Sprite Animation, And Audio

V1 treats sprite animation and audio as real editor concepts even if the tooling starts simple.

Sprite animation support includes:

- Sprite or sprite sheet asset metadata.
- Frame width and height.
- Frame count.
- Frames per second.
- Looping flag.
- Preview playback in editor.
- Runtime-ready `SpriteAnimation2D` component data.

Audio support includes:

- Audio assets in the project asset folder.
- `AudioSource` component for sound effects.
- `MusicTrack` component for looping background music.
- Volume, loop, autoplay, and asset reference fields.
- Basic preview/play/stop from the inspector.

Advanced animation timelines, animation state machines, blend trees, audio buses, and effects are reserved for later versions.

## Physics

V1 includes physics as component data and basic runtime/editor simulation.

2D physics is the first serious target:

- `Rigidbody2D`
- `BoxCollider2D`
- `CircleCollider2D`
- gravity setting
- static/dynamic body mode
- simple collision boundaries

3D physics components exist in the scene schema from the start:

- `Rigidbody3D`
- `BoxCollider3D`
- `SphereCollider3D`

The initial 3D physics behavior may be limited, but the editor should be able to add, inspect, save, and load those components. A mature physics integration can be added behind the same component contracts later.

## Project Format

Projects are folders with plain JSON files:

```text
project.gamify.json
scenes/
  main.scene.json
assets/
  sprites/
  audio/
  models/
```

`project.gamify.json` stores:

- project id
- project name
- editor version
- default scene path
- asset roots

Scene files store the serializable scene model. Asset metadata can start inline in component fields and move to asset manifest files later when needed.

## MCP Tools

The MCP server should expose a small, useful first tool set:

- `get_project`
- `open_project`
- `save_project`
- `get_scene`
- `save_scene`
- `list_entities`
- `create_entity`
- `delete_entity`
- `rename_entity`
- `set_parent`
- `select_entity`
- `set_transform`
- `add_component`
- `remove_component`
- `update_component`
- `run_editor_command`

The MCP sidecar communicates with the editor through a WebSocket bridge. Tool responses should be structured JSON with clear errors. Tools must avoid destructive changes unless they are explicit, such as `delete_entity`.

## Data Flow

Normal editor flow:

1. Tauri opens a project folder.
2. Frontend loads `project.gamify.json`.
3. Frontend loads the active scene.
4. UI edits update the in-memory scene store.
5. Viewport reacts to scene changes.
6. Save writes JSON files through Tauri commands.

MCP flow:

1. Agent or IDE calls an MCP tool.
2. MCP sidecar validates the request.
3. Sidecar sends a command to the live editor over WebSocket.
4. Editor applies the command through the same scene command layer used by UI actions.
5. Editor returns structured result data.
6. Sidecar returns the MCP tool response.

The UI and MCP server must share command semantics so agent-driven edits and human edits behave consistently.

## Error Handling

- Invalid project files show clear load errors and do not crash the editor.
- Unknown component types are preserved when possible and shown as unsupported components.
- MCP requests validate entity ids, component ids, and schema fields before applying changes.
- Save operations write atomically where practical to reduce corrupted project files.
- WebSocket disconnects should leave the editor usable and allow the MCP sidecar to reconnect.

## Testing And Verification

Initial testing should cover:

- Scene model creation and serialization.
- Component add/update/remove behavior.
- Project and scene save/load.
- MCP tool validation and command handling.
- WebSocket bridge command round trips.
- Basic viewport rendering smoke test.
- Inspector editing for representative components.

Manual verification should confirm:

- Desktop app launches.
- A project can be created/opened.
- Entities can be added, selected, edited, saved, and reloaded.
- Basic 3D objects render in the viewport.
- Sprite animation and audio components can be added and edited.
- Physics components can be added and saved.
- MCP tools can create and edit scene entities in the live editor.

## Implementation Order

1. Scaffold Tauri, React, TypeScript, and workspace package structure.
2. Add shared scene model and component schemas.
3. Build editor shell layout and state store.
4. Add project and scene save/load.
5. Add Three.js viewport with primitives, grid, camera, and selection.
6. Add hierarchy and inspector editing.
7. Add sprite animation, audio, and physics component editors.
8. Add MCP sidecar server and WebSocket bridge.
9. Wire MCP tools into the same editor command layer.
10. Add tests and launch verification.

## Open Decisions

- Whether to use a dedicated ECS library later or keep a custom lightweight component model.
- Which 2D rendering library to use after the first 3D viewport: PixiJS, Phaser internals, or custom canvas/WebGL.
- Which physics libraries to adopt for mature simulation: likely Rapier for 2D/3D or separate specialized libraries.
- Whether the app eventually wraps the Node MCP sidecar as a bundled binary or runs it through the project toolchain during development.

These decisions do not block V1 because the data contracts are explicit and can support later implementation choices.
