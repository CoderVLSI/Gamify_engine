import type {
  AudioComponent,
  CardDeckComponent,
  MeshRenderer3DComponent,
  PhysicsBody2DComponent,
  PlatformerController2DComponent,
  SceneComponent,
  SpriteAnimation2DComponent,
  Tilemap2DComponent,
  TransformComponent,
  VehicleController3DComponent
} from "@gamify/scene-core";
import { useEditorStore } from "../state/editorStore";

export function InspectorPanel() {
  const scene = useEditorStore((state) => state.scene);
  const selectedEntityId = useEditorStore((state) => state.selectedEntityId);
  const setTransform = useEditorStore((state) => state.setTransform);
  const updateComponent = useEditorStore((state) => state.updateComponent);
  const entity = scene.entities.find((candidate) => candidate.id === selectedEntityId);
  const transform = entity?.components.find((component): component is TransformComponent => component.type === "Transform");

  return (
    <aside className="panel inspector">
      <h2>Inspector</h2>
      {!entity ? <p>No entity selected.</p> : null}
      {entity ? <h3>{entity.name}</h3> : null}
      {entity && transform ? (
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
          <ComponentFields
            component={component}
            onPatch={(patch) => updateComponent(entity.id, component.id, patch)}
          />
        </section>
      ))}
    </aside>
  );
}

