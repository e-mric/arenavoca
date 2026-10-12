import { test, expect } from "@playwright/test";
test("coach is opt-in, text replies are real SDK events, and playback remains independent", async ({
  page,
}) => {
  page.on("console", (m) => {
    if (m.type() === "error") console.log("Browser error:", m.text());
  });
  const messages: { type: string; text?: string }[] = [];
  let closed = false;
  await page.routeWebSocket("**/v1/convai/conversation**", (socket) => {
    socket.onClose(() => {
      closed = true;
    });
    socket.onMessage((raw) => {
      const message = JSON.parse(String(raw));
      messages.push(message);
      if (message.type === "conversation_initiation_client_data")
        socket.send(
          JSON.stringify({
            type: "conversation_initiation_metadata",
            conversation_initiation_metadata_event: {
              conversation_id: "conv_test",
              agent_output_audio_format: "pcm_16000",
              user_input_audio_format: "pcm_16000",
            },
          }),
        );
      if (message.type === "user_message")
        socket.send(
          JSON.stringify({
            type: "agent_response",
            agent_response_event: {
              agent_response:
                "Pasa means passes. El jugador pasa el balón: the player passes the ball.",
              event_id: 1,
            },
          }),
        );
    });
  });
  await page.goto("/?sample=1");
  await expect(page.locator("#start")).toBeEnabled();
  await page.locator("#start").click();
  await page.locator("#coach-open").click();
  await expect(page.locator("#coach-card")).toBeVisible();
  await expect(page.locator("#coach-status")).toContainText("microphone off");
  expect(messages).toHaveLength(0);
  expect(await page.locator("video").evaluate((v) => v.paused)).toBe(false);
  await page.locator("#coach-text").click();
  await expect(page.locator("#coach-status")).toContainText("Text coach");
  await page.locator("#coach-explain").click();
  await expect(page.locator("#coach-reply")).toContainText("Pasa means passes");
  expect(messages.find((m) => m.type === "contextual_update")?.text).toContain(
    "liveCommentaryAvailable",
  );
  expect(await page.locator("video").evaluate((v) => v.paused)).toBe(false);
  await page.locator("#play").click();
  const position = await page.locator("video").evaluate((v) => v.currentTime);
  await page.locator("#coach-close").click();
  await expect(page.locator("#coach-card")).toBeHidden();
  await expect.poll(() => closed).toBe(true);
  expect(
    await page.locator("video").evaluate((v) => v.currentTime),
  ).toBeCloseTo(position, 1);
  await page.locator("#coach-open").click();
  await expect(page.locator("#coach-reply")).toBeEmpty();
});
test("failed service connection leaves the match usable and offers retry", async ({
  page,
}) => {
  await page.routeWebSocket("**/v1/convai/conversation**", (socket) =>
    socket.close({ code: 1011, reason: "Test unavailable" }),
  );
  await page.goto("/?sample=1");
  await expect(page.locator("#start")).toBeEnabled();
  await page.locator("#start").click();
  await page.locator("#coach-open").click();
  await page.locator("#coach-text").click();
  await expect(page.locator("#coach-starts")).toBeVisible();
  await expect(page.locator("#coach-end")).toBeHidden();
  expect(await page.locator("video").evaluate((v) => v.paused)).toBe(false);
});
test("live coach explains authored Spanish without claiming access to the broadcast", async ({
  page,
}) => {
  test.skip(
    process.env.ARENAVOCA_LIVE_COACH !== "1",
    "Explicit opt-in: makes a real provider request.",
  );
  await page.goto("/?sample=1");
  await expect(page.locator("#start")).toBeEnabled();
  await page.locator("#start").click();
  await page.locator("#coach-open").click();
  await page.locator("#coach-text").click();
  await expect(page.locator("#coach-status")).toContainText("Text coach");
  await page.locator("#coach-explain").click();
  await expect(page.locator("#coach-reply")).not.toBeEmpty();
  console.log(
    "Live explanation:",
    await page.locator("#coach-reply").innerText(),
  );
  await page
    .locator("#coach-question")
    .fill("What did the commentator just say in this match?");
  await page.locator("#coach-form button").click();
  await expect(page.locator("#coach-reply")).toContainText(
    /cannot|can't|don't have|unable|no access/i,
  );
  console.log(
    "Live grounding:",
    await page.locator("#coach-reply").innerText(),
  );
  await page.locator("#coach-end").click();
  await expect(page.locator("#coach-status")).toContainText("Disconnected");
});

test.use({
  launchOptions: {
    args: [
      "--use-fake-device-for-media-stream",
      "--use-fake-ui-for-media-stream",
      "--autoplay-policy=no-user-gesture-required",
    ],
  },
});
test.describe("live voice transport", () => {
  test("voice output ducks the match and End releases the synthetic microphone", async ({
    page,
  }) => {
    test.skip(
      process.env.ARENAVOCA_LIVE_COACH !== "1",
      "Explicit opt-in: real provider with synthetic microphone.",
    );
    await page.addInitScript(() => {
      const get = navigator.mediaDevices.getUserMedia.bind(
        navigator.mediaDevices,
      );
      (window as any).__coachTracks = [];
      navigator.mediaDevices.getUserMedia = async (constraints) => {
        const stream = await get(constraints);
        (window as any).__coachTracks.push(...stream.getTracks());
        return stream;
      };
    });
    await page.goto("/?sample=1");
    await expect(page.locator("#start")).toBeEnabled();
    await page.locator("#start").click();
    await page.locator("#coach-open").click();
    await page.locator("#coach-voice").click();
    await expect(page.locator("#coach-status")).toContainText("Ready");
    await page.locator("#coach-explain").click();
    await expect(page.locator("#coach-status")).toContainText("Coach speaking");
    expect(await page.locator("video").evaluate((v) => v.paused)).toBe(false);
    expect(await page.locator("video").evaluate((v) => v.volume)).toBe(0.22);
    await page.locator("#coach-end").click();
    await expect(page.locator("#coach-status")).toContainText("Disconnected");
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as any).__coachTracks.length > 0 &&
            (window as any).__coachTracks.every(
              (t: MediaStreamTrack) => t.readyState === "ended",
            ),
        ),
      )
      .toBe(true);
    expect(await page.locator("video").evaluate((v) => v.volume)).toBe(1);
  });
});
