import { useState, useCallback, useRef, type CSSProperties } from "react";

export interface SliderStop {
  readonly value: number;
  readonly label: string;
}

export interface SliderProps {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step?: number;
  readonly suffix?: string;
  readonly changed?: boolean;
  readonly formatValue?: (value: number) => string;
  readonly stops?: readonly SliderStop[];
  readonly onChange: (value: number) => void;
  readonly onReset?: () => void;
}

const SNAP_THRESHOLD = 0.05; // 5% of range

function clampAndStep(
  raw: number,
  min: number,
  max: number,
  step: number | undefined,
  stops: readonly SliderStop[] | undefined
): number {
  let v = Math.max(min, Math.min(max, raw));
  if (step) {
    v = Math.round((v - min) / step) * step + min;
  }
  if (stops && stops.length > 0) {
    const range = max - min;
    const ratio = (v - min) / range;
    let bestStop: SliderStop | null = null;
    let bestDist = Infinity;
    for (const s of stops) {
      const stopRatio = (s.value - min) / range;
      const dist = Math.abs(ratio - stopRatio);
      if (dist <= SNAP_THRESHOLD && dist < bestDist) {
        bestDist = dist;
        bestStop = s;
      }
    }
    if (bestStop) v = bestStop.value;
  }
  return Math.round(v * 1000) / 1000;
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix = "",
  changed = false,
  formatValue,
  stops,
  onChange,
  onReset,
}: SliderProps) {
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;

  const valueFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return min;
      const rect = el.getBoundingClientRect();
      const ratio = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width)
      );
      const raw = min + ratio * (max - min);
      return clampAndStep(raw, min, max, step, stops);
    },
    [min, max, step, stops]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const target = e.target as HTMLElement;
      if (typeof target.setPointerCapture === "function") {
        target.setPointerCapture(e.pointerId);
      }
      setDragging(true);
      const next = valueFromClientX(e.clientX);
      if (next !== value) onChange(next);
    },
    [valueFromClientX, onChange, value]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const next = valueFromClientX(e.clientX);
      if (next !== value) onChange(next);
    },
    [dragging, valueFromClientX, onChange, value]
  );

  const onPointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const displayValue = formatValue ? formatValue(value) : `${value}${suffix}`;

  const showHandle = hovered || dragging;

  const rowStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    minHeight: 28,
  };

  const labelStyle: CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    color: "#999",
    flexShrink: 0,
  };

  const valueStyle: CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    color: changed ? "#93c5fd" : "rgba(255,255,255,0.4)",
    textAlign: "right",
    transition: "color 0.15s",
  };

  const trackStyle: CSSProperties = {
    position: "relative",
    height: 10,
    borderRadius: 10,
    background:
      hovered || dragging
        ? "rgba(255,255,255,0.04)"
        : "rgba(255,255,255,0.025)",
    cursor: "pointer",
    transition: "background 0.15s",
    touchAction: "none",
  };

  const fillStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: `${pct}%`,
    borderRadius: 10,
    background: "#363636",
    pointerEvents: "none",
  };

  const handleStyle: CSSProperties = {
    position: "absolute",
    top: "50%",
    left: `${pct}%`,
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "#fff",
    transform: "translate(-50%, -50%)",
    opacity: showHandle ? 1 : 0,
    transition: "opacity 0.15s",
    pointerEvents: "none",
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
    flexShrink: 0,
  };

  return (
    <div style={{ display: "grid", gap: 4 }}>
      <div style={rowStyle}>
        <span style={labelStyle}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={valueStyle}>{displayValue}</span>
          {changed && onReset && (
            <button
              type="button"
              style={resetStyle}
              title="Reset"
              onClick={onReset}
            >
              ↩
            </button>
          )}
        </div>
      </div>
      <div
        ref={trackRef}
        data-testid="slider-track"
        style={trackStyle}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div style={fillStyle} />
        <div style={handleStyle} />
      </div>
      {stops && stops.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0 2px",
          }}
        >
          {stops.map((s) => (
            <span
              key={s.value}
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.25)",
                cursor: "pointer",
              }}
              onClick={() => onChange(s.value)}
            >
              {s.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
