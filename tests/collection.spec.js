const { test, expect } = require("@playwright/test");

test("a binder with zero cards still renders in Collection", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");
  await page.locator('[data-tab="collection"]').click();

  // Regression test: the shelf used to bail out to "No cards match your
  // current filters" for every binder whenever the total card count was 0,
  // hiding cover/page-art/scene-panel customization entirely for new users.
  await expect(page.locator(".binder-block")).toHaveCount(1);
  await expect(page.locator("text=No binders yet.")).toHaveCount(0);

  expect(errors).toEqual([]);
});
