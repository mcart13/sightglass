import { expect, test } from "@playwright/test";

test("applies edits, exports a manifest, and restores the saved session", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Start editing" }).click();
  await page.getByTestId("fixture-card-primary").click();

  await expect(page.getByTestId("playground-selected-target")).toContainText(
    "fixture-card-primary",
  );

  const selectedCard = page.getByTestId("fixture-card-primary");

  await page.getByTestId("playground-apply-style").click();
  await expect(selectedCard).toHaveCSS(
    "background-color",
    "rgba(255, 238, 213, 0.96)",
  );

  await page.getByTestId("playground-apply-token").click();
  await expect(selectedCard).toHaveAttribute(
    "style",
    /border-radius:\s*var\(--sg-radius-xl\)/,
  );

  await page.getByTestId("playground-export-manifest").click();
  await expect(page.getByTestId("playground-manifest-output")).toContainText(
    "\"transactions\"",
  );
  await expect(page.getByTestId("playground-manifest-output")).toContainText(
    "\"semanticKind\": \"token\"",
  );

  await page.getByTestId("playground-save-session").click();
  await page.getByTestId("playground-reset-history").click();
  await expect(selectedCard).not.toHaveCSS(
    "background-color",
    "rgba(255, 238, 213, 0.96)",
  );

  await page.getByTestId("playground-restore-session").click();
  await expect(selectedCard).toHaveCSS(
    "background-color",
    "rgba(255, 238, 213, 0.96)",
  );
  await expect(page.getByTestId("playground-status")).toContainText("Restored");
});
