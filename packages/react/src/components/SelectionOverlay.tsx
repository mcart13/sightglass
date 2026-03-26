import type { CSSProperties } from "react";
import { useSightglassOverlayState, useSightglassSessionState } from "../use-sightglass";

const overlayStyle: CSSProperties = {
  position: "fixed",
  top: 24,
  left: 24,
  zIndex: 1000,
  width: 280,
  padding: 18,
  borderRadius: 22,
  background: "rgba(15, 23, 42, 0.92)",
  color: "#f8fafc",
  boxShadow: "0 22px 70px rgba(15, 23, 42, 0.28)",
  fontFamily: "\"Avenir Next\", \"Segoe UI\", sans-serif",
};

const chipStyle = (active: boolean): CSSProperties => ({
  padding: "6px 10px",
  borderRadius: 999,
  border: active ? "1px solid rgba(251, 191, 36, 0.8)" : "1px solid rgba(148, 163, 184, 0.28)",
  background: active ? "rgba(251, 191, 36, 0.18)" : "rgba(30, 41, 59, 0.9)",
  color: active ? "#fde68a" : "#cbd5e1",
  fontSize: 12,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
});

export const SelectionOverlay = () => {
  const session = useSightglassSessionState();
  const overlay = useSightglassOverlayState();
  const primaryAnchor = session.selection.best?.anchors[0] ?? null;
  const similarCount = session.selection.similar.length;
  const previewScope = overlay.hoveredScope ?? "single";

  return (
    <section aria-label="Selection scope overlay" style={overlayStyle}>
      <div style={{ display: "grid", gap: 8 }}>
        <span
          style={{
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#94a3b8",
          }}
        >
          Scope preview
        </span>
        <strong style={{ fontSize: 20 }}>
          {primaryAnchor?.selector ?? "Waiting for a target"}
        </strong>
        <p style={{ margin: 0, color: "#cbd5e1" }}>
          The overlay shows how far the next semantic edit will travel before you commit it.
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <span style={chipStyle(previewScope === "single")}>Single</span>
        <span style={chipStyle(previewScope === "similar")}>
          Similar
          {similarCount > 0 ? ` · ${similarCount}` : ""}
        </span>
      </div>
    </section>
  );
};
