import type { CritiqueCategory } from "../contracts.js";

export const jakubPerspective = Object.freeze<Record<CritiqueCategory, number>>({
  "visual-design": 36,
  "interface-design": 28,
  consistency: 30,
  "user-context": 22,
  accessibility: 20,
  "motion-quality": 24,
  "motion-performance": 18,
});
