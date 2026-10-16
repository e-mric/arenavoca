import { test, expect } from "@playwright/test";
import fs from "node:fs";

test("local drafts enter Match Lab without replacing a pinned card or controlling match playback", async ({
  page,
}) => {
  test.skip(
    !fs.existsSync("public/media/user/barca-2018-h264.mp4"),
    "Private recording required",
  );
  let calls = 0;
  const config = {
    id: "a".repeat(32),
    provider: "ollama",
    model: "qwen3-vl:8b",
    evidence: "frames",
  };
  await page.route("**/api/recognition/**", async (route) => {
    const url = route.request().url();
    if (url.endsWith("configuration")) return route.fulfill({ json: config });
    if (url.endsWith("start")) {
      expect(route.request().postDataJSON().configuration).toBe(config.id);
      return route.fulfill({ json: { session: "fixture-session" } });
    }
    if (url.endsWith("stop")) return route.fulfill({ json: { stopped: true } });
    if (url.includes("/media/"))
      return route.fulfill({
        path: "public/media/user/alba-cutback.mp4",
        contentType: "video/mp4",
      });
    calls++;
    const window = route.request().postDataJSON().window;
    expect(window.endSeconds - window.startSeconds).toBeCloseTo(20, 1);
    return route.fulfill({
      json: {
        window,
        elapsedSeconds: 1,
        moments: [
          {
            id: "abcdef1234567890-0",
            action: "cutback",
            startSeconds: window.startSeconds + 6,
            endSeconds: window.startSeconds + 9,
            spanish: "El jugador pasa hacia atrás.",
            english: "The player passes backwards.",
            visualEvidence: "A backward pass.",
            commentaryEvidence: "",
            replayPath:
              "api/recognition/media/1234567890abcdef/abcdef1234567890-0.mp4",
          },
        ],
        story: [
          {
            eventId: "abcdef1234567890-0",
            spanish: "El pase llega a un compañero.",
            english: "The pass reaches a teammate.",
          },
        ],
      },
    });
  });
  await page.goto("/?recognition=1");
  await page.locator("#start").click();
  const video = page.locator("#video-mount video");
  await video.evaluate((v: HTMLVideoElement) => {
    v.currentTime = 808;
  });
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => !v.seeking))
    .toBe(true);
  await page.locator("#match-lab-open").click();
  await expect(page.locator("[data-analysis-provider]")).toContainText(
    "frames only / no commentary",
  );
  await expect(page.locator("#lab-analysis")).toHaveText("Start analysis");
  await page.locator("#lab-flip-card").click();
  const face = page.locator("#match-lab [data-face]");
  const pinned = await face.textContent();
  await page.locator("#lab-analysis").click();
  await expect(page.locator("#lab-drafts")).toHaveText("New drafts (1)", {
    timeout: 35000,
  });
  await expect(face).toHaveText(pinned!);
  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  await page.locator("#lab-analysis").click();
  await page.locator("#lab-drafts").click();
  await expect(face).toHaveText("El jugador pasa hacia atrás.");
  await page.locator("#lab-flip-card").click();
  await expect(face).toHaveText("The player passes backwards.");
  await page.locator("#lab-read-story").click();
  await expect(face).toHaveText("El pase llega a un compañero.");
  await page.locator("#lab-watch").click();
  const replay = page.locator("video[data-lab-replay]");
  await expect
    .poll(() => replay.evaluate((v: HTMLVideoElement) => v.currentTime))
    .toBeGreaterThan(0.2);
  expect(await replay.evaluate((v: HTMLVideoElement) => v.muted)).toBe(true);
  expect(
    await video.evaluate((v: HTMLVideoElement) => v.currentTime),
  ).toBeGreaterThan(828);
  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  expect(calls).toBe(1);
});
