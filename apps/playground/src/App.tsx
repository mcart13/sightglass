import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  createEditOperation,
  createSessionTransaction,
  createSightglassController,
  type SelectionAnchor,
  type SightglassController,
  type SightglassSessionSnapshot,
} from "@sightglass/core";
import {
  buildExploreEditPlan,
  buildMotionStoryboard,
  createMotionTuningSchema,
  generateDesignDirections,
  runScopedCritique,
} from "@sightglass/critique";
import { createChangeManifest, createReviewArtifact } from "@sightglass/export";
import {
  buildChangeManifestTargets,
  buildSessionTransactionsFromHistory,
  createIndexedDbSessionStore,
  createReviewDraftSnapshot,
  createSessionRecord,
  serializeHistorySnapshot,
  type SessionStore,
} from "@sightglass/session";
import {
  EditorPanel,
  SelectionOverlay,
  SightglassProvider,
  Toolbar,
  useSightglassCommands,
  useSightglassReviewDraftCommands,
  useSightglassReviewDraftState,
  useSightglassSessionState,
} from "@sightglass/react";
import { CardsFixture } from "./fixtures/cards";
import { ContentEdgeCasesFixture } from "./fixtures/content-edge-cases";
import { FormsFixture } from "./fixtures/forms";
import { LandingPageFixture } from "./fixtures/landing-page";
import { MotionFixture } from "./fixtures/motion";
import { TokensFixture, playgroundStyles } from "./fixtures/tokens";
import {
  createReviewRouteModel,
  renderReviewRouteSummary,
} from "./routes/review";

const liveHarnessStyle: CSSProperties = {
  display: "grid",
  gap: 16,
};

const workbenchStyle: CSSProperties = {
  display: "grid",
  gap: 16,
  alignSelf: "start",
};

const buttonRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const buttonStyle: CSSProperties = {
  border: "1px solid rgba(54, 36, 20, 0.12)",
  borderRadius: 999,
  padding: "10px 14px",
  background: "rgba(255, 255, 255, 0.88)",
  color: "var(--sg-ink-strong)",
  cursor: "pointer",
};

const primaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: "var(--sg-ink-strong)",
  color: "var(--sg-surface-0)",
  borderColor: "var(--sg-ink-strong)",
};

const outputStyle: CSSProperties = {
  width: "100%",
  minHeight: 220,
  padding: 16,
  borderRadius: 20,
  border: "1px solid rgba(54, 36, 20, 0.12)",
  background: "rgba(255, 255, 255, 0.78)",
  color: "var(--sg-ink-strong)",
  fontFamily: '"SFMono-Regular", Consolas, monospace',
  fontSize: 13,
  lineHeight: 1.55,
};

const statusChipStyle = (active: boolean): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  width: "fit-content",
  padding: "8px 12px",
  borderRadius: 999,
  background: active ? "rgba(210, 106, 66, 0.14)" : "rgba(54, 36, 20, 0.08)",
  color: active ? "#a24c26" : "var(--sg-ink-muted)",
  fontSize: 13,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
});

const resolveSelectedAnchor = (
  session: Readonly<SightglassSessionSnapshot>
): SelectionAnchor | null => session.selection.best?.anchors[0] ?? null;

const readOperationBefore = (
  session: Readonly<SightglassSessionSnapshot>,
  property: string
): string => {
  const selectedElement = session.selectedElement;

  if (!selectedElement) {
    return "";
  }

  if (property === "textContent") {
    return selectedElement.textContent ?? "";
  }

  const computedStyle =
    selectedElement.ownerDocument.defaultView?.getComputedStyle(
      selectedElement
    );
  return computedStyle?.getPropertyValue(property).trim() ?? "";
};

const inspectAnchor = (
  controller: SightglassController,
  selector: string | null
): void => {
  if (!selector) {
    return;
  }

  try {
    const element = document.querySelector(selector);

    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    controller.inspectAtPoint({
      x: Math.min(rect.left + 16, rect.right - 1),
      y: Math.min(rect.top + 16, rect.bottom - 1),
    });
  } catch {
    // Ignore stale selectors when replaying old sessions.
  }
};

const resetControllerHistory = async (
  controller: SightglassController
): Promise<void> => {
  while (controller.getSnapshot().history.canUndo) {
    await controller.undo();
  }
};

const SelectionBridge = () => {
  const commands = useSightglassCommands();
  const session = useSightglassSessionState();

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!session.active) {
        return;
      }

      if (!(event.target instanceof Element)) {
        return;
      }

      if (event.target.closest("[data-sightglass-chrome='true']")) {
        return;
      }

      const selectable = event.target.closest(
        "[data-sightglass-selectable='true']"
      );

      if (!selectable) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const rect = selectable.getBoundingClientRect();
      commands.inspectAtPoint({
        x: Math.min(rect.left + 16, rect.right - 1),
        y: Math.min(rect.top + 16, rect.bottom - 1),
      });
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [commands, session.active]);

  return null;
};

