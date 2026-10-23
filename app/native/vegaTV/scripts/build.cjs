const {spawnSync} = require('child_process');
const {verifyPackage} = require('./verify-package.cjs');
const path = require('path');
const {prepare} = require('./prepare.cjs');
const debug = process.argv.includes('--debug');
// Restore the local-recording default even if compilation fails.
try {
  const sequence = prepare(process.argv.includes('--youtube'));
  const result = spawnSync(
    'npx',
    [
      'react-native',
      'build-vega',
      '--build-type',
      debug ? 'Debug' : 'Release',
      '--reset-cache',
      '--target',
      'aarch64',
      '--max-workers',
      '4',
    ],
    {stdio: 'inherit'},
  );
  process.exitCode = result.status ?? 1;
  if (process.exitCode === 0)
    verifyPackage(
      path.resolve(
        'build/aarch64-' +
          (debug ? 'debug' : 'release') +
          '/arenavocatv_aarch64.vpkg',
      ),
      sequence,
    );
} finally {
  prepare(false);
}
