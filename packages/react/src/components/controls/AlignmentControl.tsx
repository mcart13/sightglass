import type { CSSProperties } from "react";

type AlignValue =
  | "flex-start"
  | "center"
  | "flex-end"
  | "stretch"
  | "space-between";

export type { AlignValue };

export interface AlignmentControlProps {
  readonly label: string;
  readonly value: string;
  readonly options?: readonly AlignValue[];
  readonly onChange: (value: AlignValue) => void;
}

const DEFAULT_OPTIONS: readonly AlignValue[] = [
  "flex-start",
  "center",
  "flex-end",
  "stretch",
  "space-between",
];

const ICONS: Record<AlignValue, string> = {
  "flex-start": "\u2B06", // up arrow
  center: "\u2B0C", // left-right
  "flex-end": "\u2B07", // down arrow
  stretch: "\u2195", // up-down arrow
  "space-between": "\u2725", // four-point star
};

const LABELS: Record<AlignValue, string> = {
  "flex-start": "Start",
  center: "Center",
  "flex-end": "End",
  stretch: "Stretch",
  "space-between": "Space Between",
};

export function AlignmentControl({
  label,
  value,
  options = DEFAULT_OPTIONS,
  onChange,
}: AlignmentControlProps) {
  const labelStyle: CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    color: "#999",
    minHeight: 28,
    display: "flex",
    alignItems: "center",
  };

  const rowStyle: CSSProperties = {
    display: "flex",
    gap: 2,
  };

  const buttonStyle = (active: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: "6px 0",
    border: "none",
    borderRadius: 6,
    background: active ? "#363636" : "rgba(255,255,255,0.025)",
    color: active ? "#93c5fd" : "rgba(255,255,255,0.4)",
    fontSize: 14,
    cursor: "pointer",
    transition: "background 0.15s, color 0.15s",
  });

  return (
    <div style={{ display: "grid", gap: 4 }}>
      <span style={labelStyle}>{label}</span>
      <div style={rowStyle}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            style={buttonStyle(value === opt)}
            title={LABELS[opt]}
            onClick={() => onChange(opt)}
          >
            {ICONS[opt]}
          </button>
        ))}
      </div>
    </div>
  );
}
