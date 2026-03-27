import type { CritiqueCategory } from "../contracts.js";

export const emilPerspective = Object.freeze<Record<CritiqueCategory, number>>({
  "visual-design": 24,
  "interface-design": 34,
  consistency: 28,
  "user-context": 26,
  accessibility: 40,
  "motion-quality": 18,
  "motion-performance": 16,
});
