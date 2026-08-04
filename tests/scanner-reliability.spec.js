const { test, expect } = require("@playwright/test");
const { makeFakeCardImageBuffer } = require("./helpers");

test("manual search returns a result without needing a photo", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");
  await page.locator('[data-tab="scan"]').click();

  await page.locator(".manual-search summary").click();
  await page.locator("#manualSearchName").fill("Pikachu");
  await page.locator("#manualSearchNumber").fill("58/102");
  await page.locator("#manualSearchBtn").click();

  await page.waitForFunction(
    () => {
      const el = document.getElementById("scanStatus");
      return el && el.textContent && (el.textContent.startsWith("Found") || el.textContent.includes("No confident match"));
    },
    { timeout: 20000 },
  );

  await expect(page.locator("#resultPanel")).toBeVisible();
  expect(errors).toEqual([]);
});

test("Analyze button is disabled while a request is in flight (no concurrent analyze)", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");
  await page.locator('[data-tab="scan"]').click();

  const buffer = await makeFakeCardImageBuffer(page);
  await page.locator("#uploadInput").setInputFiles({ name: "card.jpg", mimeType: "image/jpeg", buffer });
  await expect(page.locator("#previewWrap")).toBeVisible();

  await page.locator("#analyzeBtn").click();
  // Immediately after the first click, the button should be disabled so a
  // second click can't fire a concurrent analyze request.
  await expect(page.locator("#analyzeBtn")).toBeDisabled();

  await page.waitForFunction(
    () => document.getElementById("scanStatus")?.textContent?.startsWith("Analysis complete"),
    { timeout: 40000 },
  );
  await expect(page.locator("#analyzeBtn")).toBeEnabled();

  expect(errors).toEqual([]);
});

test("camera falls back to plainer constraints when the ideal ones are rejected", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));

  // Stub getUserMedia: reject constraint objects that include `advanced` or a
  // specific facingMode+resolution combo, succeed on the bare `{video:true}`
  // fallback — mirrors a device rejecting the app's ideal constraints.
  await page.addInitScript(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 240;
    const fakeStream = canvas.captureStream ? canvas.captureStream(5) : null;

    navigator.mediaDevices.getUserMedia = async (constraints) => {
      const wantsAdvanced = constraints?.video && typeof constraints.video === "object" && "advanced" in constraints.video;
      const wantsFacingMode = constraints?.video && typeof constraints.video === "object" && "facingMode" in constraints.video;
      if (wantsAdvanced || wantsFacingMode) {
        const err = new Error("Overconstrained");
        err.name = "OverconstrainedError";
        throw err;
      }
      if (fakeStream) return fakeStream;
      throw new Error("No fake stream available");
    };
    navigator.mediaDevices.enumerateDevices = async () => [];
  });

  await page.goto("/");
  await page.locator('[data-tab="scan"]').click();
  await page.locator("#startCameraBtn").click();

  await page.waitForFunction(
    () => document.getElementById("scanStatus")?.textContent?.includes("Camera ready"),
    { timeout: 10000 },
  );
  await expect(page.locator("#cameraBox")).toBeVisible();

  expect(errors).toEqual([]);
});
