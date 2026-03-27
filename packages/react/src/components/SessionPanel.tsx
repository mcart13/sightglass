import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  createEditOperation,
  createSessionTransaction,
  generateAnchor,
  type EditScope,
  type SelectionAnchor,
  type SessionTransaction,
  type SightglassSessionSnapshot,
} from "@sightglass/core";
import {
  buildExploreEditPlan,
  buildMotionStoryboard,
  createMotionTuningSchema,
  generateDesignDirections,
  runCritique,
} from "@sightglass/critique";
import {
  createChangeManifest,
  createReviewArtifact,
} from "@sightglass/export";
import {
  createIndexedDbSessionStore,
  createReviewDraftSnapshot,
  createSessionRecord,
  serializeHistorySnapshot,
  type SessionRecord,
  type SessionStore,
} from "@sightglass/session";
import {
  useSightglassReviewDraftCommands,
  useSightglassReviewDraftState,
} from "../use-sightglass";

interface SessionPanelProps {
  readonly session: Readonly<SightglassSessionSnapshot>;
}

const sectionStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  padding: 14,
  borderRadius: 18,
  background: "rgba(15, 23, 42, 0.04)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
};

const sectionLabelStyle: CSSProperties = {
  fontSize: 12,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#64748b",
};

const buttonStyle: CSSProperties = {
  border: "1px solid rgba(148, 163, 184, 0.22)",
  background: "rgba(255, 255, 255, 0.9)",
  color: "#0f172a",
  borderRadius: 999,
  padding: "6px 10px",
  cursor: "pointer",
};

const cardStyle: CSSProperties = {
  display: "grid",
  gap: 6,
  padding: 12,
  borderRadius: 14,
  background: "rgba(255, 255, 255, 0.9)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
};

const resolveTargetAnchor = (
  session: Readonly<SightglassSessionSnapshot>,
): SelectionAnchor | null => {
  const selectedAnchor = session.selection.best?.anchors[0] ?? null;

  if (selectedAnchor) {
    return selectedAnchor;
  }

  const appliedTarget = session.history.applied[0]?.target;
  return appliedTarget ? generateAnchor(appliedTarget) : null;
};

const buildRoute = (session: Readonly<SightglassSessionSnapshot>): string => {
  const selectedElement = session.selectedElement;

  if (selectedElement?.ownerDocument.body.dataset.route) {
    return selectedElement.ownerDocument.body.dataset.route;
  }

  if (typeof globalThis.location !== "undefined") {
    return globalThis.location.pathname;
  }

  return "/";
};

const buildTransactions = (
  session: Readonly<SightglassSessionSnapshot>,
  createdAt: string,
): readonly SessionTransaction[] => {
  if (session.history.applied.length === 0) {
    return Object.freeze([]);
  }

  const inferScope = (semanticKind: string): EditScope => {
    if (semanticKind === "token") {
      return "token";
    }

    if (semanticKind === "component") {
      return "component";
    }

    return "single";
  };

  return Object.freeze(
    session.history.applied.map((appliedState, index) =>
      createSessionTransaction({
        id: `session-transaction-${createdAt}-${index + 1}`,
        scope: inferScope(appliedState.semanticKind),
        targets: [generateAnchor(appliedState.target)],
        operations: [
          createEditOperation({
            id: `session-op-${index + 1}`,
            property: appliedState.property,
            before: appliedState.before,
            after: appliedState.after,
            semanticKind: appliedState.semanticKind,
          }),
        ],
        createdAt,
      }),
    ),
  );
};

