import { assetUrl } from "../content/model";
export function commentaryVolume(muted: boolean, speaking: boolean) {
  return muted ? 0 : speaking ? 0.22 : 1;
}
export class Pronunciation {
  private context?: AudioContext;
  private buffers = new Map<string, AudioBuffer>();
  private source?: AudioBufferSourceNode;
  private generation = 0;
  speaking = false;
  onChange = () => {};
  async preload(id: string, path: string) {
    this.context ??= new AudioContext();
    const response = await fetch(assetUrl(path));
    if (!response.ok)
      throw new Error(
        "Pronunciation could not load. Retry Listen to try again.",
      );
    this.buffers.set(
      id,
      await this.context.decodeAudioData(await response.arrayBuffer()),
    );
  }
  async listen(id: string) {
    this.stop();
    const generation = this.generation;
    const buffer = this.buffers.get(id);
    if (!buffer || !this.context)
      throw new Error("Pronunciation is unavailable. Please retry Listen.");
    await this.context.resume();
    if (generation !== this.generation) return;
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);
    this.source = source;
    this.speaking = true;
    this.onChange();
    source.onended = () => {
      if (this.source === source) {
        this.source = undefined;
        this.speaking = false;
        this.onChange();
      }
    };
    source.start();
  }
  has(id: string) {
    return this.buffers.has(id);
  }
  stop() {
    this.generation++;
    const old = this.source;
    this.source = undefined;
    if (old) {
      old.onended = null;
      old.stop();
      old.disconnect();
    }
    this.speaking = false;
    this.onChange();
  }
  destroy() {
    this.stop();
    void this.context?.close();
  }
}
