import { Box, Circle, Disc3, Expand, Move3D, Music, Play, Rotate3D, Save, Sparkles, Square, Trash2, Volume2 } from "lucide-react";
import type { ReactNode } from "react";
import { type TransformTool, useEditorStore } from "../state/editorStore";

export function Toolbar() {
  const createEntity = useEditorStore((state) => state.createEntity);
  const createPrimitive = useEditorStore((state) => state.createPrimitive);
  const serializeScene = useEditorStore((state) => state.serializeScene);
  const selectedEntityId = useEditorStore((state) => state.selectedEntityId);
  const activeTransformTool = useEditorStore((state) => state.activeTransformTool);
  const setActiveTransformTool = useEditorStore((state) => state.setActiveTransformTool);
  const deleteSelectedEntity = useEditorStore((state) => state.deleteSelectedEntity);
  const addComponent = useEditorStore((state) => state.addComponent);

  function downloadScene() {
    const blob = new Blob([serializeScene()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "main.scene.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <header className="toolbar">
      <strong className="brand">Gamify Editor</strong>
      <button title="Add empty entity" onClick={() => createEntity("Entity")}>
        <Box size={16} /> Empty
      </button>
      <button title="Add cube" onClick={() => createPrimitive("cube")}>
        <Box size={16} /> Cube
      </button>
      <button title="Add sphere" onClick={() => createPrimitive("sphere")}>
        <Circle size={16} /> Sphere
      </button>
      <button title="Add plane" onClick={() => createPrimitive("plane")}>
        <Square size={16} /> Plane
      </button>
      <div className="toolbar-segment" aria-label="Transform tools">
        <ToolButton active={activeTransformTool === "move"} icon={<Move3D size={16} />} label="Move" onClick={() => setActiveTransformTool("move")} />
        <ToolButton
          active={activeTransformTool === "rotate"}
          icon={<Rotate3D size={16} />}
          label="Rotate"
          onClick={() => setActiveTransformTool("rotate")}
        />
        <ToolButton active={activeTransformTool === "scale"} icon={<Expand size={16} />} label="Scale" onClick={() => setActiveTransformTool("scale")} />
      </div>
      <button
        disabled={!selectedEntityId}
        title="Add sprite animation"
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
        disabled={!selectedEntityId}
        title="Add sound effect"
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
        disabled={!selectedEntityId}
        title="Add music"
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
      <button
        disabled={!selectedEntityId}
        title="Add 2D physics"
        onClick={() => {
          if (!selectedEntityId) return;
          addComponent(selectedEntityId, {
            id: crypto.randomUUID(),
            type: "Rigidbody2D",
            version: 1,
            bodyType: "dynamic",
            gravityScale: 1
          });
          addComponent(selectedEntityId, {
            id: crypto.randomUUID(),
            type: "BoxCollider2D",
            version: 1,
            size: { x: 1, y: 1, z: 0 }
          });
        }}
      >
        <Disc3 size={16} /> Physics
      </button>
      <button disabled={!selectedEntityId} title="Delete selected" onClick={deleteSelectedEntity}>
        <Trash2 size={16} /> Delete
      </button>
      <button title="Save scene" onClick={downloadScene}>
        <Save size={16} /> Save
      </button>
      <button title="Play preview">
        <Play size={16} /> Play
      </button>
    </header>
  );
}

function ToolButton({
  active,
  icon,
  label,
  onClick
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className={active ? "active" : ""} title={`${label} tool`} onClick={onClick}>
      {icon} {label}
    </button>
  );
}
