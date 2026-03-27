import { JSDOM } from "jsdom";
import { createTargetAnchor } from "@sightglass/core";
import { describe, expect, it } from "vitest";
import {
  CRITIQUE_CATEGORIES,
  resolveCritiqueScopeElement,
  runCritique,
  runScopedCritique,
  type CritiqueScope,
} from "./index.js";

const createDocument = (body: string) => {
  const dom = new JSDOM(`<!doctype html><html><body>${body}</body></html>`, {
    url: "https://sightglass.local/playground",
  });

  return dom.window.document;
};

const createAnchor = () =>
  createTargetAnchor({
    runtimeId: "button:selected-target",
    selector: "[data-testid='selected-target']",
    path: "main > section:nth-of-type(1) > button:nth-of-type(1)",
    role: "button",
    classes: ["cta", "card-action"],
  });

const runFixtureCritique = (
  scope: CritiqueScope,
  perspective: "emil" | "jakub" | "jhey",
) => {
  const document = createDocument(`
    <main data-route="/playground/landing">
      <section data-testid="hero-section" class="card-grid">
        <div class="card"><button class="cta card-action">Start</button></div>
        <div class="card"><button data-testid="selected-target" class="cta card-action" style="transition: all 420ms ease; transform: translateY(0);">Try it</button></div>
        <div class="card"><button class="cta card-action">Compare</button></div>
      </section>
    </main>
  `);
  const selectedElement = document.querySelector(
    "[data-testid='selected-target']",
  ) as Element;

  return runCritique({
    document,
    selectedElement,
    scope,
    perspective,
    target: createAnchor(),
  });
};

describe("critique engine", () => {
  it("groups critique by category and orders findings by severity", () => {
    const report = runFixtureCritique("page", "emil");

    expect(report.scope).toBe("page");
    expect(report.findings.length).toBeGreaterThan(2);
    expect(["critical", "important"]).toContain(report.findings[0]?.severity);
    expect(report.groupedFindings["motion-performance"]?.length).toBeGreaterThan(0);
    expect(report.groupedFindings["visual-design"]?.length).toBeGreaterThan(0);
    expect(Object.keys(report.groupedFindings)).toEqual(
      expect.arrayContaining([...CRITIQUE_CATEGORIES]),
    );
  });

  it("reads computed motion styles and escaped utility classes", () => {
    const document = createDocument(`
      <style>
        .hover\\:bg-brand {
          transition-property: opacity, width;
          transition-duration: 120ms, 480ms;
        }
      </style>
      <main data-route="/playground/landing">
        <section data-testid="hero-section" class="card-grid">
          <div class="card"><button class="cta card-action hover:bg-brand">Start</button></div>
          <div class="card"><button data-testid="selected-target" class="cta card-action hover:bg-brand">Try it</button></div>
          <div class="card"><button class="cta card-action hover:bg-brand">Compare</button></div>
        </section>
      </main>
    `);
    const selectedElement = document.querySelector(
      "[data-testid='selected-target']",
    ) as Element;

    const report = runCritique({
      document,
      selectedElement,
      scope: "page",
      perspective: "emil",
      target: createAnchor(),
    });

    expect(report.context.motionSignals.durationMs).toBe(480);
    expect(report.context.motionSignals.layoutAffectingProperties).toContain("width");
    expect(report.context.matchingActionCount).toBe(3);
  });

  it("reweights findings by perspective and context", () => {
    const emilReport = runFixtureCritique("page", "emil");
    const jheyReport = runFixtureCritique("page", "jhey");

    expect(emilReport.findings[0]?.id).toBeTruthy();
    expect(jheyReport.findings[0]?.id).toBeTruthy();
    expect(emilReport.findings[0]?.category).not.toBe(
      jheyReport.findings[0]?.category,
    );
  });

  it("keeps findings scope-aware for node, section, and page critiques", () => {
    const nodeReport = runFixtureCritique("node", "jakub");
    const sectionReport = runFixtureCritique("section", "jakub");
    const pageReport = runFixtureCritique("page", "jakub");

    expect(nodeReport.scope).toBe("node");
    expect(sectionReport.scope).toBe("section");
    expect(pageReport.scope).toBe("page");
    expect(nodeReport.context.scopeLabel).toBe("Selected element");
    expect(sectionReport.context.scopeLabel).toBe("Containing section");
    expect(pageReport.context.scopeLabel).toBe("Entire page");
    expect(
      nodeReport.findings.every(
        (finding) => finding.target.selector === "[data-testid='selected-target']",
      ),
    ).toBe(true);
  });

  it("does not crash when the selected element has no class names", () => {
    const document = createDocument(`
      <main data-route="/playground/landing">
        <section>
          <article data-testid="selected-target" style="transition: all 420ms ease;">
            Classless target
          </article>
        </section>
      </main>
    `);
    const selectedElement = document.querySelector(
      "[data-testid='selected-target']",
    ) as Element;
    const target = createTargetAnchor({
      runtimeId: "article:selected-target",
      selector: "[data-testid='selected-target']",
      path: "main > section:nth-of-type(1) > article:nth-of-type(1)",
      role: null,
      classes: [],
    });

    const report = runCritique({
      document,
      selectedElement,
      scope: "page",
      perspective: "jakub",
      target,
    });

    expect(report.context.matchingActionCount).toBe(0);
    expect(report.findings.length).toBeGreaterThan(0);
  });

  it("resolves the correct element for node, section, and page scopes", () => {
    const document = createDocument(`
      <main>
        <section data-testid="section">
          <div>
            <button data-testid="selected-target">Try it</button>
          </div>
        </section>
      </main>
    `);
    const selectedElement = document.querySelector(
      "[data-testid='selected-target']",
    ) as Element;

    expect(
      resolveCritiqueScopeElement(document, selectedElement, "node"),
    ).toBe(selectedElement);
    expect(resolveCritiqueScopeElement(document, selectedElement, "section")).toBe(
      document.querySelector("[data-testid='section']"),
    );
    expect(resolveCritiqueScopeElement(document, selectedElement, "page")).toBe(
      document.body,
    );
  });

  it("returns null when scoped critique cannot run yet", () => {
    expect(
      runScopedCritique({
        selectedElement: null,
        perspective: "emil",
        scope: "page",
        target: createAnchor(),
      }),
    ).toBeNull();
  });
});
