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
    "El jugador pasa el balón hacia atrás dentro del área.",
  );
  await page.locator("#lab-flip-card").click();
  await expect(page.locator("#match-lab [data-face]")).toHaveText(
    "The player passes the ball back inside the penalty area.",
  );
  await page.locator("#lab-read-story").click();
  await expect(page.locator("#match-lab [data-face]")).toContainText(
    "pase raso hacia atrás",
  );
  await page.locator("#lab-next-card").click();
  await expect(page.locator("#match-lab [data-face]")).toContainText(
    "marca un gol",
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

test("the generated shot replays its own excerpt and joins the three-scene story without interrupting the match", async ({
  page,
}) => {
  await page.locator("#match-lab-open").click();
  const initial = await page.locator(mainVideo).evaluate((v) => v.currentTime);
  await page.locator("#lab-next-card").click();
  await expect(page.locator("#match-lab [data-face]")).toHaveText(
    "El jugador dispara a puerta.",
  );
  await expect(page.locator("#match-lab [data-step]")).toContainText("6 of 7");
  await page.locator("#lab-watch").click();
  const replay = page.locator("video[data-lab-replay]");
  await expect
    .poll(() => replay.evaluate((v) => v.currentTime))
    .toBeGreaterThan(0.2);
  expect(await replay.evaluate((v) => v.currentSrc)).toContain(
    "coutinho-shot.mp4",
  );
  expect(await replay.evaluate((v) => v.duration)).toBeCloseTo(4, 1);
  await page.locator("#lab-read-story").click();
  await expect(replay).toBeHidden();
  await expect(page.locator("#match-lab [data-step]")).toContainText("3 of 3");
  await expect(page.locator("#match-lab [data-face]")).toHaveText(
    "Su compañero dispara y marca un gol.",
  );
  await page.locator("#lab-flip-card").click();
  await expect(page.locator("#match-lab [data-face]")).toHaveText(
    "His teammate shoots and scores a goal.",
  );
  await page.locator("#lab-prev-card").click();
  await expect(page.locator("#match-lab [data-face]")).toContainText(
    "pase raso",
  );
  const final = await page.locator(mainVideo).evaluate((v) => v.currentTime);
  expect(final).toBeGreaterThan(initial);
  expect(final - initial).toBeLessThan(20);
  expect(await page.locator(mainVideo).evaluate((v) => v.paused)).toBe(false);
});

test("tabletop pass and shot, correction, translation and reset preserve live playback", async ({
  page,
}) => {
  const video = page.locator(mainVideo);
  await page.locator("#match-lab-open").click();
  await page.locator("#lab-tabletop").click();
  const practice = page.locator("#tabletop-practice");
  await expect(practice.locator("[data-prompt]")).toContainText("hacia atrás");
  const before = await video.evaluate((v) => v.currentTime);
  await page.locator("#table-goal").click();
  await expect(page.locator("#table-ball")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.locator("#table-ball").click();
  await page.locator("#table-goal").click();
  await expect(practice.locator("[data-feedback]")).toContainText(
    "Hacia atrás means backwards",
  );
  await page.locator("#table-primary").click();
  await page.locator("#table-translation").click();
  await expect(practice.locator("[data-hint]")).toHaveText(
    "Pass the ball back.",
  );
  await page.locator("#table-ball").click();
  await page.locator("#table-teammate").click();
  await expect(page.locator("#table-primary")).toHaveText("Next: shoot");
  await page.locator("#table-primary").click();
  await expect(practice.locator("[data-prompt]")).toHaveText(
    "Dispara a portería.",
  );
  await page.locator("#table-ball").click();
  await page.locator("#table-goal").click();
  await expect(practice.locator("[data-feedback]")).toContainText("¡Gol!");
  await page.locator("#table-cards").click();
  await expect(page.locator("#match-lab [data-face]")).toHaveText(
    "El jugador pasa el balón hacia atrás dentro del área.",
  );
  expect(await video.evaluate((v) => v.paused)).toBe(false);
  expect(await video.evaluate((v) => v.currentTime)).toBeGreaterThan(before);
});
test("closing a selected tabletop ball preserves explicit pause and reopening resets it", async ({
  page,
}) => {
  await page.locator("#play").click();
  const before = await page.locator(mainVideo).evaluate((v) => v.currentTime);
  await page.locator("#match-lab-open").click();
  await page.locator("#lab-tabletop").click();
  await page.locator("#table-ball").click();
  await page.locator("#table-dismiss").click();
  await page.locator("#match-lab-open").click();
  await page.locator("#lab-tabletop").click();
  await expect(page.locator("#table-ball")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  expect(await page.locator(mainVideo).evaluate((v) => v.paused)).toBe(true);
  expect(
    await page.locator(mainVideo).evaluate((v) => v.currentTime),
  ).toBeCloseTo(before, 1);
});

for (const paused of [false, true])
  test(`team atmosphere preserves ${paused ? "paused" : "playing"} playback and practice`, async ({
    page,
  }) => {
    if (paused) await page.locator("#play").click();
    const video = page.locator(mainVideo);
    const before = await video.evaluate((v) => v.currentTime);
    await page.locator("#match-lab-open").click();
    await page.locator("#lab-tabletop").click();
    const practice = page.locator("#tabletop-practice");
    await expect(practice).toHaveAttribute("data-atmosphere", "team");
    await page.locator("#table-ball").click();
    await page.locator("#table-teammate").click();
    await expect(practice).toHaveAttribute("data-celebrating", "true");
    await page.locator("#table-atmosphere").click();
    await expect(practice).toHaveAttribute("data-atmosphere", "minimal");
    await expect(practice).toHaveAttribute("data-celebrating", "false");
    await expect(page.locator("#table-primary")).toHaveText("Next: shoot");
    await page.locator("#table-dismiss").click();
    await page.locator("#match-lab-open").click();
    await page.locator("#lab-tabletop").click();
    await expect(practice).toHaveAttribute("data-atmosphere", "minimal");
    await page.locator("#table-atmosphere").click();
    await expect(practice).toHaveAttribute("data-celebrating", "false");
    expect(await video.evaluate((v) => v.paused)).toBe(paused);
    const after = await video.evaluate((v) => v.currentTime);
    if (paused) expect(after).toBeCloseTo(before, 1);
    else expect(after).toBeGreaterThan(before);
  });
