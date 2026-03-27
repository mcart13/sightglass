import { useEffect, useCallback, useRef } from "react";
import {
  useSightglassCommands,
  useSightglassSessionState,
} from "../use-sightglass";

export const InlineTextEditor = () => {
  const session = useSightglassSessionState();
  const commands = useSightglassCommands();
  const { selectedElement, isEditingText } = session;
  const committingRef = useRef(false);

  useEffect(() => {
    if (!selectedElement || isEditingText || !session.active) return;
    const handleDblClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      commands.startTextEdit();
    };
    selectedElement.addEventListener("dblclick", handleDblClick);
    return () =>
      selectedElement.removeEventListener("dblclick", handleDblClick);
  }, [selectedElement, isEditingText, session.active, commands]);

  const handleKeyDown = useCallback(
    async (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === "Escape") {
        ke.preventDefault();
        commands.cancelTextEdit();
      } else if (ke.key === "Enter" && !ke.shiftKey) {
        ke.preventDefault();
        committingRef.current = true;
        try {
          await commands.commitTextEdit();
        } finally {
          committingRef.current = false;
        }
      }
    },
    [commands]
  );

  const handleBlur = useCallback(() => {
    if (committingRef.current) {
      committingRef.current = false;
      return;
    }
    commands.commitTextEdit();
  }, [commands]);

  const handlePaste = useCallback((e: Event) => {
    e.preventDefault();
    const ce = e as ClipboardEvent;
    const text = ce.clipboardData?.getData("text/plain") ?? "";
    const ownerDoc = (e.currentTarget as Element)?.ownerDocument ?? document;
    ownerDoc.execCommand("insertText", false, text);
  }, []);

  useEffect(() => {
    if (!selectedElement || !isEditingText) return;
    selectedElement.addEventListener("keydown", handleKeyDown);
    selectedElement.addEventListener("blur", handleBlur);
    selectedElement.addEventListener("paste", handlePaste);
    return () => {
      selectedElement.removeEventListener("keydown", handleKeyDown);
      selectedElement.removeEventListener("blur", handleBlur);
      selectedElement.removeEventListener("paste", handlePaste);
    };
  }, [selectedElement, isEditingText, handleKeyDown, handleBlur, handlePaste]);

  return null;
};
