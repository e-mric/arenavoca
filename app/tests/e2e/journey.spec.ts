import { test, expect, type Page } from "@playwright/test";
async function ready(page: Page) {
  await page.goto("/");
  await expect(page.locator("#start")).toBeEnabled();
  await expect(page.locator("#xr-status")).toContainText(
    /Quest 3:|Desktop preview|VR could not initialize/,
    { timeout: 30000 },
  );
}
async function pass(page: Page) {
  await page.locator("#start").click();
  await page.locator("video").evaluate((v) => {
    v.currentTime = 13;
  });
  await expect(page.locator("#phrase-card")).toBeVisible();
}
test("Watch, Explore, trace, Listen, Save, Back and browser reopening", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await ready(page);
  await pass(page);
  await page.locator("#play").click();
  const position = await page.locator("video").evaluate((v) => v.currentTime);
  await page.locator("#explore").click();
  await expect(page.locator("#explore-view")).toBeVisible();
  await page.locator("#trace-start").click();
  const box = (await page.locator("#trace-diagram").boundingBox())!;
  const from = {
    x: box.x + box.width * (0.04 + 0.92 * 0.32),
    y: box.y + box.height * (0.08 + 0.84 * 0.7),
  };
  const to = {
    x: box.x + box.width * (0.04 + 0.92 * 0.65),
    y: box.y + box.height * (0.08 + 0.84 * 0.35),
  };
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 25 });
  await page.mouse.up();
  await expect(page.locator("#chunks .revealed")).toHaveCount(3);
  await page.locator("#explore-listen").click();
  await expect
    .poll(() => page.locator("video").evaluate((v) => v.volume))
    .toBe(0.22);
  await page.locator("#explore-save").click();
  await expect(page.locator("#explore-save")).toHaveText("Saved ✓");
  await page.screenshot({
    path: "../docs/prototype-explore.png",
    fullPage: true,
  });
  await page.locator("#back").click();
  await expect(page.locator("#explore-view")).toBeHidden();
  expect(await page.locator("video").evaluate((v) => v.paused)).toBe(true);
  expect(
    await page.locator("video").evaluate((v) => v.currentTime),
  ).toBeCloseTo(position, 1);
  expect(await page.locator("video").evaluate((v) => v.volume)).toBe(1);
  await page.screenshot({
    path: "../docs/prototype-watch.png",
    fullPage: true,
  });
  await page.reload();
  await expect(page.locator("#start")).toBeEnabled();
  await page.locator("#resume-saved").click();
  await expect(page.locator("#saved-count")).toHaveText("1");
  await page.locator("#library").click();
  await expect(page.locator("#library-status")).toHaveText(
    "Saved on this device.",
  );
  expect(errors).toEqual([]);
});
test("Replay provides the complete explanation while the match keeps playing", async ({
  page,
}) => {
  await ready(page);
  await pass(page);
  const before = await page.locator("video").evaluate((v) => v.currentTime);
  await page.locator("#explore").click();
  expect(await page.locator("video").evaluate((v) => v.paused)).toBe(false);
  await page.locator("#replay").click();
  await expect(page.locator("#chunks .revealed")).toHaveCount(3);
  expect(
    await page.locator("video").evaluate((v) => v.currentTime),
  ).toBeGreaterThan(before + 1);
  // An idle companion must not replace unchanged text every animation frame.
  await expect(page.locator("#trace-instruction")).toContainText(
    "You followed the pass.",
  );
  expect(
    await page.locator("#trace-instruction").evaluate(
      (node) =>
        new Promise<number>((resolve) => {
          let mutations = 0;
          const observer = new MutationObserver(() => mutations++);
          observer.observe(node, { childList: true });
          setTimeout(() => {
            observer.disconnect();
            resolve(mutations);
          }, 500);
        }),
    ),
  ).toBe(0);
  await page.locator("#back").click();
  expect(await page.locator("video").evaluate((v) => v.paused)).toBe(false);
});
test("open explanation survives expired prompts and full time; Pause is optional", async ({
  page,
}) => {
  await ready(page);
  await pass(page);
  await page.locator("#explore").click();
  await page.locator("video").evaluate((v) => {
    v.currentTime = 22;
  });
  await expect(page.locator("#explore-view")).toBeVisible();
  await expect(page.locator("#play")).toBeEnabled();
  await page.locator("#play").click();
  expect(await page.locator("video").evaluate((v) => v.paused)).toBe(true);
  await page.locator("#replay").click();
  await expect(page.locator("#chunks .revealed")).toHaveCount(3);
  await page.locator("#back").click();
  expect(await page.locator("video").evaluate((v) => v.paused)).toBe(true);
  await page.locator("#play").click();
  await page.locator("#library").click();
  expect(await page.locator("video").evaluate((v) => v.paused)).toBe(false);
  await page.locator("video").evaluate((v) => {
    v.currentTime = 29.9;
  });
  await expect
    .poll(() => page.locator("video").evaluate((v) => v.paused))
    .toBe(true);
  await expect(page.locator("#library-view")).toBeVisible();
  await page.locator("#library-back").click();
  await expect(page.locator("#completed")).toBeVisible();
});
test("floating window presets persist without interrupting playback", async ({
  page,
}) => {
  await ready(page);
  await pass(page);
  await page.locator("#explore").click();
  await page.locator("#panel-side").click();
  await page.locator("#panel-distance").click();
  await page.locator("#panel-height").click();
  await expect(page.locator("#watch-layout")).toHaveClass(/left/);
  expect(await page.locator("video").evaluate((v) => v.paused)).toBe(false);
  await page.reload();
  await expect(page.locator("#start")).toBeEnabled();
  await page.locator("#start").click();
  await expect(page.locator("#panel-distance")).toHaveText("Panel farther");
  await expect(page.locator("#panel-height")).toHaveText("Panel higher");
  await expect(page.locator("#watch-layout")).toHaveClass(/left/);
});
test("team-filtered chant demo follows playback and can be hidden", async ({
  page,
}) => {
  await ready(page);
  await page.locator("#team-blue").click();
  await page.locator("#karaoke-toggle").click();
  await page.locator("#start").click();
  await page.locator("video").evaluate((v) => {
    v.currentTime = 22.1;
  });
  await expect(page.locator("#karaoke-card")).toBeVisible();
  await expect(page.locator("#karaoke-lyrics")).toContainText("azul.");
  await expect(page.locator("#karaoke-translation")).toHaveText(
    "Come on, Blue team.",
  );
  await page.locator("#play").click();
  const word = await page
    .locator("#karaoke-lyrics .current-word")
    .textContent();
  await expect(page.locator("#karaoke-lyrics .current-word")).toHaveText(word!);
  await page.locator("#karaoke-hide").click();
  await expect(page.locator("#karaoke-card")).toBeHidden();
  await page.reload();
  await expect(page.locator("#start")).toBeEnabled();
  await expect(page.locator("#team-blue")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("#karaoke-toggle")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.locator("#team-amber").click();
  await page.locator("#karaoke-toggle").click();
  await page.locator("#start").click();
  await page.locator("video").evaluate((v) => {
    v.currentTime = 22.1;
  });
  await expect(page.locator("#karaoke-lyrics")).toContainText("ámbar.");
  await expect(page.locator("#karaoke-lyrics")).not.toContainText("azul.");
});
test("muted viewing, hidden prompts and ignoring all learning still finishes offline", async ({
  page,
  context,
}) => {
  await ready(page);
  await page.locator("#start").click();
  await page.locator("#mute").click();
  await page.locator("#hide-prompts").click();
  await context.setOffline(true);
  await page.locator("video").evaluate((v) => {
    v.currentTime = 13;
  });
  await expect(page.locator("#phrase-card")).toBeHidden();
  expect(await page.locator("video").evaluate((v) => v.volume)).toBe(0);
  await page.locator("video").evaluate((v) => {
    v.currentTime = 29.7;
  });
  await expect(page.locator("#completed")).toBeVisible();
  await context.setOffline(false);
});
test("failed durable Save stays unsaved and reports a retry", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };
  });
  await ready(page);
  await pass(page);
  await page.locator("#save").click();
  await expect(page.locator("#save")).toHaveText("Save phrase");
  await expect(page.locator("#status")).toContainText("Could not save");
});
test("failed media offers Retry; unavailable pronunciation does not block watching", async ({
  page,
}) => {
  await page.route("**/media/match.mp4", (route) =>
    route.fulfill({ status: 503, body: "offline" }),
  );
  await page.goto("/");
  await expect(page.locator("#retry")).toBeVisible();
  await expect(page.locator("#start")).toBeDisabled();
  await page.unroute("**/media/match.mp4");
  await page.route("**/audio/pass-es.mp3", (route) =>
    route.fulfill({ status: 503, body: "unavailable" }),
  );
  await page.locator("#retry").click();
  await expect(page.locator("#start")).toBeEnabled();
  await pass(page);
  await page.locator("#listen").click();
  await expect(page.locator("#status")).toContainText(
    "Pronunciation could not load",
  );
  expect(await page.locator("video").evaluate((v) => v.paused)).toBe(false);
});
test("narrow browser layout keeps controls reachable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page);
  await pass(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.locator("#explore").click();
  await expect(page.locator("#back")).toBeVisible();
});
test("football and F1 team choices change the design and survive reopening", async ({
  page,
}) => {
  await ready(page);
  await page.locator("#team-barcelona").click();
  await expect(page.locator("#desktop")).toHaveAttribute(
    "data-team",
    "barcelona",
  );
  await expect(page.locator("#team-identity")).toContainText("FC Barcelona");
  await page.screenshot({ path: "../docs/team-barcelona.png", fullPage: true });
  const footballRadius = await page
    .locator("#team-barcelona")
    .evaluate((b) => getComputedStyle(b).borderRadius);
  await page.locator("#sport-f1").click();
  await expect(page.locator("#desktop")).toHaveAttribute(
    "data-team",
    "neutral",
  );
  await expect(page.locator("#football-teams")).toBeHidden();
  await page.locator("#team-mclaren").click();
  await expect(page.locator("#desktop")).toHaveAttribute("data-sport", "f1");
  await expect(page.locator("#team-identity")).toContainText("McLaren");
  await page.screenshot({ path: "../docs/team-mclaren.png", fullPage: true });
  const racingRadius = await page
    .locator("#team-mclaren")
    .evaluate((b) => getComputedStyle(b).borderRadius);
  expect(racingRadius).not.toBe(footballRadius);
  await page.reload();
  await expect(page.locator("#start")).toBeEnabled();
  await expect(page.locator("#team-mclaren")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("switching English and Spanish commentary preserves the match timeline and mute", async ({
  page,
}) => {
  await ready(page);
  await page.locator("#start").click();
  await page.locator("#play").click();
  await page.locator("video").evaluate((v) => {
    v.currentTime = 7;
  });
  await page.locator("#commentary-spanish").click();
  await expect(page.locator("#caption")).toContainText("Un buen pase");
  expect(await page.locator("video").evaluate((v) => v.paused)).toBe(true);
  expect(
    await page.locator("video").evaluate((v) => v.currentTime),
  ).toBeCloseTo(7, 1);
  await page.locator("#play").click();
  await expect
    .poll(() =>
      page.locator("audio[data-commentary]").evaluate((a) => a.paused),
    )
    .toBe(false);
  expect(
    await page.evaluate(() =>
      Math.abs(
        document.querySelector("video")!.currentTime -
          document.querySelector<HTMLAudioElement>("audio[data-commentary]")!
            .currentTime,
      ),
    ),
  ).toBeLessThan(0.3);
  expect(await page.locator("video").evaluate((v) => v.volume)).toBe(0);
  await page.locator("#mute").click();
  expect(
    await page.locator("audio[data-commentary]").evaluate((a) => a.volume),
  ).toBe(0);
  await page.locator("#commentary-english").click();
  await expect
    .poll(() =>
      page.locator("audio[data-commentary]").evaluate((a) => a.paused),
    )
    .toBe(true);
  expect(await page.locator("video").evaluate((v) => v.paused)).toBe(false);
  expect(await page.locator("video").evaluate((v) => v.volume)).toBe(0);
  await page.locator("#mute").click();
  expect(await page.locator("video").evaluate((v) => v.volume)).toBe(1);
});
test("unavailable Spanish track leaves English usable", async ({ page }) => {
  await page.route("**/audio/commentary-es.mp3", (route) =>
    route.fulfill({ status: 503, body: "unavailable" }),
  );
  await ready(page);
  await page.locator("#start").click();
  await page.locator("#commentary-spanish").click();
  await expect(page.locator("#status")).toContainText(
    "Spanish commentary is unavailable",
  );
  await expect(page.locator("#commentary-english")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(await page.locator("video").evaluate((v) => v.paused)).toBe(false);
  expect(await page.locator("video").evaluate((v) => v.volume)).toBe(1);
});
