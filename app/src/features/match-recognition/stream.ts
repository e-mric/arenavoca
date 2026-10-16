/** A provider-neutral result: recording seconds today, aligned media seconds for live later. */
export interface AnalysisWindow {
  sourceId: string;
  startSeconds: number;
  endSeconds: number;
}
export interface ObservedMoment {
  id: string;
  action: string;
  startSeconds: number;
  endSeconds: number;
  spanish: string;
  english: string;
  visualEvidence: string;
  commentaryEvidence: string;
  replayPath: string;
}
export interface MomentBatch {
  window: AnalysisWindow;
  moments: ObservedMoment[];
  story: { eventId: string; spanish: string; english: string }[];
  elapsedSeconds: number;
}
export interface RecognitionTransport {
  configuration(): Promise<RecognitionConfiguration>;
  start(
    position: number,
    signal: AbortSignal,
    configuration: string,
  ): Promise<string>;
  analyze(
    session: string,
    window: AnalysisWindow,
    signal: AbortSignal,
  ): Promise<MomentBatch>;
  stop(session: string): Promise<void>;
}

export interface RecognitionConfiguration {
  id: string;
  provider: "gemini" | "ollama";
  model: string;
  evidence: "video-audio" | "frames" | "frames-transcript";
}

export function providerNotice(config: RecognitionConfiguration): string {
  if (config.provider === "gemini")
    return "Google Cloud / sends played video + audio to Google";
  return config.evidence === "frames-transcript"
    ? "Local AI / frames + local commentary / stays on your PC"
    : "Local AI / frames only / no commentary / stays on your PC";
}

/** No playback commands. At most one request and three windows per explicit run. */
export class RecordedStream {
  active = false;
  status = "Recorded-as-live / off";
  received = 0;
  notice = "Check the analysis service before starting";
  private configuration?: RecognitionConfiguration;
  private connecting = false;
  get startLabel() {
    return this.configuration ? "Start analysis" : "Check service";
  }
  async connect() {
    if (this.active || this.connecting) return;
    this.connecting = true;
    this.configuration = undefined;
    this.notice = "Checking analysis service...";
    try {
      this.configuration = await this.transport.configuration();
      this.notice = providerNotice(this.configuration);
    } catch {
      this.notice = "Service unavailable / check PC setup, then Check service";
    } finally {
      this.connecting = false;
    }
  }
  private session = "";
  private generation = 0;
  private request?: AbortController;
  private busy = false;
  private origin = 0;
  private lastPosition = 0;
  private nextEnd = 0;
  private attempts = 0;
  private observed: ObservedMoment[] = [];
  constructor(
    private readonly transport: RecognitionTransport,
    private readonly publish: (batch: MomentBatch) => void,
  ) {}
  async start(position: number) {
    if (this.active || !Number.isFinite(position) || position < 0) return;
    // Checking a missing/stale configuration never also starts inference.
    if (!this.configuration) {
      await this.connect();
      return;
    }
    this.active = true;
    this.origin = this.lastPosition = position;
    this.nextEnd = position + 20;
    this.attempts = this.received = 0;
    this.observed = [];
    this.busy = true;
    const generation = ++this.generation;
    const request = (this.request = new AbortController());
    this.status = "Starting / " + this.notice;
    try {
      const session = await this.transport.start(
        position,
        request.signal,
        this.configuration.id,
      );
      if (generation !== this.generation) {
        void this.transport.stop(session).catch(() => {});
        return;
      }
      this.session = session;
      this.status = "Watching / collecting 20 seconds";
    } catch {
      if (generation === this.generation) {
        this.configuration = undefined;
        this.notice =
          "Service changed or unavailable / Check service before retrying";
        this.stop(
          "Analysis unavailable. Start the local analysis service, then retry.",
        );
      }
    } finally {
      if (generation === this.generation) this.busy = false;
    }
  }
  stop(message = "Analysis stopped / existing drafts remain") {
    this.active = false;
    this.generation++;
    this.request?.abort();
    this.request = undefined;
    this.busy = false;
    const session = this.session;
    this.session = "";
    if (session) void this.transport.stop(session).catch(() => {});
    this.status = message;
  }
  tick(position: number, playing: boolean, delta: number, seeking = false) {
    if (!this.active) return;
    if (
      !Number.isFinite(position) ||
      !Number.isFinite(delta) ||
      delta < 0 ||
      seeking ||
      position < this.lastPosition - 0.2 ||
      position - this.lastPosition > Math.max(1, delta * 1.5 + 0.25)
    ) {
      this.stop("Playback moved / start analysis again at this position");
      return;
    }
    this.lastPosition = position;
    if (!playing || this.busy || !this.session || position < this.nextEnd)
      return;
    // Coalesce old queued work: analyse the latest observed window, never build a backlog.
    const end = Math.floor(position * 10) / 10;
    const window = {
      sourceId: "barca-2018-full",
      startSeconds: Math.max(this.origin, end - 20),
      endSeconds: end,
    };
    this.nextEnd = end + 16;
    void this.run(window);
  }
  private async run(window: AnalysisWindow) {
    this.busy = true;
    this.attempts++;
    const generation = this.generation;
    const request = (this.request = new AbortController());
    this.status = `Analysing played footage / ${this.attempts} of 3`;
    try {
      const batch = await this.transport.analyze(
        this.session,
        window,
        request.signal,
      );
      if (generation !== this.generation) return;
      validateBatch(batch, window);
      const mapping = new Map<string, string>();
      const added: ObservedMoment[] = [];
      for (const moment of batch.moments) {
        const duplicate = this.observed.find((prior) => {
          const overlap =
            Math.min(prior.endSeconds, moment.endSeconds) -
            Math.max(prior.startSeconds, moment.startSeconds);
          return (
            prior.action === moment.action &&
            Math.abs(prior.startSeconds - moment.startSeconds) <= 2 &&
            overlap /
              Math.min(
                prior.endSeconds - prior.startSeconds,
                moment.endSeconds - moment.startSeconds,
              ) >=
              0.6
          );
        });
        mapping.set(moment.id, duplicate?.id ?? moment.id);
        if (!duplicate) {
          this.observed.push(moment);
          added.push(moment);
        }
      }
      // Publish a story only when it is complete and contains distinct moments.
      const story = batch.story.map((s) => ({
        ...s,
        eventId: mapping.get(s.eventId)!,
      }));
      this.publish({
        ...batch,
        moments: added,
        story:
          new Set(story.map((s) => s.eventId)).size === story.length
            ? story
            : [],
      });
      this.received += added.length;
      this.status = `${this.received} draft cards / last analysis ${batch.elapsedSeconds.toFixed(1)}s / review needed`;
      if (this.attempts >= 3)
        this.stop(`${this.received} draft cards / three-window test complete`);
    } catch {
      if (generation === this.generation)
        this.stop("Analysis failed / match continues. Retry when ready.");
    } finally {
      if (generation === this.generation) this.busy = false;
    }
  }
}

