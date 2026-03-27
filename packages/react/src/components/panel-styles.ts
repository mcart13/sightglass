import type { CSSProperties } from "react";

export const panelSectionStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  padding: 14,
  borderRadius: 18,
  background: "rgba(15, 23, 42, 0.04)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
};

export const panelSectionLabelStyle: CSSProperties = {
  fontSize: 12,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#64748b",
};

export const panelButtonStyle: CSSProperties = {
  border: "1px solid rgba(148, 163, 184, 0.22)",
  background: "rgba(255, 255, 255, 0.9)",
  color: "#0f172a",
  borderRadius: 999,
  padding: "6px 10px",
  cursor: "pointer",
};

export const panelCardStyle: CSSProperties = {
  display: "grid",
  gap: 6,
  padding: 12,
  borderRadius: 14,
  background: "rgba(255, 255, 255, 0.9)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
};
