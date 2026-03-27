/**
 * Tailwind v4 color palette (subset) with closest-color matching.
 *
 * Uses Euclidean RGB distance to find the nearest named Tailwind color
 * for any given hex value.
 */

export interface TailwindColorMatch {
  readonly name: string;
  readonly hex: string;
  readonly distance: number;
}

interface PaletteEntry {
  readonly name: string;
  readonly hex: string;
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const cleaned = hex.replace("#", "");
  if (cleaned.length !== 6) return null;
  const num = parseInt(cleaned, 16);
  if (Number.isNaN(num)) return null;
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
};

const entry = (name: string, hex: string): PaletteEntry => {
  const rgb = hexToRgb(hex)!;
  return { name, hex, ...rgb };
};

/**
 * Tailwind v4 color palette subset.
 * Includes key shades (50-950) for the most common color families,
 * plus white and black.
 */
export const TAILWIND_PALETTE: readonly PaletteEntry[] = [
  // White / Black
  entry("white", "#ffffff"),
  entry("black", "#000000"),

  // Slate
  entry("slate-50", "#f8fafc"),
  entry("slate-100", "#f1f5f9"),
  entry("slate-200", "#e2e8f0"),
  entry("slate-300", "#cbd5e1"),
  entry("slate-400", "#94a3b8"),
  entry("slate-500", "#64748b"),
  entry("slate-600", "#475569"),
  entry("slate-700", "#334155"),
  entry("slate-800", "#1e293b"),
  entry("slate-900", "#0f172a"),
  entry("slate-950", "#020617"),

  // Gray
  entry("gray-50", "#f9fafb"),
  entry("gray-100", "#f3f4f6"),
  entry("gray-200", "#e5e7eb"),
  entry("gray-300", "#d1d5db"),
  entry("gray-400", "#9ca3af"),
  entry("gray-500", "#6b7280"),
  entry("gray-600", "#4b5563"),
  entry("gray-700", "#374151"),
  entry("gray-800", "#1f2937"),
  entry("gray-900", "#111827"),
  entry("gray-950", "#030712"),

  // Red
  entry("red-50", "#fef2f2"),
  entry("red-100", "#fee2e2"),
  entry("red-200", "#fecaca"),
  entry("red-300", "#fca5a5"),
  entry("red-400", "#f87171"),
  entry("red-500", "#ef4444"),
  entry("red-600", "#dc2626"),
  entry("red-700", "#b91c1c"),
  entry("red-800", "#991b1b"),
  entry("red-900", "#7f1d1d"),
  entry("red-950", "#450a0a"),

  // Orange
  entry("orange-50", "#fff7ed"),
  entry("orange-100", "#ffedd5"),
  entry("orange-200", "#fed7aa"),
  entry("orange-300", "#fdba74"),
  entry("orange-400", "#fb923c"),
  entry("orange-500", "#f97316"),
  entry("orange-600", "#ea580c"),
  entry("orange-700", "#c2410c"),
  entry("orange-800", "#9a3412"),
  entry("orange-900", "#7c2d12"),
  entry("orange-950", "#431407"),

  // Amber
  entry("amber-50", "#fffbeb"),
  entry("amber-100", "#fef3c7"),
  entry("amber-200", "#fde68a"),
  entry("amber-300", "#fcd34d"),
  entry("amber-400", "#fbbf24"),
  entry("amber-500", "#f59e0b"),
  entry("amber-600", "#d97706"),
  entry("amber-700", "#b45309"),
  entry("amber-800", "#92400e"),
  entry("amber-900", "#78350f"),
  entry("amber-950", "#451a03"),

  // Yellow
  entry("yellow-50", "#fefce8"),
  entry("yellow-100", "#fef9c3"),
  entry("yellow-200", "#fef08a"),
  entry("yellow-300", "#fde047"),
  entry("yellow-400", "#facc15"),
  entry("yellow-500", "#eab308"),
  entry("yellow-600", "#ca8a04"),
  entry("yellow-700", "#a16207"),
  entry("yellow-800", "#854d0e"),
  entry("yellow-900", "#713f12"),
  entry("yellow-950", "#422006"),

  // Green
  entry("green-50", "#f0fdf4"),
  entry("green-100", "#dcfce7"),
  entry("green-200", "#bbf7d0"),
  entry("green-300", "#86efac"),
  entry("green-400", "#4ade80"),
  entry("green-500", "#22c55e"),
  entry("green-600", "#16a34a"),
  entry("green-700", "#15803d"),
  entry("green-800", "#166534"),
  entry("green-900", "#14532d"),
  entry("green-950", "#052e16"),

  // Blue
  entry("blue-50", "#eff6ff"),
  entry("blue-100", "#dbeafe"),
  entry("blue-200", "#bfdbfe"),
  entry("blue-300", "#93c5fd"),
  entry("blue-400", "#60a5fa"),
  entry("blue-500", "#3b82f6"),
  entry("blue-600", "#2563eb"),
  entry("blue-700", "#1d4ed8"),
  entry("blue-800", "#1e40af"),
  entry("blue-900", "#1e3a8a"),
  entry("blue-950", "#172554"),

  // Indigo
  entry("indigo-50", "#eef2ff"),
  entry("indigo-100", "#e0e7ff"),
  entry("indigo-200", "#c7d2fe"),
  entry("indigo-300", "#a5b4fc"),
  entry("indigo-400", "#818cf8"),
  entry("indigo-500", "#6366f1"),
  entry("indigo-600", "#4f46e5"),
  entry("indigo-700", "#4338ca"),
  entry("indigo-800", "#3730a3"),
  entry("indigo-900", "#312e81"),
  entry("indigo-950", "#1e1b4b"),

  // Violet
  entry("violet-50", "#f5f3ff"),
  entry("violet-100", "#ede9fe"),
  entry("violet-200", "#ddd6fe"),
  entry("violet-300", "#c4b5fd"),
  entry("violet-400", "#a78bfa"),
  entry("violet-500", "#8b5cf6"),
  entry("violet-600", "#7c3aed"),
  entry("violet-700", "#6d28d9"),
  entry("violet-800", "#5b21b6"),
  entry("violet-900", "#4c1d95"),
  entry("violet-950", "#2e1065"),

  // Purple
  entry("purple-50", "#faf5ff"),
  entry("purple-100", "#f3e8ff"),
  entry("purple-200", "#e9d5ff"),
  entry("purple-300", "#d8b4fe"),
  entry("purple-400", "#c084fc"),
  entry("purple-500", "#a855f7"),
  entry("purple-600", "#9333ea"),
  entry("purple-700", "#7e22ce"),
  entry("purple-800", "#6b21a8"),
  entry("purple-900", "#581c87"),
  entry("purple-950", "#3b0764"),

  // Pink
  entry("pink-50", "#fdf2f8"),
  entry("pink-100", "#fce7f3"),
  entry("pink-200", "#fbcfe8"),
  entry("pink-300", "#f9a8d4"),
  entry("pink-400", "#f472b6"),
  entry("pink-500", "#ec4899"),
  entry("pink-600", "#db2777"),
  entry("pink-700", "#be185d"),
  entry("pink-800", "#9d174d"),
  entry("pink-900", "#831843"),
  entry("pink-950", "#500724"),

  // Rose
  entry("rose-50", "#fff1f2"),
  entry("rose-100", "#ffe4e6"),
  entry("rose-200", "#fecdd3"),
  entry("rose-300", "#fda4af"),
  entry("rose-400", "#fb7185"),
  entry("rose-500", "#f43f5e"),
  entry("rose-600", "#e11d48"),
  entry("rose-700", "#be123c"),
  entry("rose-800", "#9f1239"),
  entry("rose-900", "#881337"),
  entry("rose-950", "#4c0519"),
];

/**
 * Find the closest Tailwind color to a given hex value using Euclidean
 * RGB distance.
 */
export const findClosestTailwindColor = (
  hex: string
): TailwindColorMatch | null => {
  const target = hexToRgb(hex);
  if (!target) return null;

  let bestMatch: PaletteEntry | null = null;
  let bestDistance = Infinity;

  for (const color of TAILWIND_PALETTE) {
    const dr = target.r - color.r;
    const dg = target.g - color.g;
    const db = target.b - color.b;
    const distance = Math.sqrt(dr * dr + dg * dg + db * db);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestMatch = color;
      if (distance === 0) break;
    }
  }

  if (!bestMatch) return null;

  return {
    name: bestMatch.name,
    hex: bestMatch.hex,
    distance: bestDistance,
  };
};
