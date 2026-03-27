import { useEffect, useState, type CSSProperties } from "react";
import { useSightglassSessionState } from "../use-sightglass";

const SELECTION_PADDING = 8;

const hoverLabelStyle: CSSProperties = {
  position: "fixed",
  zIndex: 99998,
  padding: "2px 8px",
  borderRadius: 4,
  background: "#3b82f6",
  color: "#fff",
  fontSize: 12,
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  whiteSpace: "nowrap",
  pointerEvents: "none",
};

const selectionLabelStyle: CSSProperties = {
  ...hoverLabelStyle,
  background: "#2563eb",
  fontWeight: 500,
};

const hoverOutlineStyle: CSSProperties = {
  position: "fixed",
  zIndex: 99998,
  border: "2px dashed #60a5fa",
  background: "rgba(96, 165, 250, 0.05)",
  borderRadius: 4,
  pointerEvents: "none",
  transition: "all 75ms",
};

const selectionOutlineStyle: CSSProperties = {
  position: "fixed",
  zIndex: 99998,
  border: "2px solid #2563eb",
  borderRadius: 4,
  pointerEvents: "none",
  transition:
    "left 0.25s cubic-bezier(0.22, 1, 0.36, 1), top 0.25s cubic-bezier(0.22, 1, 0.36, 1), width 0.25s cubic-bezier(0.22, 1, 0.36, 1), height 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
};

export const SelectionOverlay = () => {
  const session = useSightglassSessionState();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const selectedElement = session.selectedElement;
  const primaryAnchor = session.selection.best?.anchors[0] ?? null;

  useEffect(() => {
    if (!selectedElement) {
      setRect(null);
      return;
    }

    let frameId: number;
    const update = () => {
      if (!selectedElement.isConnected) {
        setRect(null);
        return;
      }
      setRect(selectedElement.getBoundingClientRect());
      frameId = requestAnimationFrame(update);
    };
    update();

    return () => cancelAnimationFrame(frameId);
  }, [selectedElement]);

  if (!rect || !primaryAnchor) {
    return null;
  }

  const tag = selectedElement?.tagName.toLowerCase() ?? "";
  const label = primaryAnchor.role ? `${tag} "${primaryAnchor.role}"` : tag;

  return (
    <>
      {/* Label above selection */}
      <div
        style={{
          ...selectionLabelStyle,
          top: Math.max(0, rect.top - SELECTION_PADDING - 24),
          left: rect.left - SELECTION_PADDING + 8,
        }}
      >
        {label}
      </div>
      {/* Selection outline with 8px padding */}
      <div
        style={{
          ...selectionOutlineStyle,
          top: rect.top - SELECTION_PADDING,
          left: rect.left - SELECTION_PADDING,
          width: rect.width + SELECTION_PADDING * 2,
          height: rect.height + SELECTION_PADDING * 2,
        }}
      />
    </>
  );
};
