import { test, expect, type Page } from "@playwright/test";
// Deterministic public IFrame API substitute. Live publisher playback is checked
// separately in the browser and documented; these tests verify our controls.
async function mockPlayer(page: Page, initialError = 0) {
  await page.addInitScript(
    ({ initialError }) => {
      type Events = {
        onReady(): void;
        onStateChange(): void;
        onError(e: { data: number }): void;
        onAutoplayBlocked(): void;
      };
      class Player {
        id: string;
        state = 5;
        position = 0;
        volume = 100;
        muted = false;
        events: Events;
        commands: string[] = [];
        constructor(
          element: string,
          opts: { videoId: string; events: Events },
        ) {
          this.id = opts.videoId;
          this.events = opts.events;
          const iframe = document.createElement("iframe");
          iframe.id = element;
          iframe.title = "Test YouTube API substitute";
          iframe.srcdoc =
            "<body style='background:#151a20;color:white;font:20px sans-serif;padding:25px'>Simulated player for automated tests</body>";
          document.getElementById(element)!.replaceWith(iframe);
          (window as unknown as { testPlayer: Player }).testPlayer = this;
          setInterval(() => {
            if (this.state === 1) this.position += 0.1;
          }, 100);
          setTimeout(() => {
            this.events.onReady();
            if (initialError) this.error(initialError);
          }, 10);
        }
        cueVideoById(id: string) {
          this.commands.push("cue");
          this.state = 5;
          setTimeout(() => {
            this.id = id;
            this.position = 0;
            this.events.onStateChange();
          }, 350);
        }
        playVideo() {
          this.commands.push("play");
          this.state = 1;
          this.events.onStateChange();
        }
        pauseVideo() {
          this.commands.push("pause");
          this.state = 2;
          this.events.onStateChange();
        }
        seekTo(t: number) {
          this.commands.push("seek");
          this.position = t;
        }
        getCurrentTime() {
          return this.position;
        }
        getDuration() {
          return this.id === "WMjohb2tq7Y" ? 5961 : 485;
        }
        getPlayerState() {
          return this.state;
        }
        getVolume() {
          return this.volume;
        }
        setVolume(v: number) {
          this.volume = v;
        }
        getVideoData() {
          return { video_id: this.id };
        }
        isMuted() {
          return this.muted;
        }
        mute() {
          this.muted = true;
        }
        unMute() {
          this.muted = false;
        }
        destroy() {}
        error(code: number) {
          this.events.onError({ data: code });
          this.events.onStateChange();
        }
      }
      (window as unknown as { YT: { Player: typeof Player } }).YT = { Player };
    },
    { initialError },
  );
}
async function clock(page: Page) {
  return page.locator("#stream-time").textContent();
}
async function commands(page: Page) {
  return page.evaluate(
    () =>
      (window as unknown as { testPlayer: { commands: string[] } }).testPlayer
        .commands,
  );
}

test("full-match practice, pronunciation and saving leave playback running", async ({
  page,
}) => {
  await mockPlayer(page);
  await page.goto("/watch.html?source=barca");
  await expect(page.locator("#stream-play")).toBeEnabled();
  await page.locator("#stream-play").click();
  await page.locator("#stream-team").selectOption("barcelona");
  await expect(page.locator("#desktop")).toHaveAttribute(
    "data-team",
    "barcelona",
  );
  await page.locator("#stream-replay").click();
  await expect(page.locator("#stream-chunks .revealed")).toHaveCount(3);
  await page.locator("#stream-listen").click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { testPlayer: { volume: number } }).testPlayer
            .volume,
      ),
    )
    .toBe(22);
  await page.locator("#stream-stop").click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { testPlayer: { volume: number } }).testPlayer
            .volume,
      ),
    )
    .toBe(100);
  await page.locator("#stream-save").click();
  await expect(page.locator("#stream-save")).toHaveText("Saved on this device");
  await page.locator("#stream-bookmark").click();
  await expect(page.locator("#stream-bookmarks button")).toHaveCount(1);
  expect(await commands(page)).toEqual(["play"]);
  await page.reload();
  await expect(page.locator("#stream-save")).toHaveText("Saved on this device");
  await expect(page.locator("#desktop")).toHaveAttribute(
    "data-team",
    "barcelona",
  );
  await expect(page.locator("#stream-bookmarks button")).toBeEnabled();
  await page.locator("#stream-bookmarks button").click();
  expect(await commands(page)).toEqual(["seek"]);
});

