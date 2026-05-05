# Gamify Editor V1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first working foundation of a Tauri-based Unity-like editor with shared 2D/3D scene data, component editing, project JSON, a Three.js viewport, and an MCP sidecar.

**Architecture:** Use a TypeScript monorepo with `apps/editor` for the React/Tauri frontend, `packages/scene-core` for shared scene types and commands, and `packages/mcp-server` for the MCP/WebSocket sidecar. The editor and MCP server both use `scene-core` so human and agent edits follow the same data contracts.

**Tech Stack:** Tauri, React, TypeScript, Vite, Three.js, Zustand, Vitest, Node.js, `@modelcontextprotocol/sdk`, `ws`.

---

## Scope Note

Rust is not installed in the current environment. Implement and verify the Node/TypeScript workspace, Vite editor, shared scene model, and MCP sidecar first. The Tauri Rust shell files should still be created so the project is ready to run with `npm run tauri:dev` after installing Rust.

## File Structure

- `package.json`: npm workspace root scripts.
- `tsconfig.base.json`: shared TypeScript settings.
- `vitest.config.ts`: workspace test configuration.
- `.gitignore`: generated files and dependencies.
- `apps/editor/package.json`: editor app dependencies and scripts.
- `apps/editor/index.html`: Vite entry HTML.
- `apps/editor/src/main.tsx`: React entrypoint.
- `apps/editor/src/App.tsx`: editor shell composition.
- `apps/editor/src/styles.css`: desktop editor layout and controls.
- `apps/editor/src/state/editorStore.ts`: scene state, selection, and command dispatch.
- `apps/editor/src/components/Toolbar.tsx`: top editor commands.
- `apps/editor/src/components/HierarchyPanel.tsx`: entity list and selection.
- `apps/editor/src/components/InspectorPanel.tsx`: component editors.
- `apps/editor/src/components/ProjectPanel.tsx`: project/assets panel.
- `apps/editor/src/components/Viewport3D.tsx`: Three.js viewport.
- `apps/editor/src/bridge/mcpBridge.ts`: WebSocket client bridge for MCP commands.
- `apps/editor/src-tauri/Cargo.toml`: Tauri Rust package manifest.
- `apps/editor/src-tauri/tauri.conf.json`: Tauri app configuration.
- `apps/editor/src-tauri/src/main.rs`: minimal Tauri command layer.
- `packages/scene-core/package.json`: shared package metadata.
- `packages/scene-core/src/types.ts`: project, scene, entity, and component types.
- `packages/scene-core/src/defaults.ts`: default project, scene, entities, and components.
- `packages/scene-core/src/commands.ts`: pure scene mutation commands.
- `packages/scene-core/src/serialization.ts`: JSON parsing and validation helpers.
- `packages/scene-core/src/index.ts`: public exports.
- `packages/scene-core/src/*.test.ts`: unit tests for core behavior.
- `packages/mcp-server/package.json`: MCP sidecar dependencies and scripts.
- `packages/mcp-server/src/editorClient.ts`: WebSocket client for live editor.
- `packages/mcp-server/src/tools.ts`: MCP tool definitions and handlers.
- `packages/mcp-server/src/server.ts`: MCP stdio server entrypoint.
- `packages/mcp-server/src/*.test.ts`: tool validation tests.

---

### Task 1: Workspace Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `apps/editor/package.json`
- Create: `packages/scene-core/package.json`
- Create: `packages/mcp-server/package.json`

- [ ] **Step 1: Create root workspace files**

Create `package.json`:

```json
{
  "name": "gamify-editor",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "npm --workspace @gamify/editor run dev",
    "tauri:dev": "npm --workspace @gamify/editor run tauri:dev",
    "mcp": "npm --workspace @gamify/mcp-server run dev",
    "build": "npm run build --workspaces",
    "test": "vitest run",
    "typecheck": "tsc -b"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.1.1",
    "typescript": "^5.9.3",
    "vite": "^7.2.6",
    "vitest": "^4.0.15"
  }
}
```

Create `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  }
}
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts"]
  }
});
```

Create `.gitignore`:

```gitignore
node_modules/
dist/
dist-ssr/
target/
.vite/
.DS_Store
*.log
```

- [ ] **Step 2: Create package manifests**

Create `apps/editor/package.json`:

```json
{
  "name": "@gamify/editor",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 127.0.0.1",
    "tauri:dev": "tauri dev"
  },
  "dependencies": {
    "@gamify/scene-core": "0.1.0",
    "@tauri-apps/api": "^2.9.0",
    "@tauri-apps/plugin-dialog": "^2.4.1",
    "@tauri-apps/plugin-fs": "^2.4.4",
    "lucide-react": "^0.468.0",
    "react": "^19.2.1",
    "react-dom": "^19.2.1",
    "three": "^0.181.2",
    "zustand": "^5.0.9"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.9.4",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "@types/three": "^0.181.0"
  }
}
```

Create `packages/scene-core/package.json`:

```json
{
  "name": "@gamify/scene-core",
  "version": "0.1.0",
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "vitest run"
  }
}
```

Create `packages/mcp-server/package.json`:

