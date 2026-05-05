import { Box, Disc3, Music, Play, Save, Sparkles, Volume2 } from "lucide-react";
import { useEditorStore } from "../state/editorStore";

export function Toolbar() {
  const createEntity = useEditorStore((state) => state.createEntity);
  const serializeScene = useEditorStore((state) => state.serializeScene);
  const selectedEntityId = useEditorStore((state) => state.selectedEntityId);
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
      <button title="Add entity" onClick={() => createEntity("Entity")}>
        <Box size={16} /> Add
      </button>
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
      <button title="Save scene" onClick={downloadScene}>
        <Save size={16} /> Save
      </button>
      <button title="Play preview">
        <Play size={16} /> Play
      </button>
    </header>
  );
}
