import { useEffect } from "react";

export type ContextMenuItem = {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  danger?: boolean;
  separatorBefore?: boolean;
};

export type ContextMenuState = {
  x: number;
  y: number;
  items: ContextMenuItem[];
};

export function ContextMenu({ menu, onClose }: { menu: ContextMenuState | null; onClose: () => void }) {
  useEffect(() => {
    if (!menu) return;
    window.addEventListener("pointerdown", onClose);
    window.addEventListener("keydown", onClose);
    return () => {
      window.removeEventListener("pointerdown", onClose);
      window.removeEventListener("keydown", onClose);
    };
  }, [menu, onClose]);

  if (!menu) return null;

  return (
    <div className="context-menu" style={{ left: menu.x, top: menu.y }} onPointerDown={(event) => event.stopPropagation()}>
      {menu.items.map((item) => (
        <button
          className={`${item.separatorBefore ? "with-separator" : ""} ${item.danger ? "danger" : ""}`}
          disabled={item.disabled}
          key={item.label}
          onClick={() => {
            item.onSelect();
            onClose();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
