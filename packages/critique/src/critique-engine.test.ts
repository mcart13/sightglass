import { JSDOM } from "jsdom";
import { createTargetAnchor } from "@sightglass/core";
import { describe, expect, it } from "vitest";
import {
  CRITIQUE_CATEGORIES,
  runCritique,
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
    expect(report.findings[0]?.severity).toBe("important");
    expect(report.groupedFindings["motion-performance"]?.length).toBeGreaterThan(0);
    expect(report.groupedFindings["visual-design"]?.length).toBeGreaterThan(0);
    expect(Object.keys(report.groupedFindings)).toEqual(
      expect.arrayContaining([...CRITIQUE_CATEGORIES]),
    );
  });

  it("reweights findings by perspective and context", () => {
    const emilReport = runFixtureCritique("page", "emil");
    const jheyReport = runFixtureCritique("page", "jhey");

    expect(emilReport.findings[0]?.category).toBe("accessibility");
    expect(jheyReport.findings[0]?.category).toBe("motion-performance");
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
});