```json
{
  "name": "@gamify/mcp-server",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "tsx src/server.ts",
    "build": "tsc -p tsconfig.json",
    "test": "vitest run"
  },
  "dependencies": {
    "@gamify/scene-core": "0.1.0",
    "@modelcontextprotocol/sdk": "^1.24.1",
    "ws": "^8.18.3",
    "zod": "^4.1.13"
  },
  "devDependencies": {
    "@types/ws": "^8.18.1",
    "tsx": "^4.20.6"
  }
}
```

- [ ] **Step 3: Install dependencies**

Run: `npm install`

Expected: npm creates `package-lock.json` and installs workspace dependencies.

- [ ] **Step 4: Commit scaffold**

```bash
git add package.json package-lock.json tsconfig.base.json vitest.config.ts .gitignore apps/editor/package.json packages/scene-core/package.json packages/mcp-server/package.json
git commit -m "chore: scaffold editor workspace"
```

---

### Task 2: Shared Scene Core

**Files:**
- Create: `packages/scene-core/tsconfig.json`
- Create: `packages/scene-core/src/types.ts`
- Create: `packages/scene-core/src/defaults.ts`
- Create: `packages/scene-core/src/commands.ts`
- Create: `packages/scene-core/src/serialization.ts`
- Create: `packages/scene-core/src/index.ts`
- Create: `packages/scene-core/src/commands.test.ts`

- [ ] **Step 1: Write tests for scene commands**

Create `packages/scene-core/src/commands.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { addComponent, createDefaultScene, createEntity, setTransform, updateComponent } from "./index";

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
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- packages/scene-core/src/commands.test.ts`

Expected: FAIL because `packages/scene-core/src/index.ts` does not exist yet.

- [ ] **Step 3: Implement scene core**

Create `packages/scene-core/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

Create `packages/scene-core/src/types.ts`:

```ts
export type Vec3 = { x: number; y: number; z: number };

export type ComponentType =
  | "Transform"
  | "MeshRenderer3D"
  | "Camera3D"
  | "Light3D"
  | "SpriteRenderer2D"
  | "SpriteAnimation2D"
  | "Camera2D"
  | "AudioSource"
  | "MusicTrack"
  | "Rigidbody2D"
  | "BoxCollider2D"
  | "CircleCollider2D"
  | "Rigidbody3D"
  | "BoxCollider3D"
  | "SphereCollider3D";

export type BaseComponent = {
  id: string;
  type: ComponentType;
  version: number;
};

export type TransformComponent = BaseComponent & {
  type: "Transform";
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
};

export type MeshRenderer3DComponent = BaseComponent & {
  type: "MeshRenderer3D";
  primitive: "cube" | "sphere" | "plane";
  color: string;
};

export type SpriteAnimation2DComponent = BaseComponent & {
  type: "SpriteAnimation2D";
  assetPath: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  fps: number;
  loop: boolean;
  playing: boolean;
};

export type AudioSourceComponent = BaseComponent & {
  type: "AudioSource" | "MusicTrack";
  assetPath: string;
  volume: number;
  loop: boolean;
  autoplay: boolean;
};

export type PhysicsBody2DComponent = BaseComponent & {
  type: "Rigidbody2D";
  bodyType: "static" | "dynamic";
  gravityScale: number;
};

export type ColliderComponent = BaseComponent & {
  type: "BoxCollider2D" | "CircleCollider2D" | "Rigidbody3D" | "BoxCollider3D" | "SphereCollider3D";
  size?: Vec3;
  radius?: number;
};

export type SceneComponent =
  | TransformComponent
  | MeshRenderer3DComponent
  | SpriteAnimation2DComponent
  | AudioSourceComponent
  | PhysicsBody2DComponent
  | ColliderComponent
  | (BaseComponent & Record<string, unknown>);

export type Entity = {
  id: string;
  name: string;
  parentId: string | null;
  children: string[];
  enabled: boolean;
  components: SceneComponent[];
};

export type SceneSettings = {
  gravity: Vec3;
  viewportMode: "2d" | "3d";
};

export type Scene = {
  id: string;
  name: string;
  entities: Entity[];
  settings: SceneSettings;
};

export type GamifyProject = {
  id: string;
  name: string;
  editorVersion: string;
  defaultScenePath: string;
  assetRoots: string[];
};
```

Create `packages/scene-core/src/defaults.ts`:

```ts
import type { Entity, GamifyProject, MeshRenderer3DComponent, Scene, TransformComponent, Vec3 } from "./types";

const unit: Vec3 = { x: 1, y: 1, z: 1 };
const zero: Vec3 = { x: 0, y: 0, z: 0 };

export function createTransform(id = "transform"): TransformComponent {
  return { id, type: "Transform", version: 1, position: zero, rotation: zero, scale: unit };
}

export function createMeshRenderer(id = "mesh-renderer"): MeshRenderer3DComponent {
  return { id, type: "MeshRenderer3D", version: 1, primitive: "cube", color: "#6ee7b7" };
}

export function createDefaultEntity(input: Partial<Entity> = {}): Entity {
  return {
    id: input.id ?? crypto.randomUUID(),
    name: input.name ?? "Entity",
    parentId: input.parentId ?? null,
    children: input.children ?? [],
    enabled: input.enabled ?? true,
    components: input.components ?? [createTransform()]
  };
}