export function validateBatch(batch: MomentBatch, expected: AnalysisWindow) {
  const validText = (s: unknown) =>
    typeof s === "string" && s.trim().length > 0 && s.length <= 600;
  if (
    !batch ||
    !batch.window ||
    batch.window.sourceId !== expected.sourceId ||
    batch.window.startSeconds !== expected.startSeconds ||
    batch.window.endSeconds !== expected.endSeconds ||
    !Array.isArray(batch.moments) ||
    batch.moments.length > 8 ||
    !Array.isArray(batch.story) ||
    batch.story.length > 3 ||
    !Number.isFinite(batch.elapsedSeconds) ||
    batch.elapsedSeconds < 0
  )
    throw new Error("Invalid analysis batch");
  const ids = new Set<string>();
  let previous = -Infinity;
  for (const moment of batch.moments) {
    if (
      !/^[a-f0-9]{16}-\d+$/.test(moment.id) ||
      ids.has(moment.id) ||
      !["run", "pass", "cross", "cutback", "shot", "save", "goal"].includes(
        moment.action,
      ) ||
      !Number.isFinite(moment.startSeconds) ||
      !Number.isFinite(moment.endSeconds) ||
      moment.startSeconds < expected.startSeconds ||
      moment.startSeconds < previous ||
      moment.endSeconds > expected.endSeconds ||
      moment.endSeconds <= moment.startSeconds ||
      !validText(moment.spanish) ||
      !validText(moment.english) ||
      !validText(moment.visualEvidence) ||
      typeof moment.commentaryEvidence !== "string" ||
      moment.commentaryEvidence.length > 600 ||
      !/^api\/recognition\/media\/[a-f0-9]{16}\/[a-f0-9]{16}-\d+\.mp4$/.test(
        moment.replayPath,
      )
    )
      throw new Error("Invalid or future observation");
    ids.add(moment.id);
    previous = moment.startSeconds;
  }
  let index = -1;
  for (const scene of batch.story) {
    const next = batch.moments.findIndex((m) => m.id === scene.eventId);
    if (next <= index || !validText(scene.spanish) || !validText(scene.english))
      throw new Error("Invalid story");
    index = next;
  }
}
