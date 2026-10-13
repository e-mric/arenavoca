import { test, expect } from "@playwright/test";
import fs from "node:fs";
const mainVideo = "#video-mount video";
test.beforeEach(async ({ page }) => {
  test.skip(
    !fs.existsSync("public/media/user/barca-2018-h264.mp4"),
    "Private recording required",
  );
  await page.goto("/");
  await expect(page.locator("#start")).toBeEnabled();
  await page.locator("#start").click();
});
test("moment cards flip, stories follow their source, and silent replay never commands the match", async ({
  page,
}) => {
  await page.locator("#match-lab-open").click();
  await expect(page.locator("#match-lab [data-face]")).toHaveText(
    "Alba pasa el balón hacia atrás.",
  );
  await page.locator("#lab-flip-card").click();
  await expect(page.locator("#match-lab [data-face]")).toHaveText(
    "Alba passes the ball back.",
  );
  await page.locator("#lab-read-story").click();
  await expect(page.locator("#match-lab [data-face]")).toContainText(
    "Coutinho llega",
  );
  await page.locator("#lab-next-card").click();
  await expect(page.locator("#match-lab [data-face]")).toContainText(
    "marca el primer gol",
  );
  await page.locator("#lab-watch").click();
  const replay = page.locator("video[data-lab-replay]");
  await expect(replay).toBeVisible();
  await expect
    .poll(() => replay.evaluate((v) => v.currentTime))
    .toBeGreaterThan(0.2);
  expect(await replay.evaluate((v) => v.muted)).toBe(true);
  expect(await page.locator(mainVideo).evaluate((v) => v.paused)).toBe(false);
  await page.locator("#lab-store").click();
  await expect(page.locator("#lab-store")).toContainText("Saved");
  await page.locator("#lab-prev-card").click();
  await expect(replay).toBeHidden();
  expect(await replay.evaluate((v) => v.paused)).toBe(true);
  await expect(page.locator("#match-lab [data-face]")).toContainText(
    "hacia atrás",
  );
  await page.locator("#lab-dismiss").click();
  expect(await page.locator(mainVideo).evaluate((v) => v.paused)).toBe(false);
});
test("both arrangements require an answer while an explicitly paused match stays paused", async ({
  page,
}) => {
  await page.locator("#play").click();
  const time = await page.locator(mainVideo).evaluate((v) => v.currentTime);
  await page.locator("#match-lab-open").click();
  await page.locator("#lab-continue").click();
  await expect(page.locator("#match-lab [data-translation]")).toBeHidden();
  await page.locator("#lab-player-0").click();
  await expect(page.locator("#lab-continue")).toHaveText("Try again");
  await page.locator("#lab-ball").click();
  await page.locator("#lab-player-1").click();
  await expect(page.locator("#match-lab [data-message]")).toContainText(
    "Try again",
  );
  await page.locator("#lab-continue").click();
  await page.locator("#lab-ball").click();
  await page.locator("#lab-player-0").click();
  await expect(page.locator("#lab-continue")).toHaveText("New arrangement");
  await expect(page.locator("#lab-continue")).toBeEnabled();
  await page.locator("#lab-continue").click();
  await expect(page.locator("#match-lab [data-direction]")).toContainText(
    "LEFT",
  );
  await page.locator("#lab-ball").click();
  await page.locator("#lab-player-1").click();
  await expect(page.locator("#lab-continue")).toBeEnabled();
  await page.locator("#lab-continue").click();
  await expect(page.locator("#match-lab [data-step]")).toHaveText(
    "PRACTICE COMPLETE",
  );
  await page.locator("#lab-dismiss").click();
  expect(await page.locator(mainVideo).evaluate((v) => v.paused)).toBe(true);
  expect(
    await page.locator(mainVideo).evaluate((v) => v.currentTime),
  ).toBeCloseTo(time, 1);
});
test("missing replay recovers to the activity", async ({ page }) => {
  await page.route("**/media/user/alba-cutback.mp4", (route) => route.abort());
  await page.locator("#match-lab-open").click();
  await page.locator("#lab-watch").click();
  // Replay failures must remain visible even when the failed video is hidden.
  await expect(page.locator("#match-lab [data-message]")).toContainText(
    "Replay unavailable",
  );
  await page.locator("#lab-continue").click();
  await expect(page.locator("#lab-ball")).toBeVisible();
  expect(await page.locator(mainVideo).evaluate((v) => v.paused)).toBe(false);
});
