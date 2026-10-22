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
  console.log('Verified package media and artwork: ' + sequence.id);
}
module.exports = {verifyPackage};
