import { useState, type CSSProperties } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cssToTailwind } from "@sightglass/core";
import {
  useSightglassCommands,
  useSightglassOverlayState,
  useSightglassSessionState,
} from "../use-sightglass";
import { CritiquePanel } from "./CritiquePanel";
import { ExplorePanel } from "./ExplorePanel";
import { InlineTextEditor } from "./InlineTextEditor";
import { MotionLab } from "./MotionLab";
import { PropertyEditor } from "./PropertyEditor";
import { SemanticInspector } from "./SemanticInspector";
import {
  panelRowLabelStyle,
  panelRowStyle,
  panelRowValueStyle,
  panelScrollStyle,
  panelSectionLabelStyle,
  panelSectionStyle,
  panelShellStyle,
  panelTabRowStyle,
  panelTabStyle,
} from "./panel-styles";

const TABS = ["Style", "Issues", "Explore", "Motion"] as const;
type Tab = (typeof TABS)[number];

const PANEL_WIDTH = 256;
const TOOLBAR_HEIGHT = 44;
const TOOLBAR_TOP = 16;
const PANEL_GAP = 8;
const PANEL_TOP = TOOLBAR_TOP + TOOLBAR_HEIGHT + PANEL_GAP;

// Single collapsed button - 44x44 circle
const collapsedStyle: CSSProperties = {
  position: "fixed",
  top: TOOLBAR_TOP,
  right: 16,
  zIndex: 99999,
  width: TOOLBAR_HEIGHT,
  height: TOOLBAR_HEIGHT,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "none",
  borderRadius: TOOLBAR_HEIGHT / 2,
  background: "#242424",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
  color: "#fff",
  cursor: "pointer",
};

// Expanded toolbar bar
const toolbarStyle: CSSProperties = {
  position: "fixed",
  top: TOOLBAR_TOP,
  right: 16,
  zIndex: 99999,
  display: "flex",
  alignItems: "center",
  gap: 4,
  width: PANEL_WIDTH,
  height: TOOLBAR_HEIGHT,
  padding: "0 6px",
  borderRadius: TOOLBAR_HEIGHT / 2,
  background: "#242424",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: 13,
  color: "#e5e5e7",
};

const barBtn: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  border: "none",
  borderRadius: 16,
  background: "transparent",
  color: "rgba(255, 255, 255, 0.6)",
  cursor: "pointer",
};

const copyBtn: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  height: 32,
  padding: "0 12px",
  border: "none",
  borderRadius: 16,
  background: "transparent",
  color: "#fff",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500,
  whiteSpace: "nowrap",
};

const divider: CSSProperties = {
  width: 1,
  height: 20,
  background: "rgba(255, 255, 255, 0.2)",
  flexShrink: 0,
  marginLeft: "auto",
};

// SVG icons
const WandIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width={20}
    height={20}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.9418 3.86679C18.8379 3.08273 20.1884 3.12769 21.0303 3.96962C21.8723 4.81155 21.9172 6.16207 21.1332 7.05814L12 17.496L12 17.5C12 19.9852 9.98528 22 7.5 22H3.75C3.33579 22 3 21.6642 3 21.25V17.5C3 15.0147 5.01472 13 7.5 13L7.50391 13L17.9418 3.86679ZM9.33572 13.3903C10.3454 13.8419 11.1581 14.6545 11.6097 15.6642L20.0043 6.07038C20.2683 5.76862 20.2532 5.31381 19.9697 5.03028C19.6861 4.74675 19.2313 4.73161 18.9296 4.99565L9.33572 13.3903ZM7.5 14.5C5.84315 14.5 4.5 15.8431 4.5 17.5V20.5H7.5C9.15685 20.5 10.5 19.1568 10.5 17.5C10.5 17.4257 10.4973 17.3523 10.4921 17.2796C10.385 15.7989 9.20109 14.615 7.72031 14.5079C7.64768 14.5026 7.57422 14.5 7.5 14.5Z"
    />
    <path d="M4.18342 7.40782C4.28018 7.35944 4.35864 7.28098 4.40702 7.18422L5.05194 5.89438C5.2362 5.52586 5.76211 5.52586 5.94637 5.89438L6.59128 7.18422C6.63967 7.28098 6.71813 7.35944 6.81489 7.40782L8.10473 8.05274C8.47325 8.237 8.47325 8.7629 8.10473 8.94717L6.81489 9.59208C6.71813 9.64047 6.63967 9.71893 6.59128 9.81569L5.94637 11.1055C5.7621 11.4741 5.2362 11.4741 5.05194 11.1055L4.40702 9.81569C4.35864 9.71893 4.28018 9.64047 4.18342 9.59208L2.89358 8.94717C2.52506 8.7629 2.52506 8.237 2.89358 8.05274L4.18342 7.40782Z" />
    <path d="M8.55934 3.71986C8.62846 3.6853 8.6845 3.62926 8.71906 3.56014L9.17972 2.63883C9.31133 2.3756 9.68698 2.3756 9.81859 2.63883L10.2792 3.56014C10.3138 3.62926 10.3698 3.6853 10.439 3.71986L11.3603 4.18051C11.6235 4.31213 11.6235 4.68778 11.3603 4.81939L10.439 5.28005C10.3698 5.3146 10.3138 5.37065 10.2792 5.43977L9.81859 6.36108C9.68698 6.62431 9.31133 6.62431 9.17972 6.36108L8.71906 5.43977C8.6845 5.37065 8.62846 5.3146 8.55934 5.28005L7.63803 4.81939C7.3748 4.68778 7.3748 4.31213 7.63803 4.18051L8.55934 3.71986Z" />
  </svg>
);

const ClipboardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    width={20}
    height={20}
  >
    <path
      d="M15 5H16C17.6569 5 19 6.34315 19 8V18C19 19.6569 17.6569 21 16 21H8C6.34315 21 5 19.6569 5 18V8C5 6.34315 6.34315 5 8 5H9M15 7V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V7H15Z"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinejoin="round"
    />
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    width={24}
    height={24}
  >
    <path
      d="M5 6.5L5.80734 18.2064C5.91582 19.7794 7.22348 21 8.80023 21H15.1998C16.7765 21 18.0842 19.7794 18.1927 18.2064L19 6.5"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.5 6H20.5"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
    />
    <path
      d="M8.07092 5.74621C8.42348 3.89745 10.0485 2.5 12 2.5C13.9515 2.5 15.5765 3.89745 15.9291 5.74621"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
    />
    <path
      d="M10 11L14 15M14 11L10 15"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
    />
  </svg>
);

const GearIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    width={24}
    height={24}
  >
    <path
      d="M10.53 3.82729C11.4432 3.31361 12.5583 3.31361 13.4715 3.82729L18.4716 6.63977C19.4162 7.17112 20.0008 8.17067 20.0008 9.2545L20.0008 14.7454C20.0008 15.8292 19.4162 16.8288 18.4715 17.3601L13.4715 20.1726C12.5583 20.6863 11.4432 20.6863 10.53 20.1726L5.53008 17.3604C4.58539 16.8291 4.00077 15.8295 4.00077 14.7456L4.00077 9.25448C4.00077 8.17065 4.58536 7.17109 5.53 6.63974L10.53 3.82729Z"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="square"
      strokeLinejoin="round"
    />
    <path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="square"
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    width={24}
    height={24}
  >
    <path
      d="M6.5 6.5L17.5 17.5M17.5 6.5L6.5 17.5"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
    />
  </svg>
);

