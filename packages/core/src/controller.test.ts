import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import {
  createSessionTransaction,
  createSightglassController,
  createTargetAnchor,
} from "./index";

describe("controller target resolution", () => {
  it("skips malformed selectors and still applies valid anchors", async () => {
    const dom = new JSDOM(`
      <!doctype html>
      <html>
        <body>
          <button data-good-target style="color: black;">Apply</button>
        </body>
      </html>
    `);
    const document = dom.window.document;
    const target = document.querySelector("[data-good-target]") as HTMLButtonElement;
    const controller = createSightglassController({ document });

    const snapshot = await controller.apply(
      createSessionTransaction({
        id: "controller-malformed-selector",
        scope: "single",
        targets: [
          createTargetAnchor({
            runtimeId: "bad-selector",
            selector: "button[role=]",
            path: "body > button:nth-of-type(1)",
            role: null,
            classes: [],
          }),
          createTargetAnchor({
            runtimeId: "good-selector",
            selector: "[data-good-target]",
            path: "body > button:nth-of-type(1)",
            role: null,
            classes: [],
          }),
        ],
        operations: [
          {
            id: "op-color",
            property: "color",
            before: "black",
            after: "purple",
            semanticKind: "css",
          },
        ],
        createdAt: "2026-03-26T21:30:00.000Z",
      }),
    );

    expect(target.style.getPropertyValue("color")).toBe("purple");
    expect(snapshot.applied).toHaveLength(1);
    expect(snapshot.applied[0]).toEqual(
      expect.objectContaining({
        target,
        property: "color",
        after: "purple",
      }),
    );
  });
});
