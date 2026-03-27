import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type CSSProperties,
} from "react";
import { Slider } from "./Slider";

export interface ColorPickerProps {
  readonly label: string;
  readonly value: string; // hex color
  readonly changed?: boolean;
  readonly onChange: (color: string) => void;
  readonly onReset?: () => void;
}

// --- HSL <-> Hex conversion ---

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hue2rgb(p: number, q: number, t: number): number {
  let tt = t;
  if (tt < 0) tt += 1;
  if (tt > 1) tt -= 1;
  if (tt < 1 / 6) return p + (q - p) * 6 * tt;
  if (tt < 1 / 2) return q;
  if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
  return p;
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return `#${v.toString(16).padStart(2, "0")}${v
      .toString(16)
      .padStart(2, "0")}${v.toString(16).padStart(2, "0")}`;
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hn = h / 360;
  const r = Math.round(hue2rgb(p, q, hn + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, hn) * 255);
  const b = Math.round(hue2rgb(p, q, hn - 1 / 3) * 255);
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

export { hslToHex };

// --- Validation ---

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function isValidHex(s: string): boolean {
  return HEX_RE.test(s);
}

// --- Component ---

export function ColorPicker({
  label,
  value,
  changed = false,
  onChange,
  onReset,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [hexDraft, setHexDraft] = useState(value);
  const [inputFocused, setInputFocused] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync draft from prop when it changes externally
  useEffect(() => {
    setHexDraft(value);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const [h, s, l] = isValidHex(value) ? hexToHsl(value) : [0, 0, 50];

  const handleHexInput = useCallback(
    (draft: string) => {
      setHexDraft(draft);
      if (isValidHex(draft)) {
        onChange(draft.toLowerCase());
      }
    },
    [onChange]
  );

  const handleHslChange = useCallback(
    (channel: "h" | "s" | "l", v: number) => {
      const nh = channel === "h" ? v : h;
      const ns = channel === "s" ? v : s;
      const nl = channel === "l" ? v : l;
      const hex = hslToHex(nh, ns, nl);
      onChange(hex);
    },
    [h, s, l, onChange]
  );

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

  const triggerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 8px",
    border: "none",
    borderRadius: 6,
    background: "rgba(255,255,255,0.025)",
    color: changed ? "#93c5fd" : "rgba(255,255,255,0.4)",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "color 0.15s",
  };

  const swatchStyle: CSSProperties = {
    width: 14,
    height: 14,
    borderRadius: 4,
    background: value,
    border: "1px solid rgba(255,255,255,0.1)",
    flexShrink: 0,
  };

  const popoverStyle: CSSProperties = {
    position: "fixed",
    zIndex: 100000,
    width: 220,
    padding: 12,
    background: "#242424",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    display: "grid",
    gap: 10,
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "6px 8px",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 6,
    background: "rgba(255,255,255,0.025)",
    color: "#e5e5e7",
    fontSize: 13,
    fontFamily: "monospace",
    boxSizing: "border-box",
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

  // Position popover below trigger
  const getPopoverPosition = (): CSSProperties => {
    if (!triggerRef.current) return {};
    const rect = triggerRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 4,
      left: rect.right - 220,
    };
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={rowStyle}>
        <span style={labelStyle}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            type="button"
            ref={triggerRef}
            style={triggerStyle}
            onPointerDown={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            <span style={swatchStyle} />
            <span>{value}</span>
          </button>
          {changed && onReset && (
            <button
              type="button"
              style={resetStyle}
              title="Reset"
              aria-label="Reset color"
              onClick={onReset}
            >
              ↩
            </button>
          )}
        </div>
      </div>
      {open && (
        <div
          ref={popoverRef}
          data-sightglass-chrome="true"
          style={{ ...popoverStyle, ...getPopoverPosition() }}
        >
          <input
            type="text"
            value={hexDraft}
            style={{
              ...inputStyle,
              ...(inputFocused
                ? {
                    borderColor: "rgba(255,255,255,0.3)",
                    boxShadow: "0 0 0 1px rgba(59,130,246,0.3)",
                  }
                : {}),
            }}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            onChange={(e) => handleHexInput(e.target.value)}
            spellCheck={false}
            aria-label="Hex color"
          />
          <Slider
            label="H"
            value={h}
            min={0}
            max={360}
            suffix="deg"
            onChange={(v) => handleHslChange("h", v)}
          />
          <Slider
            label="S"
            value={s}
            min={0}
            max={100}
            suffix="%"
            onChange={(v) => handleHslChange("s", v)}
          />
          <Slider
            label="L"
            value={l}
            min={0}
            max={100}
            suffix="%"
            onChange={(v) => handleHslChange("l", v)}
          />
        </div>
      )}
    </div>
  );
}
