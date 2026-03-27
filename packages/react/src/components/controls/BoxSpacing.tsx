import { useState, useCallback, type CSSProperties } from "react";

type Side = "top" | "right" | "bottom" | "left";

export type { Side };

export interface BoxSpacingProps {
  readonly label: string;
  readonly values: Readonly<Record<Side, number>>;
  readonly onChange: (side: Side, value: number) => void;
  readonly onReset?: () => void;
  readonly changed?: boolean;
}

// Figma-style: click the number to type a value, arrow keys to nudge

const inputStyle: CSSProperties = {
  width: 36,
  height: 24,
  padding: 0,
  border: "1px solid transparent",
  borderRadius: 4,
  background: "rgba(255,255,255,0.025)",
  color: "rgba(255,255,255,0.5)",
  fontSize: 11,
  fontWeight: 500,
  fontVariantNumeric: "tabular-nums",
  textAlign: "center",
  outline: "none",
  fontFamily: "inherit",
};

const inputFocusStyle: CSSProperties = {
  ...inputStyle,
  borderColor: "#2563eb",
  color: "#fff",
  background: "rgba(255,255,255,0.05)",
};

const innerBoxStyle: CSSProperties = {
  width: 28,
  height: 24,
  borderRadius: 3,
  border: "1px dashed rgba(255,255,255,0.08)",
};

export function BoxSpacing({
  label,
  values,
  onChange,
  onReset,
  changed = false,
}: BoxSpacingProps) {
  const [focusedSide, setFocusedSide] = useState<Side | null>(null);

  const handleChange = useCallback(
    (side: Side, raw: string) => {
      const n = parseInt(raw, 10);
      if (Number.isFinite(n)) {
        onChange(side, Math.max(0, Math.min(999, n)));
      }
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (side: Side, e: React.KeyboardEvent<HTMLInputElement>) => {
      const step = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        onChange(side, Math.min(999, values[side] + step));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        onChange(side, Math.max(0, values[side] - step));
      } else if (e.key === "Enter") {
        (e.target as HTMLInputElement).blur();
      }
    },
    [onChange, values]
  );

  const renderInput = (side: Side, gridArea: string) => (
    <input
      type="text"
      inputMode="numeric"
      value={values[side]}
      style={{
        ...(focusedSide === side ? inputFocusStyle : inputStyle),
        ...(changed
          ? { color: focusedSide === side ? "#fff" : "#93c5fd" }
          : {}),
        gridArea,
      }}
      onChange={(e) => handleChange(side, e.target.value)}
      onFocus={(e) => {
        setFocusedSide(side);
        e.target.select();
      }}
      onBlur={() => setFocusedSide(null)}
      onKeyDown={(e) => handleKeyDown(side, e)}
      aria-label={`${label} ${side}`}
    />
  );

  return (
    <div style={{ display: "grid", gap: 4 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 13,
          fontWeight: 500,
          color: "#999",
          minHeight: 28,
        }}
      >
        <span>{label}</span>
        {changed && onReset && (
          <button
            type="button"
            style={{
              padding: 0,
              border: "none",
              borderRadius: 4,
              background: "transparent",
              color: "#93c5fd",
              cursor: "pointer",
              fontSize: 12,
            }}
            title="Reset"
            onClick={onReset}
          >
            ↩
          </button>
        )}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateAreas: `". top ." "left center right" ". bottom ."`,
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          justifyItems: "center",
          gap: 2,
          padding: 4,
        }}
      >
        {renderInput("top", "top")}
        {renderInput("left", "left")}
        <div style={{ ...innerBoxStyle, gridArea: "center" }} />
        {renderInput("right", "right")}
        {renderInput("bottom", "bottom")}
      </div>
    </div>
  );
}
