import { useState, useEffect, useMemo, useCallback } from "react";
import type { SightglassSessionSnapshot } from "@sightglass/core";
import type { SightglassCommands } from "../provider";
import {
  panelButtonStyle,
  panelSectionStyle,
  panelSectionLabelStyle,
  panelMutedStyle,
} from "./panel-styles";
import {
  AlignmentControl,
  type AlignValue,
  BoxSpacing,
  ColorPicker,
  Slider,
  type SliderStop,
} from "./controls";

// --- helpers ---

function rgbToHex(rgb: string): string {
  if (rgb.startsWith("#")) return rgb;
  if (rgb === "transparent" || rgb === "rgba(0, 0, 0, 0)") return "transparent";
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return "#000000";
  const [r, g, b] = match.map(Number);
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

function parseNumeric(raw: string): number {
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

type Side = "top" | "right" | "bottom" | "left";

function parseBoxValues(
  computed: CSSStyleDeclaration,
  prefix: string
): Record<Side, number> {
  return {
    top: parseNumeric(computed.getPropertyValue(`${prefix}-top`)),
    right: parseNumeric(computed.getPropertyValue(`${prefix}-right`)),
    bottom: parseNumeric(computed.getPropertyValue(`${prefix}-bottom`)),
    left: parseNumeric(computed.getPropertyValue(`${prefix}-left`)),
  };
}

// --- font size stops ---

const FONT_SIZE_STOPS: readonly SliderStop[] = [
  { value: 12, label: "xs" },
  { value: 14, label: "sm" },
  { value: 16, label: "base" },
  { value: 18, label: "lg" },
  { value: 20, label: "xl" },
  { value: 24, label: "2xl" },
  { value: 30, label: "3xl" },
  { value: 36, label: "4xl" },
  { value: 48, label: "5xl" },
];

// --- hook: read computed styles ---

function useComputedStyles(element: Element | null, history: unknown) {
  return useMemo(() => {
    if (!element) return null;
    // history is used as a cache-bust key so the memo
    // re-evaluates after mutations are applied.
    void history;
    return getComputedStyle(element);
  }, [element, history]);
}

// --- component ---

interface PropertyEditorProps {
  readonly session: Readonly<SightglassSessionSnapshot>;
  readonly commands: SightglassCommands;
}

export function PropertyEditor({ session, commands }: PropertyEditorProps) {
  const element = session.selectedElement;
  const computed = useComputedStyles(element, session.history);

  // Local state for each property
  const [bgColor, setBgColor] = useState("#000000");
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(16);
  const [fontWeight, setFontWeight] = useState(400);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [borderRadius, setBorderRadius] = useState(0);
  const [padding, setPadding] = useState<Record<Side, number>>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
  const [margin, setMargin] = useState<Record<Side, number>>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  // Sync from computed styles
  useEffect(() => {
    if (!computed) return;
    setBgColor(rgbToHex(computed.backgroundColor));
    setTextColor(rgbToHex(computed.color));
    setFontSize(parseNumeric(computed.fontSize));
    setFontWeight(parseNumeric(computed.fontWeight));
    const lh = computed.lineHeight;
    setLineHeight(
      lh === "normal"
        ? 1.5
        : parseNumeric(lh) / (parseNumeric(computed.fontSize) || 16)
    );
    setLetterSpacing(
      computed.letterSpacing === "normal"
        ? 0
        : parseNumeric(computed.letterSpacing)
    );
    setOpacity(Math.round(parseNumeric(computed.opacity) * 100));
    setBorderRadius(parseNumeric(computed.borderRadius));
    setPadding(parseBoxValues(computed, "padding"));
    setMargin(parseBoxValues(computed, "margin"));
  }, [computed]);

  const apply = useCallback(
    (property: string, value: string) => {
      commands.applyStyle(property, value);
    },
    [commands]
  );

  if (!element || !computed) {
    return (
      <div style={panelSectionStyle}>
        <span style={panelMutedStyle}>Select an element to edit styles</span>
      </div>
    );
  }

  const isFlex = computed.display.includes("flex");

  return (
    <>
      {/* Background */}
      <div style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>Background</span>
        <ColorPicker
          label="Color"
          value={bgColor}
          onChange={(v) => {
            setBgColor(v);
            apply("background-color", v);
          }}
        />
        <Slider
          label="Opacity"
          value={opacity}
          min={0}
          max={100}
          suffix="%"
          onChange={(v) => {
            setOpacity(v);
            apply("opacity", String(v / 100));
          }}
        />
      </div>

      {/* Typography */}
      <div style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>Typography</span>
        <ColorPicker
          label="Color"
          value={textColor}
          onChange={(v) => {
            setTextColor(v);
            apply("color", v);
          }}
        />
        <Slider
          label="Size"
          value={fontSize}
          min={8}
          max={72}
          step={1}
          suffix="px"
          stops={FONT_SIZE_STOPS}
          onChange={(v) => {
            setFontSize(v);
            apply("font-size", `${v}px`);
          }}
        />
        <Slider
          label="Weight"
          value={fontWeight}
          min={100}
          max={900}
          step={100}
          onChange={(v) => {
            setFontWeight(v);
            apply("font-weight", String(v));
          }}
        />
        <Slider
          label="Leading"
          value={lineHeight}
          min={0.8}
          max={3}
          step={0.05}
          formatValue={(v) => v.toFixed(2)}
          onChange={(v) => {
            setLineHeight(v);
            apply("line-height", String(v));
          }}
        />
        <Slider
          label="Tracking"
          value={letterSpacing}
          min={-2}
          max={8}
          step={0.25}
          suffix="px"
          onChange={(v) => {
            setLetterSpacing(v);
            apply("letter-spacing", `${v}px`);
          }}
        />
      </div>

      {/* Border */}
      <div style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>Border</span>
        <Slider
          label="Radius"
          value={borderRadius > 100 ? 50 : borderRadius}
          min={0}
          max={50}
          step={1}
          suffix="px"
          onChange={(v) => {
            setBorderRadius(v);
            apply("border-radius", `${v}px`);
          }}
        />
        <button
          type="button"
          style={{
            ...panelButtonStyle,
            ...(borderRadius >= 9999
              ? { background: "#363636", color: "#93c5fd" }
              : {}),
          }}
          onClick={() => {
            const next = borderRadius >= 9999 ? 0 : 9999;
            setBorderRadius(next);
            apply("border-radius", `${next}px`);
          }}
        >
          Full (pill)
        </button>
      </div>

      {/* Spacing */}
      <div style={panelSectionStyle}>
        <span style={panelSectionLabelStyle}>Spacing</span>
        <BoxSpacing
          label="Padding"
          values={padding}
          onChange={(side, v) => {
            setPadding((prev) => ({ ...prev, [side]: v }));
            apply(`padding-${side}`, `${v}px`);
          }}
        />
        <BoxSpacing
          label="Margin"
          values={margin}
          onChange={(side, v) => {
            setMargin((prev) => ({ ...prev, [side]: v }));
            apply(`margin-${side}`, `${v}px`);
          }}
        />
      </div>

      {/* Flex (conditional) */}
      {isFlex && (
        <div style={panelSectionStyle}>
          <span style={panelSectionLabelStyle}>Flex</span>
          <AlignmentControl
            label="Align Items"
            value={computed.alignItems as AlignValue}
            options={["flex-start", "center", "flex-end", "stretch"]}
            onChange={(v) => apply("align-items", v)}
          />
          <AlignmentControl
            label="Justify Content"
            value={computed.justifyContent as AlignValue}
            options={["flex-start", "center", "flex-end", "space-between"]}
            onChange={(v) => apply("justify-content", v)}
          />
        </div>
      )}
    </>
  );
}
