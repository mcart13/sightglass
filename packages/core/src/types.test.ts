import { describe, expect, it, expectTypeOf } from "vitest";
import {
  EDIT_SCOPES,
  assertSessionTransaction,
  createEditOperation,
  createSessionTransaction,
  createTargetAnchor,
  isSessionTransaction,
} from "./index";
import type {
  EditOperation,
  EditScope,
  SessionTransaction,
  TargetAnchor,
} from "./types";

describe("core model types", () => {
  it("exposes the expected edit scopes", () => {
    expect(EDIT_SCOPES).toEqual([
      "single",
      "siblings",
      "similar",
      "component",
      "token",
    ]);

    expectTypeOf<EditScope>().toEqualTypeOf<
      "single" | "siblings" | "similar" | "component" | "token"
    >();
  });

  it("creates immutable anchors and operations", () => {
    const anchor = createTargetAnchor({
      runtimeId: "node-1",
      selector: "[data-node='1']",
      path: "Page/Header/Button",
      role: "button",
      classes: ["cta", "primary"],
    });

    const operation = createEditOperation({
      id: "op-1",
      property: "color",
      before: "#000000",
      after: "#ffffff",
      semanticKind: "css",
    });

    expect(anchor).toEqual({
      runtimeId: "node-1",
      selector: "[data-node='1']",
      path: "Page/Header/Button",
      role: "button",
      classes: ["cta", "primary"],
    });
    expect(operation.semanticKind).toBe("css");
    expect(Object.isFrozen(anchor)).toBe(true);
    expect(Object.isFrozen(anchor.classes)).toBe(true);
    expect(Object.isFrozen(operation)).toBe(true);

    expectTypeOf(anchor).toEqualTypeOf<TargetAnchor>();
    expectTypeOf(operation).toEqualTypeOf<EditOperation>();
  });

  it("creates immutable session transactions", () => {
    const transaction = createSessionTransaction({
      id: "txn-1",
      scope: "component",
      targets: [
        createTargetAnchor({
          runtimeId: "node-2",
          selector: ".card",
          path: "Page/Grid/Card",
          role: null,
          classes: ["card"],
        }),
      ],
      operations: [
        createEditOperation({
          id: "op-2",
          property: "padding",
          before: "8px",
          after: "12px",
          semanticKind: "layout",
        }),
      ],
      createdAt: "2026-03-26T18:30:00.000Z",
    });

    expect(transaction.scope).toBe("component");
    expect(Object.isFrozen(transaction)).toBe(true);
    expect(Object.isFrozen(transaction.targets)).toBe(true);
    expect(Object.isFrozen(transaction.operations)).toBe(true);

    expectTypeOf(transaction).toEqualTypeOf<SessionTransaction>();
  });
});

describe("session transaction guards", () => {
  it("accepts well-formed transaction payloads", () => {
    const payload = {
      id: "txn-2",
      scope: "single",
      targets: [
        {
          runtimeId: "node-3",
          selector: "#hero",
          path: "Page/Hero",
          role: "region",
          classes: ["hero"],
        },
      ],
      operations: [
        {
          id: "op-3",
          property: "textContent",
          before: "Before",
          after: "After",
          semanticKind: "text",
        },
      ],
      createdAt: "2026-03-26T18:31:00.000Z",
    };

    expect(isSessionTransaction(payload)).toBe(true);
    expect(assertSessionTransaction(payload)).toEqual(payload);
  });

  it("accepts valid ISO-8601 timestamps with timezone offsets", () => {
    const payload = {
      id: "txn-2b",
      scope: "single",
      targets: [
        {
          runtimeId: "node-3b",
          selector: "#hero",
          path: "Page/Hero",
          role: "region",
          classes: ["hero"],
        },
      ],
      operations: [
        {
          id: "op-3b",
          property: "textContent",
          before: "Before",
          after: "After",
          semanticKind: "text",
        },
      ],
      createdAt: "2026-03-26T18:31:00+05:30",
    };

    expect(isSessionTransaction(payload)).toBe(true);
  });

  it("rejects malformed transaction payloads", () => {
    expect(
      isSessionTransaction({
        id: "txn-3",
        scope: "invalid",
        targets: [],
        operations: [],
        createdAt: "not-a-date",
      }),
    ).toBe(false);

    expect(() =>
      assertSessionTransaction({
        id: "txn-4",
        scope: "token",
        targets: [
          {
            runtimeId: "node-4",
            selector: ".token",
            path: "Theme/Color",
            role: null,
            classes: "not-an-array",
          },
        ],
        operations: [],
        createdAt: "2026-03-26T18:32:00.000Z",
      }),
    ).toThrow(/session transaction/i);
  });
});
