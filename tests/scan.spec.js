const { test, expect } = require("@playwright/test");
const { makeFakeCardImageBuffer } = require("./helpers");

test("upload a photo and analyze it", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");
  await page.locator('[data-tab="scan"]').click();

  // Scan is photo-only: the upload input must not accept video.
  await expect(page.locator("#uploadInput")).toHaveAttribute("accept", "image/*");

  const buffer = await makeFakeCardImageBuffer(page);
  await page.locator("#uploadInput").setInputFiles({
    name: "card.jpg",
    mimeType: "image/jpeg",
    buffer,
  });
  await expect(page.locator("#previewWrap")).toBeVisible();

  await page.locator("#analyzeBtn").click();
  await page.waitForFunction(
    () => document.getElementById("scanStatus")?.textContent?.startsWith("Analysis complete"),
    { timeout: 40000 },
  );

  await expect(page.locator("#resultPanel")).toBeVisible();
  await expect(page.locator("#resultGrade")).not.toHaveText("-");

  expect(errors).toEqual([]);
});
