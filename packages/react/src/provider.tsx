import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type PropsWithChildren,
} from "react";
import type {
  CritiquePerspective,
  CritiqueScope,
  MotionTuningControlId,
} from "@sightglass/critique";
import {
  createReviewDraftSnapshot,
  type ReviewDraftSnapshot,
} from "@sightglass/session";
import {
  createSightglassController,
  type EditScope,
  type SelectionPoint,
  type SightglassController,
  type SightglassSessionSnapshot,
} from "@sightglass/core";

interface OverlayState {
  readonly hoveredScope: EditScope | null;
  readonly panelOpen: boolean;
}

interface SightglassCommands {
  setActive(active: boolean): void;
  inspectAtPoint(point: SelectionPoint): void;
  undo(): Promise<unknown>;
  redo(): Promise<unknown>;
  setHoveredScope(scope: EditScope | null): void;
  setPanelOpen(open: boolean): void;
}

interface SightglassProviderProps extends PropsWithChildren {
  readonly controller?: SightglassController;
  readonly document?: Document;
}

interface ReviewDraftCommands {
  setCritiquePerspective(perspective: CritiquePerspective): void;
  setCritiqueScope(scope: CritiqueScope): void;
  setSelectedFindingId(findingId: string | null): void;
  setSelectedDirectionId(directionId: string | null): void;
  setMotionValue(controlId: MotionTuningControlId, value: number): void;
  hydrateReviewDraft(draft: Partial<ReviewDraftSnapshot>): void;
}

const SessionStateContext =
  createContext<Readonly<SightglassSessionSnapshot> | null>(null);
const OverlayStateContext = createContext<OverlayState | null>(null);
const CommandsContext = createContext<SightglassCommands | null>(null);
const ReviewDraftStateContext = createContext<ReviewDraftSnapshot | null>(null);
const ReviewDraftCommandsContext = createContext<ReviewDraftCommands | null>(
  null
);

const resolveDocument = (documentOverride?: Document): Document => {
  if (documentOverride) {
    return documentOverride;
  }

  if (typeof globalThis.document !== "undefined") {
    return globalThis.document;
  }

  throw new Error(
    "SightglassProvider requires a document when no controller is provided."
  );
};

export const SightglassProvider = ({
  children,
  controller,
  document,
}: SightglassProviderProps) => {
  const ownedController = useMemo(
    () =>
      controller
        ? null
        : createSightglassController({ document: resolveDocument(document) }),
    [controller, document]
  );
  const resolvedController = controller ?? ownedController;

  if (!resolvedController) {
    throw new Error(
      "SightglassProvider requires a controller or a document to create one."
    );
  }

  const subscribe = useCallback(
    (listener: () => void) => resolvedController.subscribe(listener),
    [resolvedController]
  );
  const getSnapshot = useCallback(
    () => resolvedController.getSnapshot(),
    [resolvedController]
  );
  const sessionState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );
  const [hoveredScope, setHoveredScope] = useState<EditScope | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [critiquePerspective, setCritiquePerspective] =
    useState<CritiquePerspective>("emil");
  const [critiqueScope, setCritiqueScope] = useState<CritiqueScope>("node");
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(
    null
  );
  const [selectedDirectionId, setSelectedDirectionId] = useState<string | null>(
    null
  );
  const [motionValues, setMotionValues] = useState<
    Partial<Record<MotionTuningControlId, number>>
  >({});

  useEffect(() => {
    return () => {
      resolvedController.destroy();
    };
  }, [resolvedController]);

  const overlayState = useMemo<OverlayState>(
    () => ({
      hoveredScope,
      panelOpen,
    }),
    [hoveredScope, panelOpen]
  );
  const commands = useMemo<SightglassCommands>(
    () => ({
      setActive: (active) => resolvedController.setActive(active),
      inspectAtPoint: (point) => resolvedController.inspectAtPoint(point),
      undo: () => resolvedController.undo(),
      redo: () => resolvedController.redo(),
      setHoveredScope,
      setPanelOpen,
    }),
    [resolvedController]
  );
  const reviewDraftState = useMemo<ReviewDraftSnapshot>(
    () =>
      createReviewDraftSnapshot({
        critiquePerspective,
        critiqueScope,
        selectedFindingId,
        selectedDirectionId,
        motionValues,
      }),
    [
      critiquePerspective,
      critiqueScope,
      selectedFindingId,
      selectedDirectionId,
      motionValues,
    ]
  );
  const reviewDraftCommands = useMemo<ReviewDraftCommands>(
    () => ({
      setCritiquePerspective,
      setCritiqueScope,
      setSelectedFindingId,
      setSelectedDirectionId,
      setMotionValue: (controlId, value) =>
        setMotionValues((current) => ({
          ...current,
          [controlId]: value,
        })),
      hydrateReviewDraft: (draft) => {
        if (draft.critiquePerspective !== undefined) {
          setCritiquePerspective(draft.critiquePerspective);
        }

        if (draft.critiqueScope !== undefined) {
          setCritiqueScope(draft.critiqueScope);
        }

        if (draft.selectedFindingId !== undefined) {
          setSelectedFindingId(draft.selectedFindingId);
        }

        if (draft.selectedDirectionId !== undefined) {
          setSelectedDirectionId(draft.selectedDirectionId);
        }

        if (draft.motionValues !== undefined) {
          setMotionValues({ ...draft.motionValues });
        }
      },
    }),
    []
  );

  return (
    <SessionStateContext.Provider value={sessionState}>
      <OverlayStateContext.Provider value={overlayState}>
        <CommandsContext.Provider value={commands}>
          <ReviewDraftStateContext.Provider value={reviewDraftState}>
            <ReviewDraftCommandsContext.Provider value={reviewDraftCommands}>
              {children}
            </ReviewDraftCommandsContext.Provider>
          </ReviewDraftStateContext.Provider>
        </CommandsContext.Provider>
      </OverlayStateContext.Provider>
    </SessionStateContext.Provider>
  );
};

const readRequiredContext = <T,>(value: T | null, name: string): T => {
  if (value === null) {
    throw new Error(`${name} must be used within SightglassProvider.`);
  }

  return value;
};

export const useSessionStateContext = (): Readonly<SightglassSessionSnapshot> =>
  readRequiredContext(useContext(SessionStateContext), "Session state context");

export const useOverlayStateContext = (): OverlayState =>
  readRequiredContext(useContext(OverlayStateContext), "Overlay state context");

export const useCommandsContext = (): SightglassCommands =>
  readRequiredContext(useContext(CommandsContext), "Commands context");

export const useReviewDraftStateContext = (): ReviewDraftSnapshot =>
  readRequiredContext(
    useContext(ReviewDraftStateContext),
    "Review draft state context"
  );

export const useReviewDraftCommandsContext = (): ReviewDraftCommands =>
  readRequiredContext(
    useContext(ReviewDraftCommandsContext),
    "Review draft commands context"
  );

export type {
  OverlayState,
  ReviewDraftCommands,
  SightglassCommands,
  SightglassProviderProps,
};