export const EditorPanel = () => {
  const session = useSightglassSessionState();
  const overlay = useSightglassOverlayState();
  const commands = useSightglassCommands();
  const [activeTab, setActiveTab] = useState<Tab>("Style");
  const primaryAnchor = session.selection.best?.anchors[0] ?? null;
  const scopeCount = session.selection.similar.length + (primaryAnchor ? 1 : 0);
  const changeCount = session.history.applied.length;

  const showPanel = session.active;

  return (
    <div data-sightglass-chrome="true">
      <InlineTextEditor />
      <AnimatePresence>
        {!overlay.panelOpen ? (
          <motion.button
            key="collapsed"
            type="button"
            data-sightglass-chrome="true"
            style={collapsedStyle}
            onClick={() => {
              commands.setPanelOpen(true);
              commands.setActive(true);
            }}
            initial={{ scale: 0.5, opacity: 0, filter: "blur(8px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 0.5, opacity: 0, filter: "blur(8px)" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", visualDuration: 0.2, bounce: 0.15 }}
            aria-label="Open inspector"
            title="Open inspector"
          >
            <WandIcon />
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", visualDuration: 0.2, bounce: 0.1 }}
          >
            {/* Toolbar bar - always visible when open */}
            <motion.div
              style={toolbarStyle}
              initial={{ scale: 0.9, opacity: 0, filter: "blur(8px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{
                type: "spring",
                visualDuration: 0.25,
                bounce: 0.1,
              }}
            >
              <button
                type="button"
                style={copyBtn}
                title="Copy edits"
                onClick={() => {
                  const applied = session.history.applied;
                  if (applied.length === 0) return;
                  const lines = applied.map((state) => {
                    const base = `${state.property}: ${state.after}`;
                    if (!overlay.tailwindMode) return base;
                    const tw = cssToTailwind(state.property, state.after);
                    return `${base}  \u2192  ${tw}`;
                  });
                  navigator.clipboard.writeText(lines.join("\n"));
                }}
              >
                <ClipboardIcon />
                <span>Copy Edits</span>
                {changeCount > 0 && (
                  <span
                    style={{
                      padding: "0 2px",
                      borderRadius: 2,
                      background: "#242424",
                      fontSize: 8,
                      fontWeight: 600,
                      lineHeight: "8px",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {changeCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                style={{
                  ...barBtn,
                  ...(overlay.tailwindMode
                    ? { background: "rgba(59,130,246,0.2)", color: "#60a5fa" }
                    : {}),
                }}
                onClick={() => commands.setTailwindMode(!overlay.tailwindMode)}
                title={
                  overlay.tailwindMode
                    ? "Tailwind mode on"
                    : "Tailwind mode off"
                }
                aria-label="Toggle Tailwind mode"
                aria-pressed={overlay.tailwindMode}
              >
                <GearIcon />
              </button>
              <div style={divider} />
              <button
                type="button"
                style={barBtn}
                onClick={() => {
                  commands.setPanelOpen(false);
                  commands.setActive(false);
                }}
                title="Close"
                aria-label="Close panel"
              >
                <CloseIcon />
              </button>
            </motion.div>

            {/* Panel - below toolbar, only when element selected */}
            <AnimatePresence>
              {showPanel && (
                <motion.aside
                  aria-label="Sightglass inspector"
                  style={panelShellStyle}
                  initial={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{
                    type: "spring",
                    visualDuration: 0.25,
                    bounce: 0.05,
                  }}
                >
                  <motion.div
                    role="tablist"
                    style={panelTabRowStyle}
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: { transition: { staggerChildren: 0.03 } },
                    }}
                  >
                    {TABS.map((tab) => (
                      <motion.button
                        key={tab}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab}
                        id={`sg-tab-${tab.toLowerCase()}`}
                        aria-controls={`sg-panel-${tab.toLowerCase()}`}
                        tabIndex={activeTab === tab ? 0 : -1}
                        style={panelTabStyle(activeTab === tab)}
                        onClick={() => setActiveTab(tab)}
                        variants={{
                          hidden: { opacity: 0, scale: 0.8 },
                          visible: { opacity: 1, scale: 1 },
                        }}
                        transition={{
                          type: "spring",
                          visualDuration: 0.15,
                          bounce: 0.1,
                        }}
                      >
                        {tab}
                      </motion.button>
                    ))}
                  </motion.div>

                  <div
                    role="tabpanel"
                    id={`sg-panel-${activeTab.toLowerCase()}`}
                    aria-labelledby={`sg-tab-${activeTab.toLowerCase()}`}
                    style={panelScrollStyle}
                  >
                    <div style={panelSectionStyle}>
                      <span style={panelSectionLabelStyle}>Selection</span>
                      <div style={panelRowStyle}>
                        <span style={panelRowLabelStyle}>Target</span>
                        <span style={{ ...panelRowValueStyle, maxWidth: 150 }}>
                          {primaryAnchor?.selector ?? "Click an element"}
                        </span>
                      </div>
                      <div style={panelRowStyle}>
                        <span style={panelRowLabelStyle}>Role</span>
                        <span style={panelRowValueStyle}>
                          {primaryAnchor?.role ?? "—"}
                        </span>
                      </div>
                      <div style={panelRowStyle}>
                        <span style={panelRowLabelStyle}>Scope</span>
                        <span style={panelRowValueStyle}>
                          {scopeCount <= 1 ? "—" : `${scopeCount} candidates`}
                        </span>
                      </div>
                    </div>

                    {activeTab === "Style" && (
                      <>
                        <PropertyEditor session={session} commands={commands} />
                        <SemanticInspector
                          commands={commands}
                          overlay={overlay}
                          session={session}
                        />
                      </>
                    )}
                    {activeTab === "Issues" && (
                      <CritiquePanel session={session} />
                    )}
                    {activeTab === "Explore" && (
                      <ExplorePanel session={session} />
                    )}
                    {activeTab === "Motion" && <MotionLab session={session} />}
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
