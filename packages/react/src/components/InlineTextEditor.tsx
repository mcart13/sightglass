import { useEffect, useCallback } from "react";
import {
  useSightglassCommands,
  useSightglassSessionState,
} from "../use-sightglass";

export const InlineTextEditor = () => {
  const session = useSightglassSessionState();
  const commands = useSightglassCommands();
  const { selectedElement, isEditingText } = session;

  useEffect(() => {
    if (!selectedElement || isEditingText) return;
    const handleDblClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      commands.startTextEdit();
    };
    selectedElement.addEventListener("dblclick", handleDblClick);
    return () =>
      selectedElement.removeEventListener("dblclick", handleDblClick);
  }, [selectedElement, isEditingText, commands]);

  const handleKeyDown = useCallback(
    (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === "Escape") {
        ke.preventDefault();
        commands.cancelTextEdit();
      } else if (ke.key === "Enter" && !ke.shiftKey) {
        ke.preventDefault();
        commands.commitTextEdit();
      }
    },
    [commands]
  );

  const handleBlur = useCallback(() => {
    commands.commitTextEdit();
  }, [commands]);

  const handlePaste = useCallback((e: Event) => {
    e.preventDefault();
    const ce = e as ClipboardEvent;
    const text = ce.clipboardData?.getData("text/plain") ?? "";
    document.execCommand("insertText", false, text);
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
