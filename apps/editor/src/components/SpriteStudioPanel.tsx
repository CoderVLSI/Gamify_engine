import { Pause, Play, Plus, SkipForward } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { SpriteAnimationClip } from "@gamify/scene-core";
import { useEditorStore } from "../state/editorStore";

export function SpriteStudioPanel() {
  const project = useEditorStore((state) => state.project);
  const selectedAnimationClipId = useEditorStore((state) => state.selectedAnimationClipId);
  const selectAnimationClip = useEditorStore((state) => state.selectAnimationClip);
  const updateAnimationClip = useEditorStore((state) => state.updateAnimationClip);
  const addAnimationClip = useEditorStore((state) => state.addAnimationClip);
  const clip = project.animationClips.find((candidate) => candidate.id === selectedAnimationClipId) ?? project.animationClips[0] ?? null;
  const spritesheets = project.assets.filter((asset) => asset.kind === "spritesheet" || asset.kind === "sprite" || asset.kind === "tileset");
  const asset = clip ? project.assets.find((candidate) => candidate.id === clip.spritesheetAssetId) : null;
  const [playing, setPlaying] = useState(true);
  const [frame, setFrame] = useState(0);
  const frameCount = Math.max(1, clip?.frameCount ?? 1);

  useEffect(() => {
    setFrame(0);
  }, [clip?.id, frameCount]);

  useEffect(() => {
    if (!playing || !clip) return;
    const delay = 1000 / Math.max(1, clip.fps);
    const interval = window.setInterval(() => setFrame((current) => (current + 1) % frameCount), delay);
    return () => window.clearInterval(interval);
  }, [clip, frameCount, playing]);

  const swatches = useMemo(() => buildFrameSwatches(frameCount), [frameCount]);

  if (!clip) {
    return (
      <section className="sprite-studio empty">
        <div className="sprite-studio-header">
          <h3>Sprite Studio</h3>
          <button title="Create animation clip" onClick={() => addAnimationClip({ name: "New Clip" })}>
            <Plus size={14} />
          </button>
        </div>
        <p>No animation clips yet.</p>
      </section>
    );
  }

  function patch(patch: Partial<SpriteAnimationClip>) {
    if (!clip) return;
    updateAnimationClip(clip.id, patch);
  }

  return (
    <section className="sprite-studio">
      <div className="sprite-studio-header">
        <h3>Sprite Studio</h3>
        <button title="Create animation clip" onClick={() => addAnimationClip({ name: "New Clip", spritesheetAssetId: asset?.id })}>
          <Plus size={14} />
        </button>
      </div>
      <div className="clip-selector">
        <label>
          Clip
          <select value={clip.id} onChange={(event) => selectAnimationClip(event.currentTarget.value)}>
            {project.animationClips.map((candidate) => (
              <option value={candidate.id} key={candidate.id}>
                {candidate.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sheet
          <select value={clip.spritesheetAssetId} onChange={(event) => patch({ spritesheetAssetId: event.currentTarget.value })}>
            {spritesheets.map((candidate) => (
              <option value={candidate.id} key={candidate.id}>
                {candidate.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="sprite-preview-stage">
        <div className="sprite-preview-checker">
          <div className="sprite-frame-large" style={{ background: swatches[frame] }} />
        </div>
        <div className="sprite-preview-meta">
          <strong>{clip.name}</strong>
          <span>{asset?.path ?? "No spritesheet selected"}</span>
          <span>
            {clip.frameWidth}x{clip.frameHeight} • {frame + 1}/{frameCount} • {clip.fps} fps
          </span>
        </div>
      </div>
      <div className="sprite-controls">
        <button title={playing ? "Pause preview" : "Play preview"} onClick={() => setPlaying((current) => !current)}>
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button title="Next frame" onClick={() => setFrame((current) => (current + 1) % frameCount)}>
          <SkipForward size={14} />
        </button>
        <label>
          Name
          <input value={clip.name} onChange={(event) => patch({ name: event.currentTarget.value })} />
        </label>
        <label>
          FPS
          <input type="number" min={1} value={clip.fps} onChange={(event) => patch({ fps: Number(event.currentTarget.value) })} />
        </label>
        <label>
          Frames
          <input type="number" min={1} max={48} value={clip.frameCount} onChange={(event) => patch({ frameCount: Number(event.currentTarget.value) })} />
        </label>
        <label>
          W
          <input type="number" min={1} value={clip.frameWidth} onChange={(event) => patch({ frameWidth: Number(event.currentTarget.value) })} />
        </label>
        <label>
          H
          <input type="number" min={1} value={clip.frameHeight} onChange={(event) => patch({ frameHeight: Number(event.currentTarget.value) })} />
        </label>
        <label className="sprite-check">
          <input type="checkbox" checked={clip.loop} onChange={(event) => patch({ loop: event.currentTarget.checked })} />
          Loop
        </label>
      </div>
      <div className="timeline-strip" style={{ gridTemplateColumns: `repeat(${Math.min(frameCount, 12)}, minmax(26px, 1fr))` }}>
        {Array.from({ length: frameCount }, (_, index) => (
          <button
            className={index === frame ? "active" : ""}
            key={index}
            title={`Frame ${index + 1}`}
            onClick={() => {
              setPlaying(false);
              setFrame(index);
            }}
          >
            <span style={{ background: swatches[index] }} />
            <small>{index + 1}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function buildFrameSwatches(frameCount: number): string[] {
  return Array.from({ length: frameCount }, (_, index) => {
    const hue = (176 + index * 24) % 360;
    const accent = (42 + index * 19) % 360;
    return [
      `linear-gradient(90deg, transparent 0 18%, hsl(${hue} 72% 58%) 18% 34%, transparent 34% 100%)`,
      `linear-gradient(180deg, transparent 0 16%, hsl(${accent} 82% 62%) 16% 34%, hsl(${hue} 58% 44%) 34% 72%, transparent 72% 100%)`,
      `radial-gradient(circle at 50% 25%, #f8fafc 0 10%, #111827 11% 15%, transparent 16%)`
    ].join(", ");
  });
}
