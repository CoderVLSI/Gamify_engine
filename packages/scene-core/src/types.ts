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
  | "SphereCollider3D"
  | "Tilemap2D"
  | "PlatformerController2D"
  | "VehicleController3D"
  | "CardDeck";

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

export type Camera3DComponent = BaseComponent & {
  type: "Camera3D";
  fov: number;
  near: number;
  far: number;
};

export type Light3DComponent = BaseComponent & {
  type: "Light3D";
  kind: "directional" | "ambient" | "point";
  color: string;
  intensity: number;
};

export type SpriteRenderer2DComponent = BaseComponent & {
  type: "SpriteRenderer2D";
  assetPath: string;
  color: string;
};

export type Camera2DComponent = BaseComponent & {
  type: "Camera2D";
  zoom: number;
};

export type SpriteAnimation2DComponent = BaseComponent & {
  type: "SpriteAnimation2D";
  assetPath: string;
  clipId?: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  fps: number;
  loop: boolean;
  playing: boolean;
};

export type AudioComponent = BaseComponent & {
  type: "AudioSource" | "MusicTrack";
  assetPath: string;
  volume: number;
  loop: boolean;
  autoplay: boolean;
};

export type PhysicsBody2DComponent = BaseComponent & {
  type: "Rigidbody2D";
  bodyType: "static" | "dynamic" | "kinematic";
  gravityScale: number;
};

export type Tilemap2DComponent = BaseComponent & {
  type: "Tilemap2D";
  tilesetAssetId: string;
  tileWidth: number;
  tileHeight: number;
  columns: number;
  rows: number;
  collisionLayer: string;
};

export type PlatformerController2DComponent = BaseComponent & {
  type: "PlatformerController2D";
  maxSpeed: number;
  acceleration: number;
  jumpVelocity: number;
  coyoteTimeMs: number;
  airControl: number;
};

export type VehicleController3DComponent = BaseComponent & {
  type: "VehicleController3D";
  maxSpeed: number;
  acceleration: number;
  steering: number;
  grip: number;
  brakeForce: number;
};

export type CardDeckComponent = BaseComponent & {
  type: "CardDeck";
  cardBackAssetId: string;
  suits: string[];
  ranks: string[];
  shuffleOnStart: boolean;
  drawCount: number;
};

export type ColliderComponent = BaseComponent & {
  type: "BoxCollider2D" | "CircleCollider2D" | "Rigidbody3D" | "BoxCollider3D" | "SphereCollider3D";
  size?: Vec3;
  radius?: number;
};

export type SceneComponent =
  | TransformComponent
  | MeshRenderer3DComponent
  | Camera3DComponent
  | Light3DComponent
  | SpriteRenderer2DComponent
  | SpriteAnimation2DComponent
  | Camera2DComponent
  | AudioComponent
  | PhysicsBody2DComponent
  | ColliderComponent
  | Tilemap2DComponent
  | PlatformerController2DComponent
  | VehicleController3DComponent
  | CardDeckComponent;

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
  assets: AssetRecord[];
  animationClips: SpriteAnimationClip[];
};

export type AssetKind = "sprite" | "spritesheet" | "tileset" | "audio" | "music" | "model" | "material" | "scene" | "card";

export type AssetRecord = {
  id: string;
  kind: AssetKind;
  name: string;
  path: string;
  tags: string[];
};

export type SpriteAnimationClip = {
  id: string;
  name: string;
  spritesheetAssetId: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  fps: number;
  loop: boolean;
};
