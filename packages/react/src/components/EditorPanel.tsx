import type { CSSProperties } from "react";
import {
  useSightglassCommands,
  useSightglassOverlayState,
  useSightglassSessionState,
} from "../use-sightglass";
import { CritiquePanel } from "./CritiquePanel";
import { ExplorePanel } from "./ExplorePanel";
import { MotionLab } from "./MotionLab";
import { SemanticInspector } from "./SemanticInspector";
import { SessionPanel } from "./SessionPanel";

const panelStyle: CSSProperties = {
  position: "fixed",
  top: 24,
  right: 24,
  zIndex: 1000,
  width: 320,
  padding: 20,
  borderRadius: 24,
  background:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94))",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  boxShadow: "0 24px 80px rgba(15, 23, 42, 0.16)",
  color: "#0f172a",
  fontFamily: "\"Avenir Next\", \"Segoe UI\", sans-serif",
};

const sectionLabelStyle: CSSProperties = {
  fontSize: 12,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#64748b",
};

const detailRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "baseline",
};

export const EditorPanel = () => {
  const session = useSightglassSessionState();
  const overlay = useSightglassOverlayState();
  const commands = useSightglassCommands();
  const primaryAnchor = session.selection.best?.anchors[0] ?? null;
  const scopeCount = session.selection.similar.length + 1;

  if (!overlay.panelOpen) {
    return (
      <button
        type="button"
        style={{
          ...panelStyle,
          width: "auto",
          padding: "12px 16px",
        }}
        onClick={() => commands.setPanelOpen(true)}
      >
        Open semantic inspector
      </button>
    );
  }

  return (
    <aside aria-label="Semantic inspector" style={panelStyle}>
      <div style={{ display: "grid", gap: 6 }}>
        <span style={sectionLabelStyle}>Semantic inspector</span>
        <div style={detailRowStyle}>
          <strong style={{ fontSize: 24 }}>Selection</strong>
          <button
            type="button"
            style={{
              border: "none",
              background: "transparent",
              color: "#475569",
              cursor: "pointer",
            }}
            onClick={() => commands.setPanelOpen(false)}
          >
            Hide
          </button>
        </div>
        <p style={{ margin: 0, color: "#334155" }}>
          Semantic controls stay ahead of raw CSS so you can widen edits with intent.
        </p>
      </div>

      <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
        <div style={detailRowStyle}>
          <span style={sectionLabelStyle}>Target</span>
          <strong>{primaryAnchor?.selector ?? "No target selected"}</strong>
        </div>

        <div style={detailRowStyle}>
          <span style={sectionLabelStyle}>Role</span>
          <span>{primaryAnchor?.role ?? "Unknown"}</span>
        </div>

        <div style={detailRowStyle}>
          <span style={sectionLabelStyle}>Classes</span>
          <span>{primaryAnchor?.classes.join(", ") || "None"}</span>
        </div>

        <div style={detailRowStyle}>
          <span style={sectionLabelStyle}>Scope candidates</span>
          <strong>{scopeCount === 1 ? "Only this target" : `${scopeCount} live candidates`}</strong>
        </div>

        <div style={detailRowStyle}>
          <span style={sectionLabelStyle}>Preview mode</span>
          <span>{overlay.hoveredScope ?? "single"}</span>
        </div>
      </div>

      <SemanticInspector
        commands={commands}
        overlay={overlay}
        session={session}
      />
      <CritiquePanel session={session} />
      <ExplorePanel session={session} />
      <MotionLab session={session} />
      <SessionPanel session={session} />
    </aside>
  );
};