export function createDefaultScene(name = "Main"): Scene {
  return {
    id: crypto.randomUUID(),
    name,
    entities: [
      createDefaultEntity({
        id: "camera",
        name: "Main Camera",
        components: [
          createTransform(),
          { id: "camera-3d", type: "Camera3D", version: 1, fov: 60, near: 0.1, far: 1000 }
        ]
      }),
      createDefaultEntity({
        id: "cube",
        name: "Cube",
        components: [createTransform(), createMeshRenderer()]
      })
    ],
    settings: { gravity: { x: 0, y: -9.81, z: 0 }, viewportMode: "3d" }
  };
}

export function createDefaultProject(name = "Untitled Gamify Project"): GamifyProject {
  return {
    id: crypto.randomUUID(),
    name,
    editorVersion: "0.1.0",
    defaultScenePath: "scenes/main.scene.json",
    assetRoots: ["assets"]
  };
}
```

Create `packages/scene-core/src/commands.ts`:

```ts
import { createDefaultEntity, createTransform } from "./defaults";
import type { Entity, Scene, SceneComponent, TransformComponent, Vec3 } from "./types";

function replaceEntity(scene: Scene, entity: Entity): Scene {
  return { ...scene, entities: scene.entities.map((candidate) => (candidate.id === entity.id ? entity : candidate)) };
}

export function createEntity(scene: Scene, input: Partial<Entity> = {}): Scene {
  return { ...scene, entities: [...scene.entities, createDefaultEntity(input)] };
}

export function deleteEntity(scene: Scene, entityId: string): Scene {
  return {
    ...scene,
    entities: scene.entities
      .filter((entity) => entity.id !== entityId)
      .map((entity) => ({ ...entity, children: entity.children.filter((childId) => childId !== entityId) }))
  };
}

export function renameEntity(scene: Scene, entityId: string, name: string): Scene {
  const entity = scene.entities.find((candidate) => candidate.id === entityId);
  if (!entity) throw new Error(`Entity not found: ${entityId}`);
  return replaceEntity(scene, { ...entity, name });
}

export function setParent(scene: Scene, entityId: string, parentId: string | null): Scene {
  if (parentId === entityId) throw new Error("Entity cannot be its own parent");
  const entity = scene.entities.find((candidate) => candidate.id === entityId);
  if (!entity) throw new Error(`Entity not found: ${entityId}`);
  if (parentId && !scene.entities.some((candidate) => candidate.id === parentId)) {
    throw new Error(`Parent entity not found: ${parentId}`);
  }

  const withoutOldLinks = scene.entities.map((candidate) => ({
    ...candidate,
    children: candidate.children.filter((childId) => childId !== entityId)
  }));

  const withParent = withoutOldLinks.map((candidate) => {
    if (candidate.id === entityId) return { ...candidate, parentId };
    if (candidate.id === parentId) return { ...candidate, children: [...candidate.children, entityId] };
    return candidate;
  });

  return { ...scene, entities: withParent };
}

export function addComponent(scene: Scene, entityId: string, component: SceneComponent): Scene {
  const entity = scene.entities.find((candidate) => candidate.id === entityId);
  if (!entity) throw new Error(`Entity not found: ${entityId}`);
  if (entity.components.some((candidate) => candidate.id === component.id)) {
    throw new Error(`Component already exists: ${component.id}`);
  }
  return replaceEntity(scene, { ...entity, components: [...entity.components, component] });
}

export function removeComponent(scene: Scene, entityId: string, componentId: string): Scene {
  const entity = scene.entities.find((candidate) => candidate.id === entityId);
  if (!entity) throw new Error(`Entity not found: ${entityId}`);
  return replaceEntity(scene, { ...entity, components: entity.components.filter((component) => component.id !== componentId) });
}

export function updateComponent(scene: Scene, entityId: string, componentId: string, patch: Record<string, unknown>): Scene {
  const entity = scene.entities.find((candidate) => candidate.id === entityId);
  if (!entity) throw new Error(`Entity not found: ${entityId}`);
  return replaceEntity(scene, {
    ...entity,
    components: entity.components.map((component) =>
      component.id === componentId ? ({ ...component, ...patch } as SceneComponent) : component
    )
  });
}

export function setTransform(scene: Scene, entityId: string, patch: Partial<Pick<TransformComponent, "position" | "rotation" | "scale">>): Scene {
  const entity = scene.entities.find((candidate) => candidate.id === entityId);
  if (!entity) throw new Error(`Entity not found: ${entityId}`);
  const transform = entity.components.find((component): component is TransformComponent => component.type === "Transform") ?? createTransform();
  const nextTransform: TransformComponent = {
    ...transform,
    position: mergeVec3(transform.position, patch.position),
    rotation: mergeVec3(transform.rotation, patch.rotation),
    scale: mergeVec3(transform.scale, patch.scale)
  };
  const others = entity.components.filter((component) => component.id !== transform.id);
  return replaceEntity(scene, { ...entity, components: [nextTransform, ...others] });
}