test("source switching keeps content, colours and bookmarks scoped to the video", async ({
  page,
}) => {
  await mockPlayer(page);
  await page.goto("/watch.html?source=barca");
  await expect(page.locator("#stream-play")).toBeEnabled();
  await page.locator("#stream-team").selectOption("madrid");
  await page.locator("#stream-save").click();
  await page.locator("#stream-bookmark").click();
  await page.locator("#source-select").selectOption("f1-behind-charge");
  await expect(page.locator("#stream-bookmark")).toBeDisabled();
  await expect(page.locator("#lesson-spanish")).toHaveText(
    "El piloto adelanta.",
  );
  await expect(page.locator("#stream-bookmarks button")).toHaveCount(0);
  await expect(page.locator("#stream-save")).toHaveText("Save phrase");
  await expect(page.locator("#stream-time")).toHaveText("00:00 / 08:05");
  await page.locator("#stream-team").selectOption("mclaren");
  await expect(page.locator("#desktop")).toHaveAttribute(
    "data-team",
    "mclaren",
  );
  await page.locator("#stream-replay").click();
  await expect(page.locator("#stream-chunks .revealed")).toHaveCount(2);
  expect(await commands(page)).toEqual(["cue"]);
  await page.locator("#source-select").selectOption("barca");
  await expect(page.locator("#desktop")).toHaveAttribute("data-team", "madrid");
  await expect(page.locator("#stream-save")).toHaveText("Saved on this device");
  await expect(page.locator("#stream-bookmarks button")).toBeEnabled();
});

test("detached companion shares the clock, learns without pause, and returns to the game", async ({
  page,
}) => {
  await mockPlayer(page);
  await page.goto("/watch.html");
  await expect(page.locator("#stream-play")).toBeEnabled();
  await page.locator("#stream-play").click();
  const popupEvent = page.waitForEvent("popup");
  await page.locator("#detach-companion").click();
  const child = await popupEvent;
  await expect(page.locator("#companion-pane")).toBeHidden();
  await expect(child.locator("#connection-status")).toContainText("Playing");
  await child.locator("#stream-replay").click();
  await expect(child.locator("#stream-chunks .revealed")).toHaveCount(3);
  await child.locator("#stream-save").click();
  await expect(child.locator("#stream-save")).toHaveText(
    "Saved on this device",
  );
  await child.locator("#stream-bookmark").click();
  await expect(child.locator("#stream-bookmarks button")).toHaveCount(1);
  expect(await commands(page)).toEqual(["play"]);
  await child.locator("#companion-play").click();
  await expect(child.locator("#connection-status")).toContainText("Paused");
  const paused = await clock(page);
  await child.locator("#stream-replay").click();
  await expect(child.locator("#stream-chunks .revealed")).toHaveCount(3);
  expect(await clock(page)).toBe(paused);
  await page.locator("#inline-companion").click();
  await expect(page.locator("#companion-pane")).toBeVisible();
  await expect.poll(() => child.isClosed()).toBe(true);
  expect(await commands(page)).toEqual(["play", "pause"]);
});

test("publisher errors persist through state events and leave practice usable", async ({
  page,
}) => {
  await mockPlayer(page, 150);
  await page.goto("/watch.html?source=f1-behind-charge");
  await expect(page.locator("#stream-status")).toContainText(
    "disabled embedded playback",
  );
  await expect(page.locator("#stream-play")).toBeDisabled();
  await page.locator("#stream-replay").click();
  await expect(page.locator("#stream-chunks .revealed")).toHaveCount(2);
  await expect(page.locator("#stream-status")).toContainText(
    "disabled embedded playback",
  );
  await page.locator("#stream-save").click();
  await expect(page.locator("#stream-save")).toHaveText("Saved on this device");
  expect(await commands(page)).toEqual([]);
});

test("a standalone companion saves locally, and storage failures are visible across windows", async ({
  page,
}) => {
  await page.goto("/watch.html?view=companion&source=f1-behind-charge");
  await expect(page.locator("#connection-status")).toContainText(
    "Open this companion from the game window",
  );
  await page.locator("#stream-save").click();
  await expect(page.locator("#stream-save")).toHaveText("Saved on this device");
  await expect(page.locator("#stream-bookmark")).toBeDisabled();
  await mockPlayer(page);
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "sports-spanish.stream.v1") throw new Error("storage denied");
      original.call(this, key, value);
    };
  });
  await page.goto("/watch.html?source=barca");
  await expect(page.locator("#stream-play")).toBeEnabled();
  const popupEvent = page.waitForEvent("popup");
  await page.locator("#detach-companion").click();
  const child = await popupEvent;
  await expect(child.locator("#companion-play")).toBeEnabled();
  await child.locator("#stream-save").click();
  await expect(child.locator("#learning-status")).toContainText(
    "Could not save",
  );
  await child.close();
});

test("companion remains readable in a narrow window", async ({ page }) => {
  await page.setViewportSize({ width: 560, height: 900 });
  await page.goto("/watch.html?view=companion&source=f1-behind-charge");
  await page.locator("#stream-team").selectOption("mclaren");
  await expect(page.locator("#lesson-spanish")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