function ComponentFields({
  component,
  onPatch
}: {
  component: SceneComponent;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  if (component.type === "SpriteAnimation2D") {
    return <SpriteAnimationFields component={component} onPatch={onPatch} />;
  }
  if (component.type === "MeshRenderer3D") {
    return <MeshRendererFields component={component} onPatch={onPatch} />;
  }
  if (component.type === "Tilemap2D") {
    return <TilemapFields component={component} onPatch={onPatch} />;
  }
  if (component.type === "PlatformerController2D") {
    return <PlatformerControllerFields component={component} onPatch={onPatch} />;
  }
  if (component.type === "VehicleController3D") {
    return <VehicleControllerFields component={component} onPatch={onPatch} />;
  }
  if (component.type === "CardDeck") {
    return <CardDeckFields component={component} onPatch={onPatch} />;
  }
  if (component.type === "AudioSource" || component.type === "MusicTrack") {
    return <AudioFields component={component} onPatch={onPatch} />;
  }
  if (component.type === "Rigidbody2D") {
    return <Rigidbody2DFields component={component} onPatch={onPatch} />;
  }
  if (component.type === "BoxCollider2D" || component.type === "BoxCollider3D") {
    return (
      <>
        <NumberField label="Size X" value={component.size?.x ?? 1} onChange={(x) => onPatch({ size: { ...(component.size ?? {}), x } })} />
        <NumberField label="Size Y" value={component.size?.y ?? 1} onChange={(y) => onPatch({ size: { ...(component.size ?? {}), y } })} />
        <NumberField label="Size Z" value={component.size?.z ?? 0} onChange={(z) => onPatch({ size: { ...(component.size ?? {}), z } })} />
      </>
    );
  }
  if (component.type === "CircleCollider2D" || component.type === "SphereCollider3D") {
    return <NumberField label="Radius" value={component.radius ?? 0.5} onChange={(radius) => onPatch({ radius })} />;
  }
  return null;
}

function MeshRendererFields({
  component,
  onPatch
}: {
  component: MeshRenderer3DComponent;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  return (
    <>
      <label>
        Primitive
        <select value={component.primitive} onChange={(event) => onPatch({ primitive: event.currentTarget.value })}>
          <option value="cube">Cube</option>
          <option value="sphere">Sphere</option>
          <option value="plane">Plane</option>
        </select>
      </label>
      <TextField label="Color" value={component.color} onChange={(color) => onPatch({ color })} />
    </>
  );
}

function SpriteAnimationFields({
  component,
  onPatch
}: {
  component: SpriteAnimation2DComponent;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  return (
    <>
      <TextField label="Asset" value={component.assetPath} onChange={(assetPath) => onPatch({ assetPath })} />
      <TextField label="Clip ID" value={component.clipId ?? ""} onChange={(clipId) => onPatch({ clipId })} />
      <NumberField label="Frame width" value={component.frameWidth} onChange={(frameWidth) => onPatch({ frameWidth })} />
      <NumberField label="Frame height" value={component.frameHeight} onChange={(frameHeight) => onPatch({ frameHeight })} />
      <NumberField label="Frame count" value={component.frameCount} onChange={(frameCount) => onPatch({ frameCount })} />
      <NumberField label="FPS" value={component.fps} onChange={(fps) => onPatch({ fps })} />
      <CheckboxField label="Loop" checked={component.loop} onChange={(loop) => onPatch({ loop })} />
      <CheckboxField label="Playing" checked={component.playing} onChange={(playing) => onPatch({ playing })} />
    </>
  );
}

function TilemapFields({
  component,
  onPatch
}: {
  component: Tilemap2DComponent;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  return (
    <>
      <TextField label="Tileset asset" value={component.tilesetAssetId} onChange={(tilesetAssetId) => onPatch({ tilesetAssetId })} />
      <NumberField label="Tile width" value={component.tileWidth} onChange={(tileWidth) => onPatch({ tileWidth })} />
      <NumberField label="Tile height" value={component.tileHeight} onChange={(tileHeight) => onPatch({ tileHeight })} />
      <NumberField label="Columns" value={component.columns} onChange={(columns) => onPatch({ columns })} />
      <NumberField label="Rows" value={component.rows} onChange={(rows) => onPatch({ rows })} />
      <TextField label="Collision layer" value={component.collisionLayer} onChange={(collisionLayer) => onPatch({ collisionLayer })} />
    </>
  );
}

function PlatformerControllerFields({
  component,
  onPatch
}: {
  component: PlatformerController2DComponent;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  return (
    <>
      <NumberField label="Max speed" value={component.maxSpeed} step={0.1} onChange={(maxSpeed) => onPatch({ maxSpeed })} />
      <NumberField label="Acceleration" value={component.acceleration} step={0.1} onChange={(acceleration) => onPatch({ acceleration })} />
      <NumberField label="Jump velocity" value={component.jumpVelocity} step={0.1} onChange={(jumpVelocity) => onPatch({ jumpVelocity })} />
      <NumberField label="Coyote ms" value={component.coyoteTimeMs} onChange={(coyoteTimeMs) => onPatch({ coyoteTimeMs })} />
      <NumberField label="Air control" value={component.airControl} step={0.05} onChange={(airControl) => onPatch({ airControl })} />
    </>
  );
}

function VehicleControllerFields({
  component,
  onPatch
}: {
  component: VehicleController3DComponent;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  return (
    <>
      <NumberField label="Max speed" value={component.maxSpeed} step={0.1} onChange={(maxSpeed) => onPatch({ maxSpeed })} />
      <NumberField label="Acceleration" value={component.acceleration} step={0.1} onChange={(acceleration) => onPatch({ acceleration })} />
      <NumberField label="Steering" value={component.steering} step={0.1} onChange={(steering) => onPatch({ steering })} />
      <NumberField label="Grip" value={component.grip} step={0.05} onChange={(grip) => onPatch({ grip })} />
      <NumberField label="Brake force" value={component.brakeForce} step={0.1} onChange={(brakeForce) => onPatch({ brakeForce })} />
    </>
  );
}

function CardDeckFields({
  component,
  onPatch
}: {
  component: CardDeckComponent;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  return (
    <>
      <TextField label="Card back" value={component.cardBackAssetId} onChange={(cardBackAssetId) => onPatch({ cardBackAssetId })} />
      <TextField label="Suits" value={component.suits.join(", ")} onChange={(value) => onPatch({ suits: splitList(value) })} />
      <TextField label="Ranks" value={component.ranks.join(", ")} onChange={(value) => onPatch({ ranks: splitList(value) })} />
      <NumberField label="Draw count" value={component.drawCount} onChange={(drawCount) => onPatch({ drawCount })} />
      <CheckboxField label="Shuffle on start" checked={component.shuffleOnStart} onChange={(shuffleOnStart) => onPatch({ shuffleOnStart })} />
    </>
  );
}

function AudioFields({
  component,
  onPatch
}: {
  component: AudioComponent;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  return (
    <>
      <TextField label="Asset" value={component.assetPath} onChange={(assetPath) => onPatch({ assetPath })} />
      <NumberField label="Volume" value={component.volume} step={0.05} onChange={(volume) => onPatch({ volume })} />
      <CheckboxField label="Loop" checked={component.loop} onChange={(loop) => onPatch({ loop })} />
      <CheckboxField label="Autoplay" checked={component.autoplay} onChange={(autoplay) => onPatch({ autoplay })} />
    </>
  );
}

function Rigidbody2DFields({
  component,
  onPatch
}: {
  component: PhysicsBody2DComponent;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  return (
    <>
      <label>
        Body type
        <select value={component.bodyType} onChange={(event) => onPatch({ bodyType: event.currentTarget.value })}>
          <option value="dynamic">Dynamic</option>
          <option value="static">Static</option>
          <option value="kinematic">Kinematic</option>
        </select>
      </label>
      <NumberField label="Gravity scale" value={component.gravityScale} step={0.1} onChange={(gravityScale) => onPatch({ gravityScale })} />
    </>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      {label}
      <input type="text" value={value} onChange={(event) => onChange(event.currentTarget.value)} />
    </label>
  );
}

function NumberField({
  label,
  value,
  step = 1,
  onChange
}: {
  label: string;
  value: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      {label}
      <input type="number" step={step} value={value} onChange={(event) => onChange(Number(event.currentTarget.value))} />
    </label>
  );
}

function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="checkbox-field">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.currentTarget.checked)} />
      {label}
    </label>
  );
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
