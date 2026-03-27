// @vitest-environment jsdom

import {
  createTargetAnchor,
  createSessionTransaction,
  generateAnchor,
  type MutationEngineSnapshot,
  type SelectionAnchor,
} from "@sightglass/core";
import { describe, expect, it } from "vitest";
import {
  buildChangeManifestTargets,
  buildSessionTransactionsFromHistory,
} from "./session-helpers.js";

const createDocument = () => {
  document.body.innerHTML = `
    <main>
      <section>
        <button data-testid="primary-action" class="cta">Start</button>
      </section>
    </main>
  `;

  return document;
};

const createHistory = (semanticKind: "css" | "token" | "component"): MutationEngineSnapshot => {
  const document = createDocument();
  const target = document.querySelector("[data-testid='primary-action']");

  if (!(target instanceof document.defaultView!.Element)) {
    throw new Error("Expected fixture target.");
  }

  return {
    applied: [
      {
        target,
        property: "color",
        semanticKind,
        before: "#111111",
        beforeInline: "#111111",
        beforeComputed: "rgb(17, 17, 17)",
        after: "#ffffff",
      },
    ],
    canUndo: true,
    canRedo: false,
  };
};

describe("session helpers", () => {
  it("builds session transactions directly from mutation history", () => {
    const transactions = buildSessionTransactionsFromHistory(
      createHistory("component"),
      "2026-03-27T10:00:00.000Z",
    );

    expect(transactions).toHaveLength(1);
    expect(transactions[0]).toMatchObject({
      id: "session-transaction-2026-03-27T10:00:00.000Z-1",
      scope: "component",
      createdAt: "2026-03-27T10:00:00.000Z",
    });
    expect(transactions[0]?.operations[0]).toMatchObject({
      id: "session-op-1",
      property: "color",
      before: "#111111",
      after: "#ffffff",
      semanticKind: "component",
    });
    expect(transactions[0]?.targets[0]?.selector).toBe("[data-testid=\"primary-action\"]");
  });

  it("falls back to the current selection when there are no transactions", () => {
    const document = createDocument();
    const target = document.querySelector("[data-testid='primary-action']");

    if (!(target instanceof document.defaultView!.Element)) {
      throw new Error("Expected fallback target.");
    }

    const fallbackAnchor: SelectionAnchor = {
      ...generateAnchor(target),
      confidence: 1,
      alternates: Object.freeze([]),
    };

    expect(
      buildChangeManifestTargets([], fallbackAnchor, "Current playground target"),
    ).toEqual([
      {
        anchor: fallbackAnchor,
        scope: "single",
        semanticLabel: "Current playground target",
      },
    ]);
  });

  it("deduplicates manifest targets across repeated transaction targets", () => {
    const document = createDocument();
    const target = document.querySelector("[data-testid='primary-action']");

    if (!(target instanceof document.defaultView!.Element)) {
      throw new Error("Expected duplicate target.");
    }

    const anchor = generateAnchor(target);
    const transactions = [
      createSessionTransaction({
        id: "session-1",
        scope: "single",
        targets: [anchor],
        operations: [],
        createdAt: "2026-03-27T10:00:00.000Z",
      }),
      createSessionTransaction({
        id: "session-2",
        scope: "single",
        targets: [anchor],
        operations: [],
        createdAt: "2026-03-27T10:01:00.000Z",
      }),
    ] as const;

    expect(buildChangeManifestTargets(transactions, null)).toEqual([
      {
        anchor: {
          runtimeId: anchor.runtimeId,
          selector: anchor.selector,
          path: anchor.path,
          role: anchor.role,
          classes: anchor.classes,
        },
        scope: "single",
      },
    ]);
  });
});
