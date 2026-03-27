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

const SessionStateContext = createContext<Readonly<SightglassSessionSnapshot> | null>(
  null,
);
const OverlayStateContext = createContext<OverlayState | null>(null);
const CommandsContext = createContext<SightglassCommands | null>(null);

const resolveDocument = (documentOverride?: Document): Document => {
  if (documentOverride) {
    return documentOverride;
  }

  if (typeof globalThis.document !== "undefined") {
    return globalThis.document;
  }

  throw new Error(
    "SightglassProvider requires a document when no controller is provided.",
  );
};

export const SightglassProvider = ({
  children,
  controller,
  document,
}: SightglassProviderProps) => {
  const ownedController = useMemo(
    () =>
      controller ? null : createSightglassController({ document: resolveDocument(document) }),
    [controller, document],
  );
  const resolvedController = controller ?? ownedController;

  if (!resolvedController) {
    throw new Error(
      "SightglassProvider requires a controller or a document to create one.",
    );
  }

  const subscribe = useCallback(
    (listener: () => void) => resolvedController.subscribe(listener),
    [resolvedController],
  );
  const getSnapshot = useCallback(
    () => resolvedController.getSnapshot(),
    [resolvedController],
  );
  const sessionState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
  const [hoveredScope, setHoveredScope] = useState<EditScope | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => {
    resolvedController.mount();
    return () => {
      resolvedController.destroy();
    };
  }, [resolvedController]);

  const overlayState = useMemo<OverlayState>(
    () => ({
      hoveredScope,
      panelOpen,
    }),
    [hoveredScope, panelOpen],
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
    [resolvedController],
  );

  return (
    <SessionStateContext.Provider value={sessionState}>
      <OverlayStateContext.Provider value={overlayState}>
        <CommandsContext.Provider value={commands}>
          {children}
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

export type { OverlayState, SightglassCommands, SightglassProviderProps };
