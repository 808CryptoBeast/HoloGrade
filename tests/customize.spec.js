const { test, expect } = require("@playwright/test");
const { makeFakeCardImageBuffer } = require("./helpers");

test("bulk-adding a scene panel from a file shows it in Customize and in the live binder", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");
  await page.locator('[data-tab="customize"]').click();

  // The Add Panel buttons must be reachable without excessive scrolling.
  const addPanelBox = await page.locator('[data-action="add-panel"]').first().boundingBox();
  expect(addPanelBox).not.toBeNull();
  expect(addPanelBox.y).toBeLessThan(1200);

  const bulkInput = page.locator('input[data-action="panel-bulk-add"]');
  await expect(bulkInput).toHaveAttribute("accept", "image/*,video/*");
  await expect(bulkInput).toHaveAttribute("multiple", "");

  const buffer = await makeFakeCardImageBuffer(page);
  await bulkInput.setInputFiles({ name: "panel.jpg", mimeType: "image/jpeg", buffer });

  await expect(page.locator(".panel-config-card")).toHaveCount(1);

  // The same panel should show up on the live binder page in Collection.
  await page.locator('[data-tab="collection"]').click();
  await expect(page.locator(".page-scene-panel")).toHaveCount(1);

  expect(errors).toEqual([]);
});
