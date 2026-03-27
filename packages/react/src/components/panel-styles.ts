import type { CSSProperties } from "react";

// Dark floating panel shell - positioned below the 44px toolbar + 8px gap
export const panelShellStyle: CSSProperties = {
  position: "fixed",
  top: 68, // 16 + 44 + 8
  right: 16,
  bottom: 16,
  zIndex: 99998,
  width: 256,
  display: "flex",
  flexDirection: "column",
  background: "#242424",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: 16,
  boxShadow:
    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  color: "#e5e5e7",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: 13,
  overflow: "hidden",
};

// Top bar with actions
export const panelTopBarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 4,
  padding: "8px 12px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
};

// Tab row
export const panelTabRowStyle: CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  padding: "6px 8px",
};

export const panelTabStyle = (active: boolean): CSSProperties => ({
  flex: 1,
  padding: "8px 0",
  border: "none",
  borderRadius: 10,
  background: active ? "#363636" : "transparent",
  color: active ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  textAlign: "center",
  transition: "opacity 0.15s, background 0.2s",
});

// Scroll area
export const panelScrollStyle: CSSProperties = {
  flex: 1,
  overflowY: "auto",
  overflowX: "hidden",
  padding: "0 8px 8px",
  scrollbarWidth: "none",
};

// Section with label and optional collapse
export const panelSectionStyle: CSSProperties = {
  display: "grid",
  gap: 6,
  padding: "12px 0",
  borderBottom: "1px solid #2b2b2b",
};

export const panelSectionLabelStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(255, 255, 255, 0.5)",
};

// Property row: label on left, value on right
export const panelRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  minHeight: 28,
};

export const panelRowLabelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: "#999",
  flexShrink: 0,
};

export const panelRowValueStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(255, 255, 255, 0.4)",
  textAlign: "right",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

// Compact icon button (top bar)
export const panelIconButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  border: "none",
  borderRadius: 6,
  background: "transparent",
  color: "rgba(255, 255, 255, 0.5)",
  cursor: "pointer",
  fontSize: 14,
};

// Small pill button for controls
export const panelButtonStyle: CSSProperties = {
  padding: "8px 14px",
  border: "none",
  borderRadius: 10,
  background: "rgba(255, 255, 255, 0.025)",
  color: "rgba(255, 255, 255, 0.6)",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  transition: "background 0.15s, color 0.15s",
};

export const panelButtonActiveStyle: CSSProperties = {
  ...panelButtonStyle,
  background: "#363636",
  color: "#93c5fd",
};

// Card for findings, directions, etc.
export const panelCardStyle: CSSProperties = {
  display: "grid",
  gap: 4,
  padding: "8px 14px",
  borderRadius: 10,
  background: "rgba(255, 255, 255, 0.025)",
};

// Muted text
export const panelMutedStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(255, 255, 255, 0.4)",
  lineHeight: 1.4,
};
