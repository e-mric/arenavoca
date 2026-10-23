const {execFileSync} = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.resolve(__dirname, '..');
function verifyPackage(file, sequence) {
  const entries = execFileSync('tar', ['-tf', file], {encoding: 'utf8'})
    .trim()
    .split('\n');
  const expected = [
    'match.mp4',
    'end-frame.jpg',
    ...sequence.moments.map((m) => m.artwork + '.png'),
  ];
  for (const name of expected) {
    const entry = 'bundle/assets/generated/' + name;
    if (!entries.includes(entry))
      throw Error('Missing packaged asset: ' + entry);
    const packaged = execFileSync('tar', ['-xOf', file, entry], {
      maxBuffer: 128 * 1024 * 1024,
    });
    const staged = fs.readFileSync(path.join(root, 'generated', name));
    const hash = (data) =>
      crypto.createHash('sha256').update(data).digest('hex');
    if (hash(packaged) !== hash(staged))
      throw Error('Stale packaged asset: ' + entry);
  }
  if (entries.filter((e) => e.endsWith('.mp4')).length !== 1)
    throw Error('Unexpected video in package');
  // Stale assets from earlier builds can survive in build/; package only staged files.
  const staged = new Set(fs.readdirSync(path.join(root, 'generated')));
  const stale = entries.filter(
    (e) => e.startsWith('bundle/assets/generated/') &&
      !staged.has(e.slice('bundle/assets/generated/'.length)),
  );
  if (stale.length) throw Error('Unstaged assets in package (delete build/ and rebuild): ' + stale.join(', '));
  console.log('Verified package media and artwork: ' + sequence.id);
}
module.exports = {verifyPackage};
