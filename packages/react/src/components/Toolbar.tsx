import type { CSSProperties } from "react";
import { useSightglassCommands, useSightglassSessionState } from "../use-sightglass";

const shellStyle: CSSProperties = {
  position: "fixed",
  left: "50%",
  bottom: 24,
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  gap: 16,
  minWidth: 480,
  padding: "14px 18px",
  border: "1px solid rgba(15, 23, 42, 0.16)",
  borderRadius: 20,
  background:
    "linear-gradient(135deg, rgba(255, 251, 235, 0.98), rgba(255, 255, 255, 0.94))",
  boxShadow: "0 18px 60px rgba(15, 23, 42, 0.18)",
  backdropFilter: "blur(18px)",
  transform: "translateX(-50%)",
  fontFamily: "\"Iowan Old Style\", \"Palatino Linotype\", serif",
};

const statusStyle = (active: boolean): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  borderRadius: 999,
  background: active ? "rgba(15, 118, 110, 0.12)" : "rgba(148, 163, 184, 0.12)",
  color: active ? "#115e59" : "#334155",
  fontSize: 14,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
});

const buttonStyle: CSSProperties = {
  border: "1px solid rgba(148, 163, 184, 0.3)",
  borderRadius: 999,
  padding: "10px 14px",
  background: "rgba(255, 255, 255, 0.88)",
  color: "#0f172a",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 14,
};

const primaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: "#0f172a",
  borderColor: "#0f172a",
  color: "#f8fafc",
};

export const Toolbar = () => {
  const session = useSightglassSessionState();
  const commands = useSightglassCommands();
  const liveChanges = session.history.applied.length;
  const changeLabel =
    liveChanges === 1 ? "1 live change" : `${liveChanges} live changes`;

  return (
    <section aria-label="Editing flow toolbar" style={shellStyle}>
      <div style={{ display: "grid", gap: 4, flex: 1 }}>
        <span style={statusStyle(session.active)}>
          {session.active ? "Editing live" : "Start editing"}
        </span>
        <strong style={{ fontSize: 18, color: "#0f172a" }}>{changeLabel}</strong>
      </div>

      <button
        type="button"
        style={primaryButtonStyle}
        onClick={() => commands.setActive(!session.active)}
      >
        {session.active ? "Pause session" : "Start editing"}
      </button>

      <button
        data-command="undo"
        type="button"
        style={buttonStyle}
        disabled={!session.history.canUndo}
        onClick={() => {
          void commands.undo();
        }}
      >
        Undo
      </button>

      <button
        data-command="redo"
        type="button"
        style={buttonStyle}
        disabled={!session.history.canRedo}
        onClick={() => {
          void commands.redo();
        }}
      >
        Redo
      </button>
    </section>
  );
};
