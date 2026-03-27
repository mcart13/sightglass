import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import * as core from "../index";

const createDocument = (body: string) => {
  const dom = new JSDOM(`<!doctype html><html><body>${body}</body></html>`);
  return dom.window.document;
};

describe("semantic analysis", () => {
  it("detects token-backed values and utility-style groupings", () => {
    const document = createDocument(`
      <main style="--button-radius: 18px;">
        <button
          data-selected
          class="cta rounded-lg bg-slate-900 px-4 py-2"
          style="border-radius: var(--button-radius); color: rgb(15, 23, 42);"
        >
          Launch
        </button>
        <button
          class="cta rounded-lg bg-slate-900 px-4 py-2"
          style="border-radius: 18px; color: rgb(15, 23, 42);"
        >
          Compare
        </button>
      </main>
    `);
    const selected = document.querySelector("[data-selected]") as Element;
    const similar = document.querySelectorAll("button")[1] as Element;

    const candidates = core.detectTokenCandidates(selected, {
      similarElements: [similar],
    });
    const labels = candidates.map((candidate) => candidate.label);

    expect(labels).toContain("Update token --button-radius");
    expect(labels).toContain("Update radius utilities");
    expect(labels).toContain("Update shared color");
  });

  it("detects repeated component signatures from similar matches", () => {
    const document = createDocument(`
      <section>
        <button data-selected class="card-action rounded-lg">
          <span>Primary</span>
        </button>
        <button class="card-action rounded-lg">
          <span>Secondary</span>
        </button>
        <button class="rounded-lg">
          Secondary
        </button>
      </section>
    `);
    const selected = document.querySelector("[data-selected]") as Element;
    const similar = [document.querySelectorAll("button")[1] as Element];

    const component = core.detectComponentMatch(selected, {
      similarElements: similar,
    });

    expect(component).not.toBeNull();
    expect(component?.matchCount).toBe(2);
    expect(component?.label).toContain("card-action");
  });

  it("returns scope options for single, similar, component, token, and sibling edits", () => {
    const document = createDocument(`
      <main style="--button-radius: 18px;">
        <div>
          <button
            data-selected
            class="card-action rounded-lg"
            style="border-radius: var(--button-radius); color: rgb(15, 23, 42);"
          >
            <span>Primary</span>
          </button>
          <button
            data-similar
            class="card-action rounded-lg"
            style="border-radius: var(--button-radius); color: rgb(15, 23, 42);"
          >
            <span>Secondary</span>
          </button>
        </div>
      </main>
    `);
    const selected = document.querySelector("[data-selected]") as Element;
    const similar = [document.querySelector("[data-similar]") as Element];

    const analysis = core.analyzeSemanticContext({
      element: selected,
      similarElements: similar,
    });
    const scopes = analysis.scopes.map((option) => option.scope);

    expect(scopes).toEqual(["single", "siblings", "similar", "component", "token"]);
    expect(analysis.scopes[4]?.label).toBe("Update token --button-radius");
  });
});
