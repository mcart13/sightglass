import { JSDOM } from "jsdom";
import { describe, expect, it, vi } from "vitest";
import * as core from "../index";

const createDocument = (body: string) => {
  const dom = new JSDOM(`<!doctype html><html><body>${body}</body></html>`);
  return dom.window.document;
};

describe("selection heuristics", () => {
  it("prefers an interactive ancestor from elementFromPoint", () => {
    const document = createDocument(`
      <button id="primary-action" class="cta Button_root__9x8y7">
        <span data-hit="label">Launch</span>
      </button>
    `);
    const hit = document.querySelector("[data-hit='label']") as Element;
    document.elementFromPoint = vi.fn(() => hit) as unknown as typeof document.elementFromPoint;

    const match = core.findBestElement(document, { x: 8, y: 12 });

    expect(match?.anchors[0].path).toContain("button");
    expect(match?.anchors[0].selector).not.toContain("Button_root__9x8y7");
    expect(match?.confidence).toBeGreaterThan(0.8);
  });

  it("groups similar elements by class overlap and rejects nested matches", () => {
    const document = createDocument(`
      <section>
        <article class="card token-surface Card_card__a1b2c" data-hit="selected">
          <button class="card token-surface nested-action">Open</button>
        </article>
        <article class="card token-surface Card_card__d4e5f">Second</article>
        <article class="card token-surface Card_card__g6h7i">Third</article>
      </section>
    `);
    const selected = document.querySelector("[data-hit='selected']") as Element;

    const matches = core.findSimilarElements(document, selected);
    const selectors = matches.map((match) => match.anchors[0].selector);

    expect(matches).toHaveLength(2);
    expect(matches.every((match) => match.confidence > 0.5)).toBe(true);
    expect(selectors.some((selector) => selector.includes(".nested-action"))).toBe(
      false,
    );
  });

  it("generates stable anchors when class names are hashed", () => {
    const document = createDocument(`
      <div class="Card_card__abc123 Button_root__def456" data-testid="stable-card">
        Hashed classes only
      </div>
    `);
    const element = document.querySelector("[data-testid='stable-card']") as Element;

    const anchor = core.generateAnchor(element);

    expect(anchor.runtimeId).toContain("stable-card");
    expect(anchor.selector).toBe("[data-testid=\"stable-card\"]");
    expect(anchor.selector).not.toContain("Card_card__abc123");
    expect(anchor.alternates.length).toBeGreaterThan(1);
  });
});