function mergeVec3(current: Vec3, patch?: Partial<Vec3>): Vec3 {
  return patch ? { ...current, ...patch } : current;
}
```

Create `packages/scene-core/src/serialization.ts`:

```ts
import type { GamifyProject, Scene } from "./types";

export function parseProjectJson(json: string): GamifyProject {
  const parsed = JSON.parse(json) as GamifyProject;
  if (!parsed.id || !parsed.name || !parsed.defaultScenePath) {
    throw new Error("Invalid project file: id, name, and defaultScenePath are required");
  }
  return parsed;
}

export function parseSceneJson(json: string): Scene {
  const parsed = JSON.parse(json) as Scene;
  if (!parsed.id || !parsed.name || !Array.isArray(parsed.entities)) {
    throw new Error("Invalid scene file: id, name, and entities are required");
  }
  return parsed;
}

export function toPrettyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}
```

Create `packages/scene-core/src/index.ts`:

```ts
export * from "./types";
export * from "./defaults";
export * from "./commands";
export * from "./serialization";
```

- [ ] **Step 4: Run tests to verify scene core**

Run: `npm test -- packages/scene-core/src/commands.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit scene core**

```bash
git add packages/scene-core
git commit -m "feat: add shared scene core"
```

---

### Task 3: Editor Shell And State Store

**Files:**
- Create: `apps/editor/tsconfig.json`
- Create: `apps/editor/index.html`
- Create: `apps/editor/src/main.tsx`
- Create: `apps/editor/src/App.tsx`
- Create: `apps/editor/src/styles.css`
- Create: `apps/editor/src/state/editorStore.ts`
- Create: `apps/editor/src/components/Toolbar.tsx`
- Create: `apps/editor/src/components/HierarchyPanel.tsx`
- Create: `apps/editor/src/components/InspectorPanel.tsx`
- Create: `apps/editor/src/components/ProjectPanel.tsx`

- [ ] **Step 1: Implement the React entry and editor store**

Create `apps/editor/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "jsx": "react-jsx",
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

Create `apps/editor/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Gamify Editor</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `apps/editor/src/main.tsx`:

```tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Create `apps/editor/src/state/editorStore.ts`:

```ts
import { create } from "zustand";
import {
  addComponent,
  createDefaultProject,
  createDefaultScene,
  createEntity,
  setTransform,
  updateComponent,
  type GamifyProject,
  type Scene,
  type SceneComponent,
  type Vec3
} from "@gamify/scene-core";

type EditorStore = {
  project: GamifyProject;
  scene: Scene;
  selectedEntityId: string | null;
  selectEntity: (entityId: string | null) => void;
  createEntity: (name?: string) => void;
  setTransform: (entityId: string, patch: { position?: Partial<Vec3>; rotation?: Partial<Vec3>; scale?: Partial<Vec3> }) => void;
  addComponent: (entityId: string, component: SceneComponent) => void;
  updateComponent: (entityId: string, componentId: string, patch: Record<string, unknown>) => void;
};

export const useEditorStore = create<EditorStore>((set) => ({
  project: createDefaultProject("Gamify Sample"),
  scene: createDefaultScene("Main"),
  selectedEntityId: "cube",
  selectEntity: (selectedEntityId) => set({ selectedEntityId }),
  createEntity: (name = "Entity") =>
    set((state) => {
      const scene = createEntity(state.scene, { name });
      return { scene, selectedEntityId: scene.entities.at(-1)?.id ?? null };
    }),
  setTransform: (entityId, patch) => set((state) => ({ scene: setTransform(state.scene, entityId, patch) })),
  addComponent: (entityId, component) => set((state) => ({ scene: addComponent(state.scene, entityId, component) })),
  updateComponent: (entityId, componentId, patch) =>
    set((state) => ({ scene: updateComponent(state.scene, entityId, componentId, patch) }))
}));
```

- [ ] **Step 2: Implement shell components**

Create `apps/editor/src/App.tsx`:

```tsx
import { HierarchyPanel } from "./components/HierarchyPanel";
import { InspectorPanel } from "./components/InspectorPanel";
import { ProjectPanel } from "./components/ProjectPanel";
import { Toolbar } from "./components/Toolbar";

export function App() {
  return (
    <main className="editor-shell">
      <Toolbar />
      <section className="editor-grid">
        <HierarchyPanel />
        <div className="viewport-placeholder">3D Viewport loads in Task 4</div>
        <InspectorPanel />
        <ProjectPanel />
      </section>
    </main>
  );
}
```

Create `apps/editor/src/components/Toolbar.tsx`:

```tsx
import { Box, Play, Save } from "lucide-react";
import { useEditorStore } from "../state/editorStore";

export function Toolbar() {
  const createEntity = useEditorStore((state) => state.createEntity);

  return (
    <header className="toolbar">
      <strong className="brand">Gamify Editor</strong>
      <button title="Add entity" onClick={() => createEntity("Entity")}>
        <Box size={16} /> Add
      </button>
      <button title="Save scene">
        <Save size={16} /> Save
      </button>
      <button title="Play preview">
        <Play size={16} /> Play
      </button>
    </header>
  );
}
```

Create `apps/editor/src/components/HierarchyPanel.tsx`:

```tsx
import { useEditorStore } from "../state/editorStore";

