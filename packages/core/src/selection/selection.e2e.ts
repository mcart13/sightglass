import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const coreRoot = fileURLToPath(new URL("../../", import.meta.url));
const distRoot = join(coreRoot, "dist");

const fixtureHtml = `
  <!doctype html>
  <html>
    <body>
      <main>
        <section class="grid">
          <article class="card token-surface Card_card__abc123" data-testid="card-1">
            <button class="primary-button Button_root__9x8y7">
              <span data-testid="button-label">Inspect</span>
            </button>
          </article>
          <article class="card token-surface Card_card__def456" data-testid="card-2">
            <button class="primary-button Button_root__1a2b3">Inspect</button>
          </article>
          <article class="card token-surface Card_card__ghi789" data-testid="card-3">
            <button class="primary-button Button_root__4c5d6">Inspect</button>
          </article>
        </section>
        <script type="module">
          import { identifySelection } from "/dist/selection/identify.js";
          window.__identifySelection = (point) => identifySelection(document, point);
        </script>
      </main>
    </body>
  </html>
`;

test("detects the best element and similar repeated cards in-browser", async ({ page }) => {
  const server = createServer(async (request, response) => {
    if (!request.url || request.url === "/" || request.url === "/fixture") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(fixtureHtml);
      return;
    }

    if (request.url.startsWith("/dist/")) {
      const filePath = normalize(join(coreRoot, request.url));

      if (!filePath.startsWith(distRoot)) {
        response.writeHead(403);
        response.end("forbidden");
        return;
      }

      try {
        const file = await readFile(filePath, "utf8");
        response.writeHead(200, { "content-type": "text/javascript; charset=utf-8" });
        response.end(file);
      } catch {
        response.writeHead(404);
        response.end("not found");
      }

      return;
    }

    response.writeHead(404);
    response.end("not found");
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Failed to start selection fixture server");
  }

  try {
    await page.goto(`http://127.0.0.1:${address.port}/fixture`);
    await page.waitForFunction(() => typeof window.__identifySelection === "function");

    const button = page.getByRole("button", { name: "Inspect" }).first();
    const box = await button.boundingBox();
    expect(box).not.toBeNull();

    const result = await page.evaluate(
      ({ x, y }) => window.__identifySelection({ x, y }),
      {
        x: box!.x + box!.width / 2,
        y: box!.y + box!.height / 2,
      },
    );
    const primaryAnchorMatches = await page.evaluate(
      (selector) => document.querySelectorAll(selector).length,
      result.best!.anchors[0]!.selector,
    );

    expect(result.best?.anchors[0].path.toLowerCase()).toContain("button");
    expect(result.best?.anchors[0].selector).not.toContain("Button_root__9x8y7");
    expect(result.best?.anchors[0].selector).toContain("article:nth-of-type(1)");
    expect(primaryAnchorMatches).toBe(1);
    expect(result.similar).toHaveLength(2);
    expect(result.similar.every((match) => match.confidence > 0.5)).toBe(true);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

declare global {
  interface Window {
    __identifySelection: (point: { x: number; y: number }) => {
      best: { anchors: Array<{ path: string; selector: string }>; confidence: number } | null;
      similar: Array<{ anchors: Array<{ selector: string }>; confidence: number }>;
    };
  }
}
