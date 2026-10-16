import { test, expect } from "@playwright/test";
for (const source of ["barca", "f1-behind-charge"]) {
  test(`retired ${source} browser page returns to the VR launcher without loading YouTube`, async ({
    page,
  }) => {
    const youtubeRequests: string[] = [];
    page.on("request", (r) => {
      if (/youtube\.com|youtu\.be/.test(r.url())) youtubeRequests.push(r.url());
    });
    await page.goto(`/watch.html?source=${source}`);
    await expect(page).toHaveURL(
      (url) => url.pathname === "/" && url.search === "",
    );
    await expect(page.locator("#intro")).toBeVisible();
    await expect(page.locator("#experience")).toBeHidden();
    await expect(page.locator("iframe")).toHaveCount(0);
    await expect(page.locator('a[href*="watch.html"]')).toHaveCount(0);
    expect(youtubeRequests).toEqual([]);
  });
}
