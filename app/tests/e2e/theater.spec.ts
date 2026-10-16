import { test, expect } from "@playwright/test";
import fs from "node:fs";
test("the full local match is a real media source; learning never pauses it", async ({
  page,
}) => {
  test.skip(
    !fs.existsSync("public/media/user/barca-2018-h264.mp4"),
    "The full recording is private demo media.",
  );
  await page.goto("/?preview=1");
  await expect(page.locator("#start")).toBeEnabled();
  await expect(page.locator("#media-source-label")).toContainText("Barcelona");
  expect(
    await page.locator("video").evaluate((v) => v.duration),
  ).toBeGreaterThan(5900);
  expect(await page.locator("video").getAttribute("src")).toContain(
    "media/user/barca-2018-h264.mp4",
  );
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.locator("#start").click();
  await expect(page.locator("#enter-passthrough")).toBeVisible();
  await expect(page.locator("#enter-passthrough")).toBeDisabled();
  await expect(page.locator("#enter-vr")).toBeVisible();
  await expect(page.locator("#phrase-card")).toBeVisible();
  await page.locator("#explore").click();
  await page.locator("#replay").click();
  await expect(page.locator("#chunks .revealed")).toHaveCount(3);
  expect(await page.locator("video").evaluate((v) => v.paused)).toBe(false);
  await page.locator("#explore-save").click();
  await expect(page.locator("#explore-save")).toHaveText("Saved ✓");
  await page.locator("#back").click();
  expect(await page.locator("video").evaluate((v) => v.paused)).toBe(false);
  await page.locator("video").evaluate((v) => {
    v.currentTime = 3000;
  });
  await expect
    .poll(() => page.locator("video").evaluate((v) => v.currentTime))
    .toBeGreaterThanOrEqual(3000);
  await expect(page.locator("#phrase-card")).toBeVisible();
  await page.locator("#play").click();
  const paused = await page.locator("video").evaluate((v) => v.currentTime);
  await page.locator("#explore").click();
  await page.locator("#back").click();
  expect(await page.locator("video").evaluate((v) => v.paused)).toBe(true);
  expect(
    await page.locator("video").evaluate((v) => v.currentTime),
  ).toBeCloseTo(paused, 1);
});
test("a configured F1 recording uses the overtake pack and keeps source audio", async ({
  page,
}) => {
  await page.route("**/content/theater-source.json", (route) =>
    route.fulfill({
      json: {
        kind: "video",
        id: "f1-fixture",
        title: "F1 concept test fixture",
        sport: "f1",
        video: "media/match.mp4",
      },
    }),
  );
  await page.goto("/?preview=1");
  await expect(page.locator("#start")).toBeEnabled();
  await page.locator("#start").click();
  await expect(page.locator("#phrase-card h2")).toHaveText(
    "El piloto adelanta.",
  );
  await expect(page.locator("#commentary-spanish")).toBeHidden();
  await page.locator("#explore").click();
  await page.locator("#replay").click();
  await expect(page.locator("#chunks .revealed")).toHaveCount(2);
  expect(await page.locator("video").evaluate((v) => v.paused)).toBe(false);
});
test("unavailable configured media offers an explicit calibration fallback", async ({
  page,
}) => {
  await page.route("**/content/theater-source.json", (route) =>
    route.fulfill({
      json: {
        kind: "video",
        id: "missing",
        title: "Missing",
        sport: "football",
        video: "media/user/missing.mp4",
      },
    }),
  );
  await page.goto("/?preview=1");
  await expect(page.locator("#use-sample")).toBeVisible();
  await page.locator("#use-sample").click();
  await expect(page.locator("#start")).toBeEnabled();
  await expect(page.locator("#media-source-label")).toContainText(
    "Calibration",
  );
});
