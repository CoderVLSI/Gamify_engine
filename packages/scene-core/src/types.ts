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

export type AudioComponent = BaseComponent & {
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

export type GenericComponent = BaseComponent & Record<string, unknown>;

export type SceneComponent =
  | TransformComponent
  | MeshRenderer3DComponent
  | SpriteAnimation2DComponent
  | AudioComponent
  | PhysicsBody2DComponent
  | ColliderComponent
  | GenericComponent;

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
