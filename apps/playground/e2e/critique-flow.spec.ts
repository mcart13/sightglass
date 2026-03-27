import { expect, test } from "@playwright/test";

test("runs critique, picks a direction, and exposes motion guidance", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Start editing" }).click();
  await page.getByTestId("fixture-motion-bad").click();

  await expect(page.getByTestId("playground-selected-target")).toContainText(
    "fixture-motion-bad",
  );
  await page.getByTestId("playground-scope-page").click();
  await page.getByTestId("playground-perspective-jakub").click();
  await expect(page.getByTestId("playground-top-finding")).not.toHaveText(
    "No critique findings yet.",
  );
  await expect(page.getByTestId("playground-motion-warning")).not.toHaveText(
    "No motion warning.",
  );
  await page.getByTestId("playground-direction-playful").click();
  await expect(page.getByTestId("playground-top-direction")).toContainText(
    "More playful",
  );
  await expect(page.getByTestId("playground-review-summary")).toContainText(
    "More playful",
  );
});
