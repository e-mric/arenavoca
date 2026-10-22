import {describe, it, expect, vi} from 'vitest';
import {Learning, recallChoices, type Sequence} from './learning';
import {LocalProgress} from './storage';
const sequence: Sequence = {
  id: 'match-a',
  title: 'A',
  details: 'Prepared',
  duration: 36,
  moments: [
    {
      id: 'run',
      title: 'Run',
      spanish: 'Corre.',
      english: 'Runs.',
      end: 6,
      artwork: 'run',
    },
    {
      id: 'pass',
      title: 'Pass',
      spanish: 'Pasa.',
      english: 'Passes.',
      end: 9,
      artwork: 'pass',
    },
    {
      id: 'goal',
      title: 'Goal',
      spanish: 'Marca.',
      english: 'Scores.',
      end: 14,
      artwork: 'goal',
    },
  ],
};
describe('Vega learning alongside playback', () => {
  it('unlocks only completed source windows and never opens a card on arrival', () => {
    const l = new Learning(sequence);
    l.observe(5.99);
    expect(l.open('run')).toBe(false);
    expect(l.available).toHaveLength(0);
    l.observe(6);
    expect(l.available.map((m) => m.id)).toEqual(['run']);
    expect(l.selected).toBeNull();
    expect(l.open('pass')).toBe(false);
  });
  it('pins a translated selection as later cards arrive without changing playback time', () => {
    const l = new Learning(sequence);
    l.observe(9);
    l.open('pass');
    l.flip();
    l.observe(15);
    expect(l.selected?.id).toBe('pass');
    expect(l.translated).toBe(true);
    expect(l.available).toHaveLength(3);
    l.close();
    expect(l.position).toBe(15);
    expect(l.translated).toBe(false);
  });
  it('gates rewound moments but allows explicitly saved cards only within this sequence', () => {
    const l = new Learning(sequence);
    l.observe(20);
    l.open('pass');
    l.observe(1);
    expect(l.selected?.id).toBe('pass');
    l.close();
    expect(l.open('pass')).toBe(false);
    expect(l.open('pass', ['pass'])).toBe(true);
    expect(l.open('foreign', ['foreign'])).toBe(false);
    expect(l.position).toBe(1);
  });
  it('ignores invalid observations and clamps source bounds', () => {
    const l = new Learning(sequence);
    l.observe(8);
    l.observe(NaN);
    expect(l.position).toBe(8);
    l.observe(-3);
    expect(l.position).toBe(0);
    l.observe(99);
    expect(l.position).toBe(36);
  });
});
describe('Vega local progress', () => {
  const memory = () => {
    const data = new Map<string, string>();
    return {
      getItem: async (k: string) => data.get(k) ?? null,
      setItem: async (k: string, v: string) => {
        data.set(k, v);
      },
    };
  };
  it('persists save and position across instances without mixing sequences', async () => {
    const storage = memory(),
      a = new LocalProgress(sequence, storage);
    await a.save(['pass', 'foreign']);
    await a.position(10);
    expect(await new LocalProgress(sequence, storage).read()).toEqual({
      saved: ['pass'],
      position: 10,
    });
    expect(
      await new LocalProgress({...sequence, id: 'match-b'}, storage).read(),
    ).toEqual({saved: [], position: 0});
  });
  it('reports a failed write and allows a later retry', async () => {
    const storage = memory();
    const setItem = vi
      .fn(storage.setItem)
      .mockRejectedValueOnce(Error('disk full'));
    const p = new LocalProgress(sequence, {...storage, setItem});
    await expect(p.save(['pass'])).rejects.toThrow('disk full');
    await p.save(['pass']);
    expect((await p.read()).saved).toEqual(['pass']);
  });
  it('reports malformed storage instead of claiming successfully restored progress', async () => {
    const p = new LocalProgress(sequence, {
      getItem: async () => '{bad',
      setItem: async () => {},
    });
    await expect(p.read()).rejects.toThrow();
  });
});

it('recall distractors do not expose later match events', () => {
  const choices = recallChoices(sequence.moments[0]);
  expect(choices).toHaveLength(3);
  expect(choices).toContain('Runs.');
  expect(choices).not.toContain('Scores.');
  expect(choices).not.toContain('Passes.');
});