const buildManifestTargets = (
  transactions: readonly SessionTransaction[],
  fallbackAnchor: SelectionAnchor | null,
) => {
  if (transactions.length === 0) {
    return fallbackAnchor
      ? Object.freeze([
          {
            anchor: fallbackAnchor,
            scope: "single" as const,
            semanticLabel: "Current selection",
          },
        ])
      : Object.freeze([]);
  }

  const seen = new Set<string>();
  const targets: Array<{
    anchor: SessionTransaction["targets"][number] | SelectionAnchor;
    scope: EditScope;
  }> = [];

  for (const transaction of transactions) {
    for (const transactionTarget of transaction.targets) {
      const key = `${transaction.scope}:${transactionTarget.runtimeId}:${transactionTarget.selector}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      targets.push({
        anchor: transactionTarget,
        scope: transaction.scope,
      });
    }
  }

  return Object.freeze(targets);
};

export const SessionPanel = ({ session }: SessionPanelProps) => {
  const reviewDraft = useSightglassReviewDraftState();
  const reviewDraftCommands = useSightglassReviewDraftCommands();
  const [store, setStore] = useState<SessionStore | null>(null);
  const [savedSessions, setSavedSessions] = useState<readonly SessionRecord[]>([]);
  const [sessionName, setSessionName] = useState("Current review");
  const [payloadText, setPayloadText] = useState("");
  const [statusText, setStatusText] = useState("Session storage initializes locally.");
  const [loadedRecord, setLoadedRecord] = useState<SessionRecord | null>(null);
  const [loadedRecordSignature, setLoadedRecordSignature] = useState<string | null>(null);

  const route = buildRoute(session);
  const selectedElement = session.selectedElement;
  const target = resolveTargetAnchor(session);
  const liveSessionSignature = useMemo(
    () =>
      JSON.stringify({
        selectedSelector: target?.selector ?? null,
        appliedCount: session.history.applied.length,
      }),
    [session.history.applied.length, target?.selector],
  );
  const critiqueReport = useMemo(() => {
    if (!selectedElement || !target) {
      return null;
    }

    return runCritique({
      document: selectedElement.ownerDocument,
      selectedElement,
      perspective: reviewDraft.critiquePerspective,
      scope: reviewDraft.critiqueScope,
      target,
    });
  }, [
    reviewDraft.critiquePerspective,
    reviewDraft.critiqueScope,
    selectedElement,
    target,
  ]);
  const directions = useMemo(
    () => (critiqueReport ? generateDesignDirections(critiqueReport) : Object.freeze([])),
    [critiqueReport],
  );
  const selectedDirection =
    directions.find((direction) => direction.id === reviewDraft.selectedDirectionId) ??
    directions[0] ??
    null;
  const motionStoryboard = useMemo(
    () => (critiqueReport ? buildMotionStoryboard(critiqueReport.context) : null),
    [critiqueReport],
  );
  const motionTuningSchema = useMemo(
    () => (critiqueReport ? createMotionTuningSchema(critiqueReport.context) : null),
    [critiqueReport],
  );
  const liveRecord = useMemo(() => {
    if (!target || !critiqueReport || !motionStoryboard || !motionTuningSchema) {
      return null;
    }

    const createdAt = new Date().toISOString();
    const transactions = buildTransactions(session, createdAt);
    const exploration =
      selectedDirection && critiqueReport
        ? [
            {
              directionId: selectedDirection.id,
              title: selectedDirection.title,
              proposedOperations:
                buildExploreEditPlan(selectedDirection, critiqueReport).proposedOperations,
            },
          ]
        : [];
    const manifest = createChangeManifest({
      route,
      sessionId: `session-${createdAt}`,
      targets: buildManifestTargets(transactions, target),
      transactions,
      critique: critiqueReport.findings,
      exploration,
      motionStoryboard,
    });

    return createSessionRecord({
      id: manifest.sessionId,
      name: sessionName,
      route,
      manifest,
      history: serializeHistorySnapshot(session.history),
      critiqueReport,
      directions,
      motionStoryboard,
      motionTuningSchema,
      reviewDraft: createReviewDraftSnapshot(reviewDraft),
      reviewArtifact: createReviewArtifact({ manifest }),
      createdAt,
      updatedAt: createdAt,
    });
  }, [
    critiqueReport,
    directions,
    motionStoryboard,
    motionTuningSchema,
    reviewDraft,
    route,
    selectedDirection,
    session,
    sessionName,
    target,
  ]);

  useEffect(() => {
    if (loadedRecordSignature && liveSessionSignature !== loadedRecordSignature) {
      setLoadedRecord(null);
      setLoadedRecordSignature(null);
    }
  }, [liveSessionSignature, loadedRecordSignature]);

  const record = loadedRecord ?? liveRecord;

  useEffect(() => {
    let cancelled = false;

    void createIndexedDbSessionStore().then(async (sessionStore) => {
      if (cancelled) {
        return;
      }

      setStore(sessionStore);
      setSavedSessions(await sessionStore.list());
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshSavedSessions = async (sessionStore = store) => {
    if (!sessionStore) {
      return;
    }

    setSavedSessions(await sessionStore.list());
  };

  const handleSave = async () => {
    if (!store || !record) {
      return;
    }

    await store.save(record);
    await refreshSavedSessions(store);
    setStatusText(`Saved ${record.name}.`);
  };

  const handleLoadLatest = async () => {
    if (!store) {
      return;
    }

    const latest = (await store.list())[0];

    if (!latest) {
      setStatusText("No saved sessions yet.");
      return;
    }

    setSessionName(latest.name);
    setPayloadText(JSON.stringify(latest, null, 2));
    reviewDraftCommands.hydrateReviewDraft(latest.reviewDraft);
    setLoadedRecord(latest);
    setLoadedRecordSignature(liveSessionSignature);
    setStatusText(`Loaded ${latest.name}.`);
  };

  const handleExport = async () => {
    if (!store || !record) {
      return;
    }

    await store.save(record);
    const payload = await store.exportSession(record.id);

    setPayloadText(payload);
    setStatusText(`Exported ${record.id} as .surface-session.json.`);
  };

  const handleImport = async () => {
    if (!store || !payloadText.trim()) {
      return;
    }

    try {
      const imported = await store.importSession(payloadText);
      await refreshSavedSessions(store);
      setSessionName(imported.name);
      setPayloadText(JSON.stringify(imported, null, 2));
      reviewDraftCommands.hydrateReviewDraft(imported.reviewDraft);
      setLoadedRecord(imported);
      setLoadedRecordSignature(liveSessionSignature);
      setStatusText(`Imported ${imported.name}.`);
    } catch (error) {
      setStatusText(
        error instanceof Error
          ? `Import failed: ${error.message}`
          : "Import failed: Unable to import the session payload.",
      );
    }
  };

  return (
    <section style={sectionStyle}>
      <span style={sectionLabelStyle}>Session review</span>
      <label style={{ display: "grid", gap: 6 }}>
        <strong>Session name</strong>
        <input
          data-session-name
          type="text"
          value={sessionName}
          onChange={(event) => setSessionName(event.currentTarget.value)}
        />
      </label>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button data-session-save type="button" style={buttonStyle} onClick={() => void handleSave()}>
          Save session
        </button>
        <button data-session-load-latest type="button" style={buttonStyle} onClick={() => void handleLoadLatest()}>
          Load latest
        </button>
        <button data-session-export type="button" style={buttonStyle} onClick={() => void handleExport()}>
          Export .surface-session.json
        </button>
        <button data-session-import type="button" style={buttonStyle} onClick={() => void handleImport()}>
          Import session
        </button>
      </div>

      <span style={{ color: "#475569", fontSize: 13 }}>{statusText}</span>

      <div style={{ display: "grid", gap: 8 }}>
        <strong>Saved sessions</strong>
        {savedSessions.length === 0 ? (
          <span style={{ color: "#475569", fontSize: 13 }}>
            No saved sessions yet.
          </span>
        ) : (
          savedSessions.map((savedSession) => (
            <div key={savedSession.id} data-saved-session={savedSession.id} style={cardStyle}>
              <strong>{savedSession.name}</strong>
              <span style={{ color: "#475569", fontSize: 13 }}>
                {savedSession.route} · {savedSession.reviewArtifact.transactionCount} transactions
              </span>
            </div>
          ))
        )}
      </div>

      <label style={{ display: "grid", gap: 6 }}>
        <strong>Session payload</strong>
        <textarea
          data-session-payload
          rows={8}
          value={payloadText}
          onChange={(event) => setPayloadText(event.currentTarget.value)}
        />
      </label>

      {record ? (
        <div data-session-review-artifact style={cardStyle}>
          <strong>{record.reviewArtifact.route}</strong>
          <span style={{ color: "#475569", fontSize: 13 }}>
            {record.reviewArtifact.critiqueSummary.totalFindings} findings ·{" "}
            {record.reviewArtifact.exploration.directionCount} directions
          </span>
          <span style={{ color: "#334155", fontSize: 13 }}>
            {record.reviewArtifact.prompt}
          </span>
        </div>
      ) : (
        <span style={{ color: "#475569", fontSize: 13 }}>
          Inspect a live target or load a saved session to generate a session artifact preview.
        </span>
      )}
    </section>
  );
};
