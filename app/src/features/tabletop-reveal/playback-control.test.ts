import { expect, it, vi } from "vitest";
import { activatePlayback, playbackLabel } from "./playback-control";
it("resumes after headset exit instead of restarting the match", () => {
  const session = {
    mode: "Suspended" as const,
    matchActive: false,
    resume: vi.fn(),
    start: vi.fn(),
    togglePlayback: vi.fn(),
  };
  activatePlayback(session);
  expect(session.resume).toHaveBeenCalledOnce();
  expect(session.start).not.toHaveBeenCalled();
  expect(session.togglePlayback).not.toHaveBeenCalled();
  expect(playbackLabel(session, true)).toBe("Resume");
});
it("starts a new session only from onboarding and toggles an existing match", () => {
  const start = vi.fn(),
    togglePlayback = vi.fn(),
    resume = vi.fn();
  activatePlayback({
    mode: "Onboarding",
    matchActive: false,
    start,
    togglePlayback,
    resume,
  });
  expect(start).toHaveBeenCalledOnce();
  activatePlayback({
    mode: "Watching",
    matchActive: true,
    start,
    togglePlayback,
    resume,
  });
  expect(togglePlayback).toHaveBeenCalledOnce();
  expect(start).toHaveBeenCalledOnce();
});