export function HierarchyPanel() {
  const entities = useEditorStore((state) => state.scene.entities);
  const selectedEntityId = useEditorStore((state) => state.selectedEntityId);
  const selectEntity = useEditorStore((state) => state.selectEntity);

  return (
    <aside className="panel hierarchy">
      <h2>Hierarchy</h2>
      {entities.map((entity) => (
        <button
          className={entity.id === selectedEntityId ? "entity-row selected" : "entity-row"}
          key={entity.id}
          onClick={() => selectEntity(entity.id)}
        >
          {entity.name}
        </button>
      ))}
    </aside>
  );
}
```

Create `apps/editor/src/components/ProjectPanel.tsx`:

```tsx
import { useEditorStore } from "../state/editorStore";

export function ProjectPanel() {
  const project = useEditorStore((state) => state.project);

  return (
    <aside className="panel project-panel">
      <h2>Project</h2>
      <dl>
        <dt>Name</dt>
        <dd>{project.name}</dd>
        <dt>Scene</dt>
        <dd>{project.defaultScenePath}</dd>
      </dl>
    </aside>
  );
}
```

Create `apps/editor/src/components/InspectorPanel.tsx`:

```tsx
import { useEditorStore } from "../state/editorStore";

export function InspectorPanel() {
  const scene = useEditorStore((state) => state.scene);
  const selectedEntityId = useEditorStore((state) => state.selectedEntityId);
  const setTransform = useEditorStore((state) => state.setTransform);
  const entity = scene.entities.find((candidate) => candidate.id === selectedEntityId);
  const transform = entity?.components.find((component) => component.type === "Transform");

  return (
    <aside className="panel inspector">
      <h2>Inspector</h2>
      {!entity ? <p>No entity selected.</p> : null}
      {entity ? <h3>{entity.name}</h3> : null}
      {entity && transform?.type === "Transform" ? (
        <section className="component-editor">
          <h4>Transform</h4>
          {(["x", "y", "z"] as const).map((axis) => (
            <label key={axis}>
              Position {axis.toUpperCase()}
              <input
                type="number"
                value={transform.position[axis]}
                onChange={(event) =>
                  setTransform(entity.id, { position: { [axis]: Number(event.currentTarget.value) } })
                }
              />
            </label>
          ))}
        </section>
      ) : null}
      {entity?.components.map((component) => (
        <section className="component-editor" key={component.id}>
          <h4>{component.type}</h4>
          <code>{component.id}</code>
        </section>
      ))}
    </aside>
  );
}
```

- [ ] **Step 3: Add editor styling**

Create `apps/editor/src/styles.css`:

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #15181d;
  color: #e5e7eb;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

button,
input {
  font: inherit;
}

.editor-shell {
  min-height: 100vh;
  display: grid;
  grid-template-rows: 44px 1fr;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: #20242b;
  border-bottom: 1px solid #343a46;
}

.toolbar button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  border: 1px solid #475161;
  background: #2a303a;
  color: #f3f4f6;
  border-radius: 6px;
}

.brand {
  margin-right: 12px;
}

.editor-grid {
  display: grid;
  grid-template-columns: 240px minmax(320px, 1fr) 300px;
  grid-template-rows: minmax(0, 1fr) 180px;
  min-height: 0;
}

.panel {
  min-width: 0;
  min-height: 0;
  padding: 12px;
  overflow: auto;
  background: #1b1f26;
  border-color: #343a46;
}

.hierarchy {
  grid-row: 1 / span 2;
  border-right: 1px solid #343a46;
}

.inspector {
  grid-column: 3;
  grid-row: 1 / span 2;
  border-left: 1px solid #343a46;
}

.project-panel {
  grid-column: 2;
  grid-row: 2;
  border-top: 1px solid #343a46;
}

.viewport-placeholder {
  display: grid;
  place-items: center;
  min-height: 0;
  background: #111318;
  color: #9ca3af;
}

.entity-row {
  width: 100%;
  display: block;
  margin-bottom: 4px;
  padding: 7px 8px;
  text-align: left;
  color: #d1d5db;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
}

.entity-row.selected {
  color: #ffffff;
  background: #334155;
  border-color: #64748b;
}

.component-editor {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #343a46;
}

.component-editor label {
  display: grid;
  gap: 4px;
  margin: 8px 0;
  color: #cbd5e1;
}

.component-editor input {
  width: 100%;
  padding: 6px;
  color: #f8fafc;
  background: #111827;
  border: 1px solid #475569;
  border-radius: 5px;
}
```

- [ ] **Step 4: Run editor typecheck/build**

Run: `npm --workspace @gamify/editor run build`

Expected: PASS and `apps/editor/dist` is created.

- [ ] **Step 5: Commit editor shell**

```bash
git add apps/editor
git commit -m "feat: add editor shell"
```

---

### Task 4: Three.js Viewport

**Files:**
- Create: `apps/editor/src/components/Viewport3D.tsx`
- Modify: `apps/editor/src/App.tsx`
- Modify: `apps/editor/src/styles.css`

- [ ] **Step 1: Implement Three.js viewport**

Create `apps/editor/src/components/Viewport3D.tsx`:

