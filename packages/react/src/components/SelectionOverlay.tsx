// packages/react/src/components/SelectionOverlay.tsx
import { useEffect, useState, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { INTERACTIVE_SELECTOR } from "@sightglass/core";
import { useSightglassSessionState } from "../use-sightglass";

const SELECTION_PADDING = 8;

const labelBaseStyle: CSSProperties = {
  position: "fixed",
  zIndex: 99998,
  padding: "2px 8px",
  borderRadius: 4,
  color: "#fff",
  fontSize: 12,
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontWeight: 500,
  whiteSpace: "nowrap",
  pointerEvents: "none",
};

const springConfig = { stiffness: 500, damping: 35, mass: 0.8 };

export const SelectionOverlay = () => {
  const session = useSightglassSessionState();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const selectedElement = session.selectedElement;
  const primaryAnchor = session.selection.best?.anchors[0] ?? null;

  // Hover preview state (local to this component, purely visual)
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);
  const [hoverTag, setHoverTag] = useState("");

  // Spring-animated position/size values
  const rawTop = useMotionValue(0);
  const rawLeft = useMotionValue(0);
  const rawWidth = useMotionValue(0);
  const rawHeight = useMotionValue(0);

  const springTop = useSpring(rawTop, springConfig);
  const springLeft = useSpring(rawLeft, springConfig);
  const springWidth = useSpring(rawWidth, springConfig);
  const springHeight = useSpring(rawHeight, springConfig);

  useEffect(() => {
    if (!selectedElement) {
      setRect(null);
      return;
    }

    let frameId: number;
    const update = () => {
      if (!selectedElement.isConnected) {
        setRect(null);
        return;
      }
      const r = selectedElement.getBoundingClientRect();
      setRect((prev) => {
        if (
          prev &&
          prev.top === r.top &&
          prev.left === r.left &&
          prev.width === r.width &&
          prev.height === r.height
        ) {
          return prev;
        }
        return r;
      });
      rawTop.set(r.top - SELECTION_PADDING);
      rawLeft.set(r.left - SELECTION_PADDING);
      rawWidth.set(r.width + SELECTION_PADDING * 2);
      rawHeight.set(r.height + SELECTION_PADDING * 2);
      frameId = requestAnimationFrame(update);
    };
    update();

    return () => cancelAnimationFrame(frameId);
  }, [selectedElement, rawTop, rawLeft, rawWidth, rawHeight]);

  // Hover preview: show dashed outline on element under cursor
  useEffect(() => {
    if (!session.active) {
      setHoverRect(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (!target) {
        setHoverRect(null);
        return;
      }

      // Skip sightglass chrome (toolbar, panels, overlays)
      if (target.closest("[data-sightglass-chrome]")) {
        setHoverRect(null);
        return;
      }

      // Resolve to the nearest interactive ancestor (same logic as resolveBestElement)
      const resolved = target.closest(INTERACTIVE_SELECTOR) ?? target;

      // Don't show hover on the already-selected element
      if (resolved === selectedElement) {
        setHoverRect(null);
        return;
      }

      setHoverRect(resolved.getBoundingClientRect());
      setHoverTag(resolved.tagName.toLowerCase());
    };

    const handleMouseLeave = () => setHoverRect(null);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [session.active, selectedElement]);

  const showSelection = rect && primaryAnchor;
  const tag = selectedElement?.tagName.toLowerCase() ?? "";
  const label = primaryAnchor?.role ? `${tag} "${primaryAnchor.role}"` : tag;

  return (
    <>
      {/* Hover preview outline (below selection z-index) */}
      {hoverRect && (
        <>
          <div
            style={{
              ...labelBaseStyle,
              zIndex: 99997,
              background: "#3b82f6",
              top: Math.max(0, hoverRect.top - SELECTION_PADDING - 24),
              left: hoverRect.left - SELECTION_PADDING + 8,
            }}
          >
            {hoverTag}
          </div>
          <div
            style={{
              position: "fixed",
              zIndex: 99997,
              border: "2px dashed #60a5fa",
              background: "rgba(96, 165, 250, 0.05)",
              borderRadius: 4,
              pointerEvents: "none",
              transition: "all 75ms ease-out",
              top: hoverRect.top - SELECTION_PADDING,
              left: hoverRect.left - SELECTION_PADDING,
              width: hoverRect.width + SELECTION_PADDING * 2,
              height: hoverRect.height + SELECTION_PADDING * 2,
            }}
          />
        </>
      )}

      {/* Selection label */}
      {showSelection && (
        <motion.div
          style={{
            ...labelBaseStyle,
            background: "#2563eb",
            top: springTop,
            left: springLeft,
            y: -24,
            x: 8,
          }}
          initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ type: "spring", visualDuration: 0.2, bounce: 0.1 }}
        >
          {label}
        </motion.div>
      )}

      {/* Selection outline */}
      {showSelection && (
        <motion.div
          style={{
            position: "fixed",
            zIndex: 99998,
            border: "2px solid #2563eb",
            borderRadius: 4,
            pointerEvents: "none",
            top: springTop,
            left: springLeft,
            width: springWidth,
            height: springHeight,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        />
      )}
    </>
  );
};
