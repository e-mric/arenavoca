import { coachContextMessage, type CoachContext } from "./context";
export type CoachMode = "voice" | "text";
export interface CoachConnection {
  endSession(): Promise<void>;
  setMicMuted(muted: boolean): void;
  sendContextualUpdate(text: string): void;
  sendUserMessage(text: string): void;
}
export interface CoachEvents {
  message(source: "user" | "ai", text: string): void;
  speaking(value: boolean): void;
  disconnected(): void;
  error(): void;
}
export type CoachConnect = (
  mode: CoachMode,
  events: CoachEvents,
) => Promise<CoachConnection>;
export const coachRequests = {
  explain:
    "Explain the selected Spanish phrase in English, with one short sports example.",
  slow: "Say the selected Spanish phrase slowly, in short chunks with pauses. Then say it once naturally. No extra explanation.",
  practice:
    "Let me try: ask me one simple question in Spanish using the selected phrase. Wait for my answer.",
  spanish:
    "From now on, use simple Spanish. Explain the selected phrase briefly in simple Spanish.",
};
/** Owns only the invited conversation. It cannot control match playback. */
export class Coach {
  open = false;
  phase: "off" | "connecting" | "ready" | "error" = "off";
  mode: CoachMode = "voice";
  listening = false;
  speaking = false;
  reply = "";
  heard = "";
  notice = "";
  context?: CoachContext;
  onChange = () => {};
  beforeStart = () => {};
  private connection?: CoachConnection;
  private generation = 0;
  private micTimer?: ReturnType<typeof setTimeout>;
  private sessionTimer?: ReturnType<typeof setTimeout>;
  private connectTimer?: ReturnType<typeof setTimeout>;
  constructor(private connect: CoachConnect) {}
  get ducking() {
    return this.mode === "voice" && (this.listening || this.speaking);
  }
  get status() {
    if (this.phase === "connecting") return "Connecting / microphone muted";
    if (this.phase === "error")
      return "Connection unavailable / try text or retry";
    if (this.phase === "off") return "Disconnected / microphone off";
    if (this.mode === "text") return "Text coach / no microphone";
    if (this.listening) return "Listening / tap Done when finished";
    if (this.speaking) return "Coach speaking / microphone muted";
    return "Ready / microphone muted";
  }
  show(context: CoachContext) {
    this.stop();
    this.context = { ...context };
    this.reply = "";
    this.heard = "";
    this.notice = "";
    this.open = true;
    this.onChange();
  }
  close() {
    this.open = false;
    this.stop();
    this.reply = "";
    this.heard = "";
  }
  async start(mode: CoachMode) {
    if (
      !this.open ||
      !this.context ||
      this.phase === "connecting" ||
      this.phase === "ready"
    )
      return;
    this.beforeStart();
    const generation = ++this.generation;
    const current = () => generation === this.generation;
    this.mode = mode;
    this.phase = "connecting";
    this.notice = "";
    this.onChange();
    this.connectTimer = setTimeout(() => {
      if (current()) this.fail();
    }, 20000);
    try {
      const connection = await this.connect(mode, {
        message: (source, text) => {
          if (!current()) return;
          if (source === "user") {
            this.heard = text;
            this.mute();
          } else this.reply = text;
          this.onChange();
        },
        speaking: (value) => {
          if (!current()) return;
          this.speaking = value;
          if (value) this.mute();
          this.onChange();
        },
        disconnected: () => {
          if (current()) {
            this.stop();
            this.notice = "Session ended. Start again whenever you like.";
            this.onChange();
          }
        },
        error: () => {
          if (current()) this.fail();
        },
      });
      if (!current()) {
        await connection.endSession();
        return;
      }
      clearTimeout(this.connectTimer);
      this.connection = connection;
      if (mode === "voice") connection.setMicMuted(true);
      connection.sendContextualUpdate(coachContextMessage(this.context));
      this.phase = "ready";
      this.sessionTimer = setTimeout(() => {
        this.stop();
        this.notice = "Five-minute session ended. Start again to continue.";
        this.onChange();
      }, 300000);
      this.onChange();
    } catch {
      if (current()) this.fail();
    }
  }
  ask(request: keyof typeof coachRequests | string) {
    if (!this.connection || this.phase !== "ready") return;
    this.mute();
    const message =
      request in coachRequests
        ? coachRequests[request as keyof typeof coachRequests]
        : request.trim().slice(0, 500);
    if (!message) return;
    try {
      this.connection.sendUserMessage(message);
      this.heard = message;
      this.onChange();
    } catch {
      this.fail();
    }
  }
  toggleMic() {
    if (
      !this.connection ||
      this.phase !== "ready" ||
      this.mode !== "voice" ||
      this.speaking
    )
      return;
    if (this.listening) this.mute();
    else {
      try {
        this.connection.setMicMuted(false);
        this.listening = true;
        this.micTimer = setTimeout(() => {
          this.mute();
          this.onChange();
        }, 15000);
      } catch {
        this.fail();
      }
    }
    this.onChange();
  }
  private mute() {
    clearTimeout(this.micTimer);
    this.listening = false;
    try {
      if (this.mode === "voice") this.connection?.setMicMuted(true);
    } catch {
      /* teardown still releases the connection */
    }
  }
  stop() {
    this.generation++;
    this.mute();
    clearTimeout(this.sessionTimer);
    clearTimeout(this.connectTimer);
    const connection = this.connection;
    this.connection = undefined;
    this.phase = "off";
    this.speaking = false;
    if (connection) void connection.endSession().catch(() => {});
    this.onChange();
  }
  private fail() {
    this.stop();
    this.phase = "error";
    this.notice =
      "Check your connection or microphone permission. The match is still available.";
    this.onChange();
  }
}