```tsx
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useEditorStore } from "../state/editorStore";

export function Viewport3D() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sceneData = useEditorStore((state) => state.scene);
  const selectEntity = useEditorStore((state) => state.selectEntity);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(host.clientWidth, host.clientHeight);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#111318");
    scene.add(new THREE.GridHelper(20, 20, "#475569", "#273241"));

    const camera = new THREE.PerspectiveCamera(60, host.clientWidth / host.clientHeight, 0.1, 1000);
    camera.position.set(5, 4, 7);
    camera.lookAt(0, 0, 0);

    const light = new THREE.DirectionalLight("#ffffff", 1);
    light.position.set(4, 8, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight("#ffffff", 0.35));

    const pickables: THREE.Object3D[] = [];
    for (const entity of sceneData.entities) {
      const transform = entity.components.find((component) => component.type === "Transform");
      const meshRenderer = entity.components.find((component) => component.type === "MeshRenderer3D");
      if (transform?.type !== "Transform" || meshRenderer?.type !== "MeshRenderer3D") continue;

      const geometry =
        meshRenderer.primitive === "sphere"
          ? new THREE.SphereGeometry(0.5, 32, 16)
          : meshRenderer.primitive === "plane"
            ? new THREE.PlaneGeometry(1, 1)
            : new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ color: meshRenderer.color });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = entity.id;
      mesh.position.set(transform.position.x, transform.position.y, transform.position.z);
      mesh.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
      mesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
      scene.add(mesh);
      pickables.push(mesh);
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function handlePointerDown(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(pickables)[0];
      selectEntity(hit?.object.name ?? null);
    }

    function resize() {
      const width = host.clientWidth;
      const height = host.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    }

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    let frame = 0;
    function render() {
      frame = requestAnimationFrame(render);
      renderer.render(scene, camera);
    }
    render();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, [sceneData, selectEntity]);

  return <div className="viewport-3d" ref={hostRef} />;
}
```

- [ ] **Step 2: Replace viewport placeholder**

Modify `apps/editor/src/App.tsx`:

```tsx
import { HierarchyPanel } from "./components/HierarchyPanel";
import { InspectorPanel } from "./components/InspectorPanel";
import { ProjectPanel } from "./components/ProjectPanel";
import { Toolbar } from "./components/Toolbar";
import { Viewport3D } from "./components/Viewport3D";

export function App() {
  return (
    <main className="editor-shell">
      <Toolbar />
      <section className="editor-grid">
        <HierarchyPanel />
        <Viewport3D />
        <InspectorPanel />
        <ProjectPanel />
      </section>
    </main>
  );
}
```

Append to `apps/editor/src/styles.css`:

```css
.viewport-3d {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: #111318;
}

.viewport-3d canvas {
  display: block;
  width: 100%;
  height: 100%;
}
```

- [ ] **Step 3: Build editor**

Run: `npm --workspace @gamify/editor run build`

Expected: PASS.

- [ ] **Step 4: Commit viewport**

```bash
git add apps/editor/src
git commit -m "feat: render initial three viewport"
```

---

### Task 5: Component Editors For Sprite, Audio, And Physics

**Files:**
- Modify: `apps/editor/src/components/Toolbar.tsx`
- Modify: `apps/editor/src/components/InspectorPanel.tsx`

- [ ] **Step 1: Add component creation actions**

Modify `apps/editor/src/components/Toolbar.tsx` so it contains:

```tsx
import { Box, Music, Play, Save, Sparkles, Volume2 } from "lucide-react";
import { useEditorStore } from "../state/editorStore";

export function Toolbar() {
  const createEntity = useEditorStore((state) => state.createEntity);
  const selectedEntityId = useEditorStore((state) => state.selectedEntityId);
  const addComponent = useEditorStore((state) => state.addComponent);

  return (
    <header className="toolbar">
      <strong className="brand">Gamify Editor</strong>
      <button title="Add entity" onClick={() => createEntity("Entity")}>
        <Box size={16} /> Add
      </button>
      <button
        title="Add sprite animation"
        disabled={!selectedEntityId}
        onClick={() =>
          selectedEntityId &&
          addComponent(selectedEntityId, {
            id: crypto.randomUUID(),
            type: "SpriteAnimation2D",
            version: 1,
            assetPath: "assets/sprites/hero.png",
            frameWidth: 32,
            frameHeight: 32,
            frameCount: 4,
            fps: 8,
            loop: true,
            playing: false
          })
        }
      >
        <Sparkles size={16} /> Sprite
      </button>
      <button
        title="Add sound effect"
        disabled={!selectedEntityId}
        onClick={() =>
          selectedEntityId &&
          addComponent(selectedEntityId, {
            id: crypto.randomUUID(),
            type: "AudioSource",
            version: 1,
            assetPath: "assets/audio/sound.wav",
            volume: 0.8,
            loop: false,
            autoplay: false
          })
        }
      >
        <Volume2 size={16} /> Sound
      </button>
      <button
        title="Add music"
        disabled={!selectedEntityId}
        onClick={() =>
          selectedEntityId &&
          addComponent(selectedEntityId, {
            id: crypto.randomUUID(),
            type: "MusicTrack",
            version: 1,
            assetPath: "assets/audio/music.ogg",
            volume: 0.6,
            loop: true,
            autoplay: true
          })
        }
      >
        <Music size={16} /> Music
      </button>
      <button title="Save scene">
        <Save size={16} /> Save
      </button>
      <button title="Play preview">
        <Play size={16} /> Play
      </button>
    </header>
  );
}
```

