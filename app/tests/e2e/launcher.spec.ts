import { test, expect } from "@playwright/test";
test("Playmaker launch page works on a phone-sized browser without pretending XR is available", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?sample=1");
  await expect(page.locator("#start")).toBeEnabled();
  await expect(page.locator("#launch-support")).toContainText("Quest Browser");
  await expect(
    page.getByRole("button", { name: "Enter VR →", exact: true }),
  ).toBeDisabled();
  await expect(page.locator("#desktop")).toHaveCSS(
    "background-color",
    "rgb(255, 250, 242)",
  );
  expect(
    await page
      .locator("#football-art")
      .evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
      ),
  ).toBe(true);
  await page.locator("#sport-f1").click();
  await expect(page.locator("#f1-teams")).toBeVisible();
  await page.locator("#team-mclaren").click();
  await expect(page.locator("#desktop")).toHaveCSS(
    "background-color",
    "rgb(255, 250, 242)",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.screenshot({
    path: "artifacts/playmaker-web-launcher.png",
    fullPage: true,
  });
  await page.locator("#start").click();
  await expect(page.locator("#experience")).toBeVisible();
  await expect(page.locator("#intro")).toBeHidden();
  await expect(page.locator("#enter-vr")).toBeVisible();
});

test("team and sport selections show meaningful previews and only available chants", async ({
  page,
}) => {
  await page.goto("/?sample=1");
  await expect(page.locator("#start")).toBeEnabled();
  await expect(page.locator("#karaoke-toggle")).toBeHidden();
  const video = page.locator("#video-mount video");
  const source = await video.getAttribute("src");
  await page.locator("#team-barcelona").click();
  await expect(page.locator("#selection-title")).toContainText("FC Barcelona");
  await expect(page.locator("#selection-preview")).toHaveCSS(
    "--kit-shirt",
    "#1746a2",
  );
  await page.locator("#team-madrid").click();
  await expect(page.locator("#selection-title")).toContainText("Real Madrid");
  await expect(page.locator("#selection-preview")).toHaveCSS(
    "--kit-shirt",
    "#f1f2f8",
  );
  await page.locator("#team-blue").click();
  await page.locator("#karaoke-toggle").click();
  await expect(page.locator("#chant-availability")).toContainText("00:21");
  await page.locator("#sport-f1").click();
  await page.locator("#team-mclaren").click();
  await expect(page.locator("#selection-car")).toBeVisible();
  await expect(page.locator("#selection-shirt")).toBeHidden();
  await expect(page.locator("#selection-spanish")).toHaveText(
    "El piloto adelanta.",
  );
  await expect(page.locator("#selection-source")).toContainText(
    "football clip stays loaded",
  );
  await expect(page.locator("#karaoke-toggle")).toBeHidden();
  await expect(video).toHaveAttribute("src", source!);
  expect(await video.evaluate((v) => v.paused)).toBe(true);
  await expect(page.locator('a[href*="watch.html"]')).toHaveCount(0);
});

test("a configured recording explains the unavailable sport and hides sample-only controls", async ({
  page,
}) => {
  await page.route("**/content/theater-source.json", (route) =>
    route.fulfill({
      json: {
        kind: "video",
        id: "football-fixture",
        title: "Football test recording",
        sport: "football",
        video: "media/match.mp4",
      },
    }),
  );
  await page.goto("/");
  await expect(page.locator("#selection-preview")).toBeVisible();
  await expect(page.locator("#sport-f1")).toBeDisabled();
  await expect(page.locator("#sport-availability")).toContainText(
    "cannot change its footage",
  );
  await expect(page.locator("#team-blue")).toBeHidden();
  await page.locator("#team-barcelona").click();
  await expect(page.locator("#selection-title")).toContainText("FC Barcelona");
  await expect(page.locator("#selection-source")).toContainText(
    "Football test recording",
  );
  await expect(page.locator("#karaoke-toggle")).toBeHidden();
});

test("choices cannot be clicked before content and handlers are ready", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/content/match.json", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/?sample=1");
  await expect(page.locator("#sport-football")).toBeDisabled();
  await expect(page.locator("#team-barcelona")).toBeDisabled();
  release();
  await expect(page.locator("#start")).toBeEnabled();
  await expect(page.locator("#team-barcelona")).toBeEnabled();
});

test("main website is an XR launcher with responsive space choices and no flat watch page", async ({
  page,
}) => {
  await page.route("**/content/theater-source.json", (route) =>
    route.fulfill({
      json: {
        kind: "video",
        id: "launcher-fixture",
        title: "Football fixture",
        sport: "football",
        video: "media/match.mp4",
      },
    }),
  );
  await page.goto("/");
  await expect(page.locator("#selection-preview")).toBeVisible();
  await expect(page.locator("#experience")).toBeHidden();
  await expect(page.locator("#start")).toBeHidden();
  await expect(page.locator("#enter-vr")).toBeHidden();
  await expect(page.locator("#enter-passthrough")).toBeHidden();
  await page.getByRole("radio", { name: "Quiet space" }).check();
  await expect(page.locator("#launch-support")).toContainText(
    "Quiet space selected",
  );
  await expect(page.locator("#enter-theater")).toBeDisabled();
  await page.getByRole("radio", { name: "My room" }).check();
  await expect(page.locator("#launch-support")).toContainText(
    "My room · Passthrough selected",
  );
  await expect(page.locator("#launch-support")).toContainText(
    "VR emulator window",
  );
  expect(
    await page.locator("#video-mount video").evaluate((v) => v.paused),
  ).toBe(true);
  await expect(page.locator("#intro")).toBeVisible();
});