interface LiveHarnessProps {
  readonly controller: SightglassController;
}

const LiveHarness = ({ controller }: LiveHarnessProps) => {
  const session = useSightglassSessionState();
  const reviewDraft = useSightglassReviewDraftState();
  const reviewDraftCommands = useSightglassReviewDraftCommands();
  const [store, setStore] = useState<SessionStore | null>(null);
  const [statusText, setStatusText] = useState(
    "Use the real packages to edit fixtures, export a manifest, and restore a local review session."
  );
  const [manifestText, setManifestText] = useState("");
  const selectedAnchor = resolveSelectedAnchor(session);
  const critiqueReport = useMemo(() => {
    return runScopedCritique({
      selectedElement: session.selectedElement,
      perspective: reviewDraft.critiquePerspective,
      scope: reviewDraft.critiqueScope,
      target: selectedAnchor,
    });
  }, [
    reviewDraft.critiquePerspective,
    reviewDraft.critiqueScope,
    selectedAnchor,
    session.selectedElement,
  ]);
  const directions = useMemo(
    () =>
      critiqueReport
        ? generateDesignDirections(critiqueReport)
        : Object.freeze([]),
    [critiqueReport]
  );
  const activeDirection =
    directions.find(
      (direction) => direction.id === reviewDraft.selectedDirectionId
    ) ??
    directions[0] ??
    null;
  const motionStoryboard = useMemo(
    () =>
      critiqueReport ? buildMotionStoryboard(critiqueReport.context) : null,
    [critiqueReport]
  );
  const motionTuningSchema = useMemo(
    () =>
      critiqueReport ? createMotionTuningSchema(critiqueReport.context) : null,
    [critiqueReport]
  );
  const latestManifest = useMemo(() => {
    if (!selectedAnchor || !critiqueReport || !motionStoryboard) {
      return null;
    }

    const createdAt = new Date().toISOString();
    const transactions = buildSessionTransactionsFromHistory(
      session.history,
      createdAt
    );

    return createChangeManifest({
      route: "/playground/landing",
      sessionId: `playground-${createdAt}`,
      targets: buildChangeManifestTargets(
        transactions,
        selectedAnchor,
        "Current playground target"
      ),
      transactions,
      critique: critiqueReport.findings,
      exploration:
        activeDirection && critiqueReport
          ? [
              {
                directionId: activeDirection.id,
                title: activeDirection.title,
                proposedOperations: buildExploreEditPlan(
                  activeDirection,
                  critiqueReport
                ).proposedOperations,
              },
            ]
          : [],
      motionStoryboard,
    });
  }, [
    activeDirection,
    critiqueReport,
    motionStoryboard,
    selectedAnchor,
    session,
  ]);
  const latestRecord = useMemo(() => {
    if (
      !latestManifest ||
      !critiqueReport ||
      !motionStoryboard ||
      !motionTuningSchema
    ) {
      return null;
    }

    return createSessionRecord({
      id: latestManifest.sessionId,
      name: "Playground review",
      route: latestManifest.route,
      manifest: latestManifest,
      history: serializeHistorySnapshot(session.history),
      critiqueReport,
      directions,
      motionStoryboard,
      motionTuningSchema,
      reviewDraft: createReviewDraftSnapshot(reviewDraft),
      reviewArtifact: createReviewArtifact({ manifest: latestManifest }),
    });
  }, [
    critiqueReport,
    directions,
    latestManifest,
    motionStoryboard,
    motionTuningSchema,
    reviewDraft,
    session.history,
  ]);

  useEffect(() => {
    let cancelled = false;

    void createIndexedDbSessionStore()
      .then((sessionStore) => {
        if (!cancelled) {
          setStore(sessionStore);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatusText("Local session storage failed to initialize.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const applySingleEdit = async (
    property: string,
    after: string,
    semanticKind: "css" | "token",
    scope: "single" | "token",
    label: string
  ) => {
    if (!selectedAnchor) {
      setStatusText("Select a fixture target first.");
      return;
    }

    try {
      await controller.apply(
        createSessionTransaction({
          id: `${semanticKind}-${Date.now()}`,
          scope,
          targets: [selectedAnchor],
          operations: [
            createEditOperation({
              id: `${semanticKind}-operation-${property}`,
              property,
              before: readOperationBefore(session, property),
              after,
              semanticKind,
            }),
          ],
          createdAt: new Date().toISOString(),
        })
      );

      setStatusText(label);
    } catch {
      setStatusText("Failed to apply the requested edit.");
    }
  };

  const handleExportManifest = () => {
    if (!latestManifest) {
      setStatusText(
        "Inspect a fixture and make at least one edit before exporting a manifest."
      );
      return;
    }

    setManifestText(JSON.stringify(latestManifest, null, 2));
    setStatusText(
      `Exported ${latestManifest.transactions.length} transaction bundle as machine-readable JSON.`
    );
  };

  const handleSaveSession = async () => {
    if (!store || !latestRecord) {
      setStatusText("Create a live review artifact before saving.");
      return;
    }

    try {
      await store.save(latestRecord);
      setStatusText(`Saved ${latestRecord.name} locally.`);
    } catch {
      setStatusText("Failed to save the local session.");
    }
  };

  const handleRestoreLatest = async () => {
    try {
      if (!store) {
        setStatusText("Local session storage is still initializing.");
        return;
      }

      const latest = (await store.list())[0];

      if (!latest) {
        setStatusText("No saved local review session is available yet.");
        return;
      }

      await resetControllerHistory(controller);

      for (const transaction of latest.manifest.transactions) {
        await controller.apply(transaction);
      }

      reviewDraftCommands.hydrateReviewDraft(latest.reviewDraft);
      inspectAnchor(
        controller,
        latest.manifest.targets[0]?.anchor.selector ?? null
      );
      setManifestText(JSON.stringify(latest.manifest, null, 2));
      setStatusText(`Restored ${latest.name} from local session storage.`);
    } catch {
      setStatusText("Failed to restore the latest local session.");
    }
  };

  const handleReset = async () => {
    try {
      await resetControllerHistory(controller);

      setStatusText("Reverted the live preview back to the baseline fixture.");
    } catch {
      setStatusText("Failed to reset the live preview.");
    }
  };

  const reviewSummary =
    latestRecord && latestManifest
      ? renderReviewRouteSummary(
          createReviewRouteModel({
            route: latestRecord.route,
            sessionId: latestRecord.id,
            transactionCount: latestManifest.transactions.length,
            critiqueSummary: latestRecord.reviewArtifact.critiqueSummary,
            exploration: latestRecord.reviewArtifact.exploration,
            prompt: latestRecord.reviewArtifact.prompt,
          })
        )
      : "Select a fixture, run critique, and export a review route summary.";

  return (
    <section
      className="surface-panel"
      data-sightglass-chrome="true"
      style={liveHarnessStyle}
    >
      <span className="section-kicker">Dogfood harness</span>
      <div className="hero-columns">
        <div style={workbenchStyle}>
          <span style={statusChipStyle(session.active)}>
            {session.active ? "Live inspection armed" : "Inspection paused"}
          </span>
          <strong style={{ fontSize: 30, lineHeight: 1.1 }}>
            Edit the real fixture surface, export the manifest, and restore a
            saved review.
          </strong>
          <p
            style={{ margin: 0, color: "var(--sg-ink-muted)", lineHeight: 1.6 }}
          >
            The shared overlay handles selection, critique, explore mode, motion
            notes, and session review. This harness adds deterministic edit and
            restore controls so the release surface can be dogfooded every time.
          </p>

          <div style={buttonRowStyle}>
            <button
              data-testid="playground-apply-style"
              type="button"
              style={primaryButtonStyle}
              onClick={() =>
                void applySingleEdit(
                  "background-color",
                  "rgba(255, 238, 213, 0.96)",
                  "css",
                  "single",
                  "Applied a direct surface polish edit to the selected target."
                )
              }
            >
              Apply style edit
            </button>
            <button
              data-testid="playground-apply-token"
              type="button"
              style={buttonStyle}
              onClick={() =>
                void applySingleEdit(
                  "border-radius",
                  "var(--sg-radius-xl)",
                  "token",
                  "token",
                  "Applied a token-like radius edit to the selected target."
                )
              }
            >
              Apply token edit
            </button>
            <button
              data-testid="playground-export-manifest"
              type="button"
              style={buttonStyle}
              onClick={handleExportManifest}
            >
              Export manifest
            </button>
            <button
              data-testid="playground-save-session"
              type="button"
              style={buttonStyle}
              onClick={() => void handleSaveSession()}
            >
              Save local session
            </button>
            <button
              data-testid="playground-restore-session"
              type="button"
              style={buttonStyle}
              onClick={() => void handleRestoreLatest()}
            >
              Restore latest session
            </button>
            <button
              data-testid="playground-reset-history"
              type="button"
              style={buttonStyle}
              onClick={() => void handleReset()}
            >
              Reset preview
            </button>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <strong style={{ fontSize: 16 }}>Review draft controls</strong>
            <div style={buttonRowStyle}>
              <button
                data-testid="playground-scope-page"
                type="button"
                style={buttonStyle}
                onClick={() => reviewDraftCommands.setCritiqueScope("page")}
              >
                Set page scope
              </button>
              <button
                data-testid="playground-perspective-jakub"
                type="button"
                style={buttonStyle}
                onClick={() =>
                  reviewDraftCommands.setCritiquePerspective("jakub")
                }
              >
                Switch to jakub
              </button>
              {directions.slice(0, 3).map((direction) => (
                <button
                  key={direction.id}
                  data-testid={`playground-direction-${direction.id}`}
                  type="button"
                  style={buttonStyle}
                  onClick={() =>
                    reviewDraftCommands.setSelectedDirectionId(direction.id)
                  }
                >
                  {direction.title}
                </button>
              ))}
            </div>
            <span
              data-testid="playground-top-finding"
              style={{ color: "var(--sg-ink-muted)" }}
            >
              {critiqueReport?.findings[0]?.title ??
                "No critique findings yet."}
            </span>
            <span
              data-testid="playground-top-direction"
              style={{ color: "var(--sg-ink-muted)" }}
            >
              {activeDirection?.title ?? "No direction yet."}
            </span>
            <span
              data-testid="playground-motion-warning"
              style={{ color: "var(--sg-ink-muted)" }}
            >
              {motionStoryboard?.warnings[0] ?? "No motion warning."}
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <div className="metric-strip">
            <div className="metric-card rounded-lg">
              <span className="section-kicker">Selected target</span>
              <strong data-testid="playground-selected-target">
                {selectedAnchor?.selector ??
                  "Click a fixture while editing is active"}
              </strong>
            </div>
            <div className="metric-card rounded-lg">
              <span className="section-kicker">Applied states</span>
              <strong>{session.history.applied.length}</strong>
            </div>
            <div className="metric-card rounded-lg">
              <span className="section-kicker">Critique findings</span>
              <strong>{critiqueReport?.findings.length ?? 0}</strong>
            </div>
          </div>

          <pre data-testid="playground-review-summary" style={outputStyle}>
            {reviewSummary}
          </pre>
        </div>
      </div>

      <span
        data-testid="playground-status"
        style={{ color: "var(--sg-ink-muted)" }}
      >
        {statusText}
      </span>

      <textarea
        data-testid="playground-manifest-output"
        readOnly
        value={manifestText}
        style={outputStyle}
      />
    </section>
  );
};

export const App = () => {
  const controller = useMemo(
    () => createSightglassController({ document }),
    []
  );

  useEffect(() => {
    document.title = "Sightglass Playground";
    document.body.dataset.route = "/playground/landing";

    return () => {
      delete document.body.dataset.route;
    };
  }, []);

  return (
    <SightglassProvider controller={controller}>
      <style>{playgroundStyles}</style>
      <SelectionBridge />
      <main className="playground-shell">
        <section className="hero-shell">
          <span className="section-kicker">Sightglass v1</span>
          <div className="hero-columns">
            <div style={{ display: "grid", gap: 18 }}>
              <span className="eyebrow-chip">
                Live editing · critique · exploration · session review
              </span>
              <h1 className="section-title">
                Keep live editing, design-system scope, critique, and motion
                tuning on the surface itself.
              </h1>
              <p
                style={{
                  margin: 0,
                  color: "var(--sg-ink-muted)",
                  lineHeight: 1.7,
                  fontSize: 18,
                }}
              >
                This playground is intentionally busy: repeated cards,
                token-backed styles, peer actions, motion traps, empty states,
                and long-form content all live together so the real packages can
                be exercised before every release.
              </p>
            </div>

            <div
              className="surface-panel"
              data-sightglass-selectable="true"
              data-testid="fixture-thesis-card"
            >
              <span className="section-kicker">Product thesis</span>
              <strong style={{ fontSize: 24 }}>
                Sightglass is not a side-canvas tool and not a prompt toy.
              </strong>
              <span style={{ color: "var(--sg-ink-muted)", lineHeight: 1.6 }}>
                It edits the real interface, stays aware of design-system
                boundaries, critiques the live result, explores stronger
                directions, and stores review-ready artifacts locally.
              </span>
            </div>
          </div>
        </section>

        <LandingPageFixture />
        <LiveHarness controller={controller} />
        <TokensFixture />
        <CardsFixture />
        <FormsFixture />
        <MotionFixture />
        <ContentEdgeCasesFixture />
      </main>

      <div data-sightglass-chrome="true">
        <SelectionOverlay />
        <EditorPanel />
        <Toolbar />
      </div>
    </SightglassProvider>
  );
};
