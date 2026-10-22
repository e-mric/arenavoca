import type {Sequence} from './learning';
export interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
export class LocalProgress {
  private writes = Promise.resolve();
  constructor(private sequence: Sequence, private storage: Storage) {}
  private key(part: string) {
    return `arenavoca.vega.v1.${this.sequence.id}.${part}`;
  }
  async read() {
    const [rawSaved, rawPosition] = await Promise.all([
      this.storage.getItem(this.key('saved')),
      this.storage.getItem(this.key('position')),
    ]);
    const saved: unknown = rawSaved ? JSON.parse(rawSaved) : [];
    const ids = this.sequence.moments.map((m) => m.id);
    const position = Number(rawPosition);
    return {
      saved: Array.isArray(saved)
        ? saved.filter(
            (id): id is string => typeof id === 'string' && ids.includes(id),
          )
        : [],
      position: Number.isFinite(position)
        ? Math.max(0, Math.min(position, this.sequence.duration))
        : 0,
    };
  }
  private write(part: string, value: unknown) {
    const write = this.writes
      .catch(() => {})
      .then(() => this.storage.setItem(this.key(part), JSON.stringify(value)));
    this.writes = write;
    return write;
  }
  save(ids: string[]) {
    return this.write('saved', ids);
  }
  position(seconds: number) {
    return this.write('position', seconds);
  }
}
