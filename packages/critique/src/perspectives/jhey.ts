import type { CritiqueCategory } from "../contracts.js";

export const jheyPerspective = Object.freeze<Record<CritiqueCategory, number>>({
  "visual-design": 22,
  "interface-design": 24,
  consistency: 20,
  "user-context": 18,
  accessibility: 20,
  "motion-quality": 38,
  "motion-performance": 42,
});
