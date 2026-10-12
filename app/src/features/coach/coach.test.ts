import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Coach, type CoachConnection, type CoachEvents } from "./coach";
import { coachContextMessage } from "./context";
const context = {
  sport: "football",
  team: "barcelona",
  phrase: "El jugador pasa el balón.",
  translation: "The player passes the ball.",
};
let events: CoachEvents;
let connection: CoachConnection;
let coach: Coach;
beforeEach(() => {
  vi.useFakeTimers();
  connection = {
    endSession: vi.fn(async () => {}),
    setMicMuted: vi.fn(),
    sendContextualUpdate: vi.fn(),
    sendUserMessage: vi.fn(),
  };
  coach = new Coach(async (_, e) => {
    events = e;
    return connection;
  });
  coach.show(context);
});
afterEach(() => {
  coach.close();
  vi.useRealTimers();
});
it("opening is silent and shares no context before explicit start", () => {
  expect(coach.phase).toBe("off");
  expect(connection.sendContextualUpdate).not.toHaveBeenCalled();
  coach.ask("explain");
  coach.toggleMic();
  expect(connection.sendUserMessage).not.toHaveBeenCalled();
});
it("starts muted and sends only authored context, without live broadcast claims", async () => {
  await coach.start("voice");
  expect(connection.setMicMuted).toHaveBeenLastCalledWith(true);
  const shared = JSON.parse(
    vi.mocked(connection.sendContextualUpdate).mock.calls[0][0],
  );
  expect(shared).toMatchObject({ ...context, liveCommentaryAvailable: false });
  expect(coach.listening).toBe(false);
  expect(
    coachContextMessage({ ...context, secret: "omitted" } as typeof context),
  ).not.toContain("secret");
});
it("records only an invited speaking window and mutes after transcription", async () => {
  await coach.start("voice");
  coach.toggleMic();
  expect(coach.ducking).toBe(true);
  events.message("user", "What does pasa mean?");
  expect(coach.listening).toBe(false);
  expect(coach.heard).toContain("pasa");
  expect(connection.setMicMuted).toHaveBeenLastCalledWith(true);
});
it("automatically mutes after fifteen seconds and disconnects after five minutes", async () => {
  await coach.start("voice");
  coach.toggleMic();
  vi.advanceTimersByTime(15000);
  expect(coach.listening).toBe(false);
  vi.advanceTimersByTime(285000);
  expect(connection.endSession).toHaveBeenCalledOnce();
  expect(coach.phase).toBe("off");
});
it("text sessions never enable the microphone or duck the match", async () => {
  await coach.start("text");
  coach.toggleMic();
  events.speaking(true);
  expect(coach.listening).toBe(false);
  expect(coach.ducking).toBe(false);
  expect(connection.setMicMuted).not.toHaveBeenCalledWith(false);
  coach.ask("practice");
  expect(connection.sendUserMessage).toHaveBeenCalledWith(
    expect.stringContaining("one simple question"),
  );
});
it("closing during connect ends a late connection and ignores stale replies", async () => {
  let resolve!: (s: CoachConnection) => void;
  coach = new Coach(async (_, e) => {
    events = e;
    return new Promise((r) => {
      resolve = r;
    });
  });
  coach.show(context);
  const pending = coach.start("voice");
  coach.close();
  resolve(connection);
  await pending;
  events.message("ai", "stale");
  expect(connection.endSession).toHaveBeenCalledOnce();
  expect(coach.reply).toBe("");
  expect(coach.phase).toBe("off");
});
it("connection timeout permits retry without reviving the earlier attempt", async () => {
  let resolve!: (s: CoachConnection) => void;
  coach = new Coach(
    async () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  coach.show(context);
  const pending = coach.start("voice");
  vi.advanceTimersByTime(20000);
  expect(coach.phase).toBe("error");
  resolve(connection);
  await pending;
  expect(connection.endSession).toHaveBeenCalledOnce();
  expect(coach.phase).toBe("error");
});
it("errors release mic and output and leave an actionable retry state", async () => {
  await coach.start("voice");
  coach.toggleMic();
  events.speaking(true);
  events.error();
  expect(coach.ducking).toBe(false);
  expect(connection.endSession).toHaveBeenCalledOnce();
  expect(coach.status).toContain("retry");
});
it("pins context for an exchange even if the caller later changes its selection", async () => {
  const selected = { ...context };
  coach.show(selected);
  selected.phrase = "Changed";
  await coach.start("text");
  expect(connection.sendContextualUpdate).toHaveBeenCalledWith(
    expect.stringContaining("pasa"),
  );
  coach.ask("spanish");
  expect(connection.sendUserMessage).toHaveBeenCalledWith(
    expect.stringContaining("simple Spanish"),
  );
});
it("late callbacks from an ended conversation cannot overwrite a new session", async () => {
  await coach.start("text");
  const old = events;
  coach.stop();
  await coach.start("text");
  old.disconnected();
  old.message("ai", "stale");
  expect(coach.phase).toBe("ready");
  expect(coach.reply).toBe("");
});