- [ ] **Step 2: Add generic editable component fields**

Modify `apps/editor/src/components/InspectorPanel.tsx` to render editable controls for `SpriteAnimation2D`, `AudioSource`, `MusicTrack`, `Rigidbody2D`, `BoxCollider2D`, and `CircleCollider2D`. Use `updateComponent(entity.id, component.id, { field: value })` for each input change. Ensure numeric fields use `Number(event.currentTarget.value)` and checkbox fields use `event.currentTarget.checked`.

- [ ] **Step 3: Build editor**

Run: `npm --workspace @gamify/editor run build`

Expected: PASS.

- [ ] **Step 4: Commit component editors**

```bash
git add apps/editor/src/components
git commit -m "feat: edit sprite audio and physics components"
```

---

### Task 6: Project Save And Load

**Files:**
- Modify: `apps/editor/src/state/editorStore.ts`
- Modify: `apps/editor/src/components/Toolbar.tsx`
- Modify: `apps/editor/src-tauri/Cargo.toml`
- Modify: `apps/editor/src-tauri/tauri.conf.json`
- Modify: `apps/editor/src-tauri/src/main.rs`

- [ ] **Step 1: Add Tauri shell files**

Create `apps/editor/src-tauri/Cargo.toml`:

```toml
[package]
name = "gamify-editor"
version = "0.1.0"
description = "Gamify Editor"
authors = ["Gamify"]
edition = "2021"

[lib]
name = "gamify_editor_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-dialog = "2"
tauri-plugin-fs = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

Create `apps/editor/src-tauri/tauri.conf.json`:

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "Gamify Editor",
  "version": "0.1.0",
  "identifier": "com.gamify.editor",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://127.0.0.1:5173",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "Gamify Editor",
        "width": 1440,
        "height": 900,
        "minWidth": 1100,
        "minHeight": 720
      }
    ]
  }
}
```

Create `apps/editor/src-tauri/src/main.rs`:

```rust
use std::fs;
use std::path::PathBuf;

#[tauri::command]
fn read_text_file(path: String) -> Result<String, String> {
    fs::read_to_string(PathBuf::from(path)).map_err(|error| error.to_string())
}

#[tauri::command]
fn write_text_file(path: String, contents: String) -> Result<(), String> {
    fs::write(PathBuf::from(path), contents).map_err(|error| error.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![read_text_file, write_text_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn main() {
    run();
}
```

- [ ] **Step 2: Add save/load store methods**

Modify `apps/editor/src/state/editorStore.ts` to include `setScene(scene)`, `setProject(project)`, and `serializeScene()` using `toPrettyJson(scene)`.

- [ ] **Step 3: Wire toolbar save button**

Modify `Toolbar.tsx` so Save downloads `main.scene.json` in browser dev mode using a Blob. Native Tauri path selection can replace this after Rust tooling is installed.

- [ ] **Step 4: Verify browser build**

Run: `npm --workspace @gamify/editor run build`

Expected: PASS.

- [ ] **Step 5: Verify Tauri status**

Run: `npm --workspace @gamify/editor run tauri:dev`

Expected in current environment: FAIL with Rust/cargo missing. After Rust is installed, expected: Tauri launches native app.

- [ ] **Step 6: Commit save/load and Tauri files**

```bash
git add apps/editor
git commit -m "feat: add project persistence foundation"
```

---

### Task 7: MCP Sidecar And WebSocket Bridge

**Files:**
- Create: `packages/mcp-server/tsconfig.json`
- Create: `packages/mcp-server/src/editorClient.ts`
- Create: `packages/mcp-server/src/tools.ts`
- Create: `packages/mcp-server/src/server.ts`
- Create: `packages/mcp-server/src/tools.test.ts`
- Create: `apps/editor/src/bridge/mcpBridge.ts`
- Modify: `apps/editor/src/App.tsx`

- [ ] **Step 1: Write MCP tool tests**

Create `packages/mcp-server/src/tools.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createDefaultScene } from "@gamify/scene-core";
import { applyLocalTool } from "./tools";

describe("mcp tools", () => {
  it("creates an entity through the local fallback command handler", async () => {
    const scene = createDefaultScene("Main");
    const result = await applyLocalTool(scene, "create_entity", { name: "Agent Cube" });

    expect(result.scene.entities.some((entity) => entity.name === "Agent Cube")).toBe(true);
  });

  it("sets transform through the local fallback command handler", async () => {
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
```

- [ ] **Step 2: Implement MCP server files**

Create `packages/mcp-server/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": "src",
    "outDir": "dist",
    "types": ["node"]
  },
  "include": ["src"]
}
```

Create `packages/mcp-server/src/editorClient.ts`:

