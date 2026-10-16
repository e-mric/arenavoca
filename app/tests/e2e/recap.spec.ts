import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

for (const sport of ["football", "f1"] as const) {
  test(`${sport} saved phrases export to the mobile contract without controlling playback`, async ({
    page,
  }) => {
    await page.route("**/content/theater-source.json", (route) =>
      route.fulfill({
        json: {
          kind: "video",
          id: `${sport}-demo`,
          title: sport === "f1" ? "F1 demo" : "Football demo",
          sport,
          video: "media/match.mp4",
        },
      }),
    );
    await page.goto("/?preview=1");
    await page.locator("#start").click();
    await page.locator("#library").click();
    await expect(page.locator("#recap-export")).toBeDisabled();
    await page.locator("#library-back").click();
    await page.locator("#explore").click();
    await page.locator("#replay").click();
    await page.locator("#explore-save").click();
    await page.locator("#back").click();
    await page.locator("#library").click();
    const before = await page.locator("video").evaluate((v) => v.currentTime);
    const downloadEvent = page.waitForEvent("download");
    await page.locator("#recap-export").click();
    const download = await downloadEvent;
    expect(download.suggestedFilename()).toBe("arenavoca-recap.json");
    const actual = JSON.parse(readFileSync((await download.path())!, "utf8"));
    const expected = JSON.parse(
      readFileSync(`src/features/recap/fixtures/${sport}.json`, "utf8"),
    );
    expect(actual).toEqual(expected);
    await expect(page.locator("#recap-export-status")).toContainText(
      "Move the file to your phone",
    );
    expect(await page.locator("video").evaluate((v) => v.paused)).toBe(false);
    expect(
      await page.locator("video").evaluate((v) => v.currentTime),
    ).toBeGreaterThanOrEqual(before);
    await page.locator("#play").click();
    const paused = await page.locator("video").evaluate((v) => v.currentTime);
    const pausedDownload = page.waitForEvent("download");
    await page.locator("#recap-export").click();
    await pausedDownload;
    expect(await page.locator("video").evaluate((v) => v.paused)).toBe(true);
    expect(
      await page.locator("video").evaluate((v) => v.currentTime),
    ).toBeCloseTo(paused, 1);
  });
}
