import {
  useCommandsContext,
  useOverlayStateContext,
  useSessionStateContext,
} from "./provider";

export const useSightglassSessionState = useSessionStateContext;
export const useSightglassOverlayState = useOverlayStateContext;
export const useSightglassCommands = useCommandsContext;