```ts
import WebSocket from "ws";

export type EditorCommand = {
  type: string;
  payload: Record<string, unknown>;
};

export class EditorClient {
  constructor(private readonly url = "ws://127.0.0.1:47621") {}

  send(command: EditorCommand): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(this.url);
      socket.once("open", () => socket.send(JSON.stringify(command)));
      socket.once("message", (message) => {
        socket.close();
        resolve(JSON.parse(String(message)));
      });
      socket.once("error", reject);
    });
  }
}
```

Create `packages/mcp-server/src/tools.ts`:

```ts
import { createEntity, setTransform, type Scene } from "@gamify/scene-core";

export async function applyLocalTool(scene: Scene, toolName: string, args: Record<string, unknown>): Promise<{ scene: Scene }> {
  if (toolName === "create_entity") {
    return { scene: createEntity(scene, { name: String(args.name ?? "Entity") }) };
  }
  if (toolName === "set_transform") {
    return {
      scene: setTransform(scene, String(args.entityId), {
        position: args.position as never,
        rotation: args.rotation as never,
        scale: args.scale as never
      })
    };
  }
  throw new Error(`Unsupported tool: ${toolName}`);
}
```

Create `packages/mcp-server/src/server.ts`:

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { EditorClient } from "./editorClient";

const server = new McpServer({ name: "gamify-editor", version: "0.1.0" });
const editor = new EditorClient();

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
    position: z.object({ x: z.number().optional(), y: z.number().optional(), z: z.number().optional() }).optional(),
    rotation: z.object({ x: z.number().optional(), y: z.number().optional(), z: z.number().optional() }).optional(),
    scale: z.object({ x: z.number().optional(), y: z.number().optional(), z: z.number().optional() }).optional()
  },
  async (args) => ({
    content: [{ type: "text", text: JSON.stringify(await editor.send({ type: "set_transform", payload: args }), null, 2) }]
  })
);

await server.connect(new StdioServerTransport());
```

- [ ] **Step 3: Implement editor bridge**

Create `apps/editor/src/bridge/mcpBridge.ts`:

```ts
import { useEditorStore } from "../state/editorStore";

export function startMcpBridge() {
  const socket = new WebSocket("ws://127.0.0.1:47621");
  socket.addEventListener("message", (event) => {
    const command = JSON.parse(event.data) as { type: string; payload: Record<string, unknown> };
    const store = useEditorStore.getState();

    if (command.type === "get_scene") {
      socket.send(JSON.stringify({ ok: true, scene: store.scene }));
      return;
    }

    if (command.type === "create_entity") {
      store.createEntity(String(command.payload.name ?? "Entity"));
      socket.send(JSON.stringify({ ok: true, scene: useEditorStore.getState().scene }));
      return;
    }

    if (command.type === "set_transform") {
      store.setTransform(String(command.payload.entityId), {
        position: command.payload.position as never,
        rotation: command.payload.rotation as never,
        scale: command.payload.scale as never
      });
      socket.send(JSON.stringify({ ok: true, scene: useEditorStore.getState().scene }));
      return;
    }

    socket.send(JSON.stringify({ ok: false, error: `Unknown command: ${command.type}` }));
  });
}
```

Modify `apps/editor/src/App.tsx` to call `startMcpBridge()` inside a `useEffect`.

- [ ] **Step 4: Run MCP tests**

Run: `npm test -- packages/mcp-server/src/tools.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit MCP foundation**

```bash
git add packages/mcp-server apps/editor/src/bridge apps/editor/src/App.tsx
git commit -m "feat: add mcp sidecar foundation"
```

---

### Task 8: Verification Pass

**Files:**
- Modify files only if verification reveals specific failures.

- [ ] **Step 1: Run full tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 2: Run TypeScript builds**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 3: Run editor production build**

Run: `npm --workspace @gamify/editor run build`

Expected: PASS.

- [ ] **Step 4: Run Vite dev server**

Run: `npm run dev`

Expected: Vite serves the editor at `http://127.0.0.1:5173/`.

- [ ] **Step 5: Record Tauri blocker**

Run: `npm --workspace @gamify/editor run tauri:dev`

Expected in this environment: FAIL until Rust is installed. Add a short note to the final response with the exact error if Rust is still missing.

- [ ] **Step 6: Commit verification fixes**

If fixes were needed:

```bash
git add .
git commit -m "fix: stabilize editor foundation"
```

If no fixes were needed, do not create an empty commit.

---

## Self-Review

Spec coverage:

- Tauri desktop shell: covered by Tasks 1 and 6, with Rust install blocker noted.
- Shared 2D/3D scene model: covered by Task 2.
- Unity-like layout: covered by Task 3.
- Three.js viewport: covered by Task 4.
- Sprite animation, audio, and physics components: covered by Tasks 2 and 5.
- JSON project format: covered by Tasks 2 and 6.
- MCP server and bridge: covered by Task 7.
- Tests and verification: covered by Tasks 2, 7, and 8.

Placeholder scan:

- No `TBD`, `TODO`, or undefined future tasks are required to complete this foundation.
- The plan intentionally marks advanced systems and Rust native launch as out of immediate reach until dependencies are installed.

Type consistency:

- Scene command names are consistent across `scene-core`, editor state, and MCP handler tasks.
- Component type names match the design spec.
- Project and scene file names match the design spec.
