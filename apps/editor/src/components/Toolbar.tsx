import { Box, Play, Save } from "lucide-react";
import { useEditorStore } from "../state/editorStore";

export function Toolbar() {
  const createEntity = useEditorStore((state) => state.createEntity);
  const serializeScene = useEditorStore((state) => state.serializeScene);

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
      <button title="Save scene" onClick={downloadScene}>
        <Save size={16} /> Save
      </button>
      <button title="Play preview">
        <Play size={16} /> Play
      </button>
    </header>
  );
}
