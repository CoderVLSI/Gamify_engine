import {
  Box,
  Car,
  ChevronDown,
  Component,
  Expand,
  Layers3,
  Move3D,
  Pause,
  Play,
  Plus,
  Rotate3D,
  Save,
  UserRound
} from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { ContextMenu, type ContextMenuState } from "./ContextMenu";
import { type TransformTool, useEditorStore } from "../state/editorStore";

export function Toolbar() {
  const project = useEditorStore((state) => state.project);
  const createEntity = useEditorStore((state) => state.createEntity);
  const createPrimitive = useEditorStore((state) => state.createPrimitive);
  const createPlatformerPlayer = useEditorStore((state) => state.createPlatformerPlayer);
  const createPlatformerTilemap = useEditorStore((state) => state.createPlatformerTilemap);
  const createRacingVehicle = useEditorStore((state) => state.createRacingVehicle);
  const createCardDeck = useEditorStore((state) => state.createCardDeck);
  const serializeScene = useEditorStore((state) => state.serializeScene);
  const selectedEntityId = useEditorStore((state) => state.selectedEntityId);
  const activeTransformTool = useEditorStore((state) => state.activeTransformTool);
  const setActiveTransformTool = useEditorStore((state) => state.setActiveTransformTool);
  const deleteSelectedEntity = useEditorStore((state) => state.deleteSelectedEntity);
  const addComponent = useEditorStore((state) => state.addComponent);
  const [menu, setMenu] = useState<ContextMenuState | null>(null);

  function openCreateMenu(event: React.MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenu({
      x: rect.left,
      y: rect.bottom + 6,
      items: [
        { label: "Empty Entity", onSelect: () => createEntity("Entity") },
        { label: "Cube", onSelect: () => createPrimitive("cube") },
        { label: "Sphere", onSelect: () => createPrimitive("sphere") },
        { label: "Plane", onSelect: () => createPrimitive("plane") },
        { label: "Platformer Player", onSelect: createPlatformerPlayer, separatorBefore: true },
        { label: "Platform Tilemap", onSelect: createPlatformerTilemap },
        { label: "Racing Vehicle", onSelect: createRacingVehicle },
        { label: "Card Deck", onSelect: createCardDeck }
      ]
    });
  }

  function openComponentMenu(event: React.MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenu({
      x: rect.left,
      y: rect.bottom + 6,
      items: [
        { label: "Sprite Animation", disabled: !selectedEntityId, onSelect: addSpriteAnimation },
        { label: "Sound Source", disabled: !selectedEntityId, onSelect: addSoundSource },
        { label: "Music Track", disabled: !selectedEntityId, onSelect: addMusicTrack },
        { label: "2D Physics Body", disabled: !selectedEntityId, onSelect: add2DPhysics },
        { label: "Delete Selected", disabled: !selectedEntityId, danger: true, separatorBefore: true, onSelect: deleteSelectedEntity }
      ]
    });
  }

  function downloadScene() {
    const blob = new Blob([serializeScene()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "main.scene.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function addSpriteAnimation() {
    if (!selectedEntityId) return;
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
    });
  }

  function addSoundSource() {
    if (!selectedEntityId) return;
    addComponent(selectedEntityId, {
      id: crypto.randomUUID(),
      type: "AudioSource",
      version: 1,
      assetPath: "assets/audio/sound.wav",
      volume: 0.8,
      loop: false,
      autoplay: false
    });
  }

  function addMusicTrack() {
    if (!selectedEntityId) return;
    addComponent(selectedEntityId, {
      id: crypto.randomUUID(),
      type: "MusicTrack",
      version: 1,
      assetPath: "assets/audio/music.ogg",
      volume: 0.6,
      loop: true,
      autoplay: true
    });
  }

  function add2DPhysics() {
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
  }

  return (
    <header className="toolbar">
      <div className="app-mark" aria-label="Gamify Editor">
        <span className="mark-cube">
          <Box size={17} />
        </span>
        <div>
          <strong>Gamify</strong>
          <small>Engine Editor</small>
        </div>
      </div>
      <button className="project-switcher" title="Current project">
        <span>{project.name}</span>
        <ChevronDown size={15} />
      </button>
      <nav className="top-command-group" aria-label="Create and component actions">
        <button className="command-button primary-command" title="Create entity or game object" onClick={openCreateMenu}>
          <Plus size={16} />
          <span>Create</span>
        </button>
        <button className="command-button" title="Add component to selected entity" disabled={!selectedEntityId} onClick={openComponentMenu}>
          <Component size={16} />
          <span>Component</span>
        </button>
      </nav>
      <div className="toolbar-segment transform-strip" aria-label="Transform tools">
        <ToolButton active={activeTransformTool === "move"} icon={<Move3D size={16} />} label="Move" onClick={() => setActiveTransformTool("move")} />
        <ToolButton
          active={activeTransformTool === "rotate"}
          icon={<Rotate3D size={16} />}
          label="Rotate"
          onClick={() => setActiveTransformTool("rotate")}
        />
        <ToolButton active={activeTransformTool === "scale"} icon={<Expand size={16} />} label="Scale" onClick={() => setActiveTransformTool("scale")} />
      </div>
      <div className="toolbar-spacer" />
      <div className="template-pills" aria-label="Fast templates">
        <button title="Platformer player" onClick={createPlatformerPlayer}>
          <UserRound size={15} /> 2D
        </button>
        <button title="Racing vehicle" onClick={createRacingVehicle}>
          <Car size={15} /> 3D
        </button>
        <button title="Card deck" onClick={createCardDeck}>
          <Layers3 size={15} /> Cards
        </button>
      </div>
      <div className="play-cluster" aria-label="Run controls">
        <button className="icon-command" title="Save scene" onClick={downloadScene}>
          <Save size={16} />
        </button>
        <button className="play-button" title="Play preview">
          <Play size={17} />
        </button>
        <button className="icon-command" title="Pause preview">
          <Pause size={16} />
        </button>
      </div>
      <ContextMenu menu={menu} onClose={() => setMenu(null)} />
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
      {icon}
      <span>{label}</span>
    </button>
  );
}
