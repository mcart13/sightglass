// packages/react/src/components/SelectionOverlay.tsx
import { useEffect, useState, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
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
      setRect(r);
      rawTop.set(r.top - SELECTION_PADDING);
      rawLeft.set(r.left - SELECTION_PADDING);
      rawWidth.set(r.width + SELECTION_PADDING * 2);
      rawHeight.set(r.height + SELECTION_PADDING * 2);
      frameId = requestAnimationFrame(update);
    };
    update();

    return () => cancelAnimationFrame(frameId);
  }, [selectedElement, rawTop, rawLeft, rawWidth, rawHeight]);

  if (!rect || !primaryAnchor) {
    return null;
  }

  const tag = selectedElement?.tagName.toLowerCase() ?? "";
  const label = primaryAnchor.role ? `${tag} "${primaryAnchor.role}"` : tag;

  return (
    <>
      {/* Label above selection */}
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

      {/* Selection outline */}
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
    </>
  );
};
