/**
 * CSS property+value to Tailwind class converter.
 *
 * Converts common CSS declarations into their Tailwind utility equivalents.
 * Falls back to arbitrary value syntax for unknown values/properties.
 */

// Spacing scale: px value -> Tailwind suffix
const SPACING_SCALE: ReadonlyMap<number, string> = new Map([
  [0, "0"],
  [1, "px"],
  [2, "0.5"],
  [4, "1"],
  [6, "1.5"],
  [8, "2"],
  [10, "2.5"],
  [12, "3"],
  [14, "3.5"],
  [16, "4"],
  [20, "5"],
  [24, "6"],
  [28, "7"],
  [32, "8"],
  [36, "9"],
  [40, "10"],
  [44, "11"],
  [48, "12"],
  [56, "14"],
  [64, "16"],
  [80, "20"],
  [96, "24"],
]);

// CSS property -> Tailwind prefix for spacing-based utilities
const SPACING_PREFIX: ReadonlyMap<string, string> = new Map([
  ["padding", "p"],
  ["padding-top", "pt"],
  ["padding-right", "pr"],
  ["padding-bottom", "pb"],
  ["padding-left", "pl"],
  ["margin", "m"],
  ["margin-top", "mt"],
  ["margin-right", "mr"],
  ["margin-bottom", "mb"],
  ["margin-left", "ml"],
  ["gap", "gap"],
  ["width", "w"],
  ["height", "h"],
  ["min-width", "min-w"],
  ["max-width", "max-w"],
]);

// Font size: px value -> Tailwind suffix
const FONT_SIZE_SCALE: ReadonlyMap<number, string> = new Map([
  [12, "xs"],
  [14, "sm"],
  [16, "base"],
  [18, "lg"],
  [20, "xl"],
  [24, "2xl"],
  [30, "3xl"],
  [36, "4xl"],
  [48, "5xl"],
  [60, "6xl"],
  [72, "7xl"],
  [96, "8xl"],
  [128, "9xl"],
]);

// Font weight: numeric value -> Tailwind suffix
const FONT_WEIGHT_SCALE: ReadonlyMap<number, string> = new Map([
  [100, "thin"],
  [200, "extralight"],
  [300, "light"],
  [400, "normal"],
  [500, "medium"],
  [600, "semibold"],
  [700, "bold"],
  [800, "extrabold"],
  [900, "black"],
]);

// Border radius: px value -> Tailwind suffix
const BORDER_RADIUS_SCALE: ReadonlyMap<number, string> = new Map([
  [0, "none"],
  [2, "sm"],
  [4, ""],
  [6, "md"],
  [8, "lg"],
  [12, "xl"],
  [16, "2xl"],
  [24, "3xl"],
  [9999, "full"],
]);

// Display property direct mappings
const DISPLAY_MAP: ReadonlyMap<string, string> = new Map([
  ["flex", "flex"],
  ["grid", "grid"],
  ["block", "block"],
  ["inline", "inline"],
  ["inline-block", "inline-block"],
  ["inline-flex", "inline-flex"],
  ["inline-grid", "inline-grid"],
  ["none", "hidden"],
  ["table", "table"],
  ["contents", "contents"],
]);

const parsePx = (value: string): number | null => {
  const match = value.match(/^(-?\d+(?:\.\d+)?)px$/);
  return match ? Number(match[1]) : null;
};

const convertSpacing = (prefix: string, value: string): string => {
  const px = parsePx(value);
  if (px === null) return `${prefix}-[${value}]`;

  const suffix = SPACING_SCALE.get(px);
  if (suffix !== undefined) return `${prefix}-${suffix}`;

  return `${prefix}-[${value}]`;
};

const convertFontSize = (value: string): string => {
  const px = parsePx(value);
  if (px === null) return `text-[${value}]`;

  const suffix = FONT_SIZE_SCALE.get(px);
  if (suffix !== undefined) return `text-${suffix}`;

  return `text-[${value}]`;
};

const convertFontWeight = (value: string): string => {
  const num = Number(value);
  if (Number.isNaN(num)) return `font-[${value}]`;

  const suffix = FONT_WEIGHT_SCALE.get(num);
  if (suffix !== undefined) return `font-${suffix}`;

  return `font-[${value}]`;
};

const convertBorderRadius = (value: string): string => {
  const px = parsePx(value);
  if (px === null) return `rounded-[${value}]`;

  const suffix = BORDER_RADIUS_SCALE.get(px);
  if (suffix === undefined) return `rounded-[${value}]`;
  if (suffix === "") return "rounded";
  return `rounded-${suffix}`;
};

const convertOpacity = (value: string): string => {
  const num = Number(value);
  if (Number.isNaN(num)) return `opacity-[${value}]`;

  const percent = Math.round(num * 100);
  return `opacity-${percent}`;
};

const convertLineHeight = (value: string): string => `leading-[${value}]`;

const convertLetterSpacing = (value: string): string => `tracking-[${value}]`;

export const cssToTailwind = (property: string, value: string): string => {
  // Spacing-based properties
  const spacingPrefix = SPACING_PREFIX.get(property);
  if (spacingPrefix !== undefined) {
    return convertSpacing(spacingPrefix, value);
  }

  // Font size
  if (property === "font-size") {
    return convertFontSize(value);
  }

  // Font weight
  if (property === "font-weight") {
    return convertFontWeight(value);
  }

  // Border radius
  if (property === "border-radius") {
    return convertBorderRadius(value);
  }

  // Opacity
  if (property === "opacity") {
    return convertOpacity(value);
  }

  // Display
  if (property === "display") {
    const mapped = DISPLAY_MAP.get(value);
    return mapped ?? `[display:${value}]`;
  }

  // Line height
  if (property === "line-height") {
    return convertLineHeight(value);
  }

  // Letter spacing
  if (property === "letter-spacing") {
    return convertLetterSpacing(value);
  }

  // Fallback: arbitrary property
  return `[${property}:${value}]`;
};
