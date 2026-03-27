import {
  useCommandsContext,
  useOverlayStateContext,
  useReviewDraftCommandsContext,
  useReviewDraftStateContext,
  useSessionStateContext,
} from "./provider";

export const useSightglassSessionState = useSessionStateContext;
export const useSightglassOverlayState = useOverlayStateContext;
export const useSightglassCommands = useCommandsContext;
export const useSightglassReviewDraftState = useReviewDraftStateContext;
export const useSightglassReviewDraftCommands = useReviewDraftCommandsContext;
