import type {
  AssetKind,
  AssetRecord,
  CardDeckComponent,
  Entity,
  GamifyProject,
  MeshRenderer3DComponent,
  PlatformerController2DComponent,
  Scene,
  SpriteAnimationClip,
  SpriteAnimation2DComponent,
  Tilemap2DComponent,
  TransformComponent,
  Vec3,
  VehicleController3DComponent
} from "./types";

const unit: Vec3 = { x: 1, y: 1, z: 1 };
const zero: Vec3 = { x: 0, y: 0, z: 0 };

function id(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function createTransform(componentId = "transform"): TransformComponent {
  return {
    id: componentId,
    type: "Transform",
    version: 1,
    position: zero,
    rotation: zero,
    scale: unit
  };
}

export function createMeshRenderer(componentId = "mesh-renderer"): MeshRenderer3DComponent {
  return {
    id: componentId,
    type: "MeshRenderer3D",
    version: 1,
    primitive: "cube",
    color: "#6ee7b7"
  };
}

export function createSpriteAnimation(componentId = "sprite-animation"): SpriteAnimation2DComponent {
  return {
    id: componentId,
    type: "SpriteAnimation2D",
    version: 1,
    assetPath: "assets/sprites/hero-run.png",
    clipId: "clip-hero-run",
    frameWidth: 32,
    frameHeight: 32,
    frameCount: 8,
    fps: 12,
    loop: true,
    playing: true
  };
}

export function createTilemap2D(componentId = "tilemap-2d"): Tilemap2DComponent {
  return {
    id: componentId,
    type: "Tilemap2D",
    version: 1,
    tilesetAssetId: "asset-platform-tileset",
    tileWidth: 16,
    tileHeight: 16,
    columns: 64,
    rows: 24,
    collisionLayer: "Ground"
  };
}

export function createPlatformerController(componentId = "platformer-controller"): PlatformerController2DComponent {
  return {
    id: componentId,
    type: "PlatformerController2D",
    version: 1,
    maxSpeed: 7,
    acceleration: 42,
    jumpVelocity: 13,
    coyoteTimeMs: 90,
    airControl: 0.65
  };
}

export function createVehicleController(componentId = "vehicle-controller"): VehicleController3DComponent {
  return {
    id: componentId,
    type: "VehicleController3D",
    version: 1,
    maxSpeed: 42,
    acceleration: 18,
    steering: 2.4,
    grip: 0.82,
    brakeForce: 28
  };
}

export function createCardDeck(componentId = "card-deck"): CardDeckComponent {
  return {
    id: componentId,
    type: "CardDeck",
    version: 1,
    cardBackAssetId: "asset-card-back",
    suits: ["hearts", "diamonds", "clubs", "spades"],
    ranks: ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"],
    shuffleOnStart: true,
    drawCount: 1
  };
}

export function createDefaultEntity(input: Partial<Entity> = {}): Entity {
  return {
    id: input.id ?? id("entity"),
    name: input.name ?? "Entity",
    parentId: input.parentId ?? null,
    children: input.children ?? [],
    enabled: input.enabled ?? true,
    components: input.components ?? [createTransform()]
  };
}

export function createDefaultScene(name = "Main"): Scene {
  return {
    id: id("scene"),
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
    id: id("project"),
    name,
    editorVersion: "0.1.0",
    defaultScenePath: "scenes/main.scene.json",
    assetRoots: ["assets"],
    assets: createStarterAssets(),
    animationClips: createStarterAnimationClips()
  };
}

export function createAssetRecord(kind: AssetKind, input: Partial<AssetRecord> = {}): AssetRecord {
  const name = input.name ?? `${kind[0].toUpperCase()}${kind.slice(1)}`;
  return {
    id: input.id ?? id(`asset-${kind}`),
    kind,
    name,
    path: input.path ?? `assets/${kind}/${name.toLowerCase().replaceAll(" ", "-")}`,
    tags: input.tags ?? []
  };
}

export function createSpriteAnimationClip(input: Partial<SpriteAnimationClip> = {}): SpriteAnimationClip {
  return {
    id: input.id ?? id("clip"),
    name: input.name ?? "Idle",
    spritesheetAssetId: input.spritesheetAssetId ?? "asset-hero-run",
    frameWidth: input.frameWidth ?? 32,
    frameHeight: input.frameHeight ?? 32,
    frameCount: input.frameCount ?? 4,
    fps: input.fps ?? 8,
    loop: input.loop ?? true
  };
}

function createStarterAssets(): AssetRecord[] {
  return [
    createAssetRecord("spritesheet", {
      id: "asset-hero-run",
      name: "Hero Run Sheet",
      path: "assets/sprites/hero-run.png",
      tags: ["2d", "player", "platformer"]
    }),
    createAssetRecord("tileset", {
      id: "asset-platform-tileset",
      name: "Platform Tileset",
      path: "assets/tilesets/platform.png",
      tags: ["2d", "collision"]
    }),
    createAssetRecord("model", {
      id: "asset-racing-kart",
      name: "Racing Kart",
      path: "assets/models/racing-kart.glb",
      tags: ["3d", "vehicle"]
    }),
    createAssetRecord("card", {
      id: "asset-card-back",
      name: "Card Back",
      path: "assets/cards/card-back.png",
      tags: ["card", "ui"]
    }),
    createAssetRecord("music", {
      id: "asset-race-loop",
      name: "Race Loop",
      path: "assets/audio/race-loop.ogg",
      tags: ["music", "loop"]
    })
  ];
}

function createStarterAnimationClips(): SpriteAnimationClip[] {
  return [
    createSpriteAnimationClip({
      id: "clip-hero-idle",
      name: "Hero Idle",
      spritesheetAssetId: "asset-hero-run",
      frameCount: 4,
      fps: 6
    }),
    createSpriteAnimationClip({
      id: "clip-hero-run",
      name: "Hero Run",
      spritesheetAssetId: "asset-hero-run",
      frameCount: 8,
      fps: 12
    }),
    createSpriteAnimationClip({
      id: "clip-hero-jump",
      name: "Hero Jump",
      spritesheetAssetId: "asset-hero-run",
      frameCount: 3,
      fps: 10,
      loop: false
    })
  ];
}
