import { useState, useCallback, useRef, type CSSProperties } from "react";

type Side = "top" | "right" | "bottom" | "left";

export type { Side };

export interface BoxSpacingProps {
  readonly label: string;
  readonly values: Readonly<Record<Side, number>>;
  readonly onChange: (side: Side, value: number) => void;
  readonly onReset?: () => void;
  readonly changed?: boolean;
}

const DRAG_SENSITIVITY = 2; // px per unit
const MIN_VALUE = 0;
const MAX_VALUE = 64;

function clamp(v: number): number {
  return Math.max(MIN_VALUE, Math.min(MAX_VALUE, Math.round(v)));
}

// Maps side to drag axis: vertical sides use clientY delta, horizontal use clientX
function getDelta(side: Side, dx: number, dy: number): number {
  switch (side) {
    case "top":
      return -dy / DRAG_SENSITIVITY;
    case "bottom":
      return dy / DRAG_SENSITIVITY;
    case "left":
      return -dx / DRAG_SENSITIVITY;
    case "right":
      return dx / DRAG_SENSITIVITY;
  }
}

export function BoxSpacing({
  label,
  values,
  onChange,
  onReset,
  changed = false,
}: BoxSpacingProps) {
  const [activeSide, setActiveSide] = useState<Side | null>(null);
  const dragStart = useRef<{
    side: Side;
    startX: number;
    startY: number;
    startValue: number;
  } | null>(null);

  const handlePointerDown = useCallback(
    (side: Side, e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setActiveSide(side);
      dragStart.current = {
        side,
        startX: e.clientX,
        startY: e.clientY,
        startValue: values[side],
      };
    },
    [values]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const ds = dragStart.current;
      if (!ds) return;
      const dx = e.clientX - ds.startX;
      const dy = e.clientY - ds.startY;
      const delta = getDelta(ds.side, dx, dy);
      const next = clamp(ds.startValue + delta);
      onChange(ds.side, next);
    },
    [onChange]
  );

  const handlePointerUp = useCallback(() => {
    dragStart.current = null;
    setActiveSide(null);
  }, []);

  const labelStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: 13,
    fontWeight: 500,
    color: "#999",
    minHeight: 28,
  };

  const resetStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 20,
    height: 20,
    border: "none",
    borderRadius: 4,
    background: "transparent",
    color: "#93c5fd",
    cursor: "pointer",
    fontSize: 12,
    padding: 0,
  };

  const containerStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    gridTemplateRows: "auto auto auto",
    alignItems: "center",
    justifyItems: "center",
    gap: 4,
    padding: 4,
  };

  const badgeStyle = (side: Side): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 28,
    height: 22,
    padding: "0 6px",
    borderRadius: 4,
    background: activeSide === side ? "#2563eb" : "rgba(255,255,255,0.025)",
    color:
      activeSide === side
        ? "#fff"
        : changed
        ? "#93c5fd"
        : "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontWeight: 500,
    cursor: "ew-resize",
    userSelect: "none",
    transition: "background 0.15s, color 0.15s",
    touchAction: "none",
  });

  const innerBoxStyle: CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: 4,
    border: "1px dashed rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.015)",
  };

  const sides: Side[] = ["top", "right", "bottom", "left"];

  return (
    <div
      style={{ display: "grid", gap: 4 }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div style={labelStyle}>
        <span>{label}</span>
        {changed && onReset && (
          <button style={resetStyle} title="Reset" onClick={onReset}>
            ↩
          </button>
        )}
      </div>
      <div style={containerStyle}>
        {/* Row 1: top */}
        <div />
        <div
          style={badgeStyle("top")}
          onPointerDown={(e) => handlePointerDown("top", e)}
        >
          {values.top}
        </div>
        <div />

        {/* Row 2: left, center box, right */}
        <div
          style={badgeStyle("left")}
          onPointerDown={(e) => handlePointerDown("left", e)}
        >
          {values.left}
        </div>
        <div style={innerBoxStyle} />
        <div
          style={badgeStyle("right")}
          onPointerDown={(e) => handlePointerDown("right", e)}
        >
          {values.right}
        </div>

        {/* Row 3: bottom */}
        <div />
        <div
          style={badgeStyle("bottom")}
          onPointerDown={(e) => handlePointerDown("bottom", e)}
        >
          {values.bottom}
        </div>
        <div />
      </div>
      {/* Screen reader hint */}
      <span
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        {sides.map((s) => `${s}: ${values[s]}`).join(", ")}
      </span>
    </div>
  );
}
