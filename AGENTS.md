# ArenaVoca — Fire TV branch

`main` holds only the Amazon Fire TV (Vega) entry. Other platforms (Quest XR,
mobile companion, Android TV, recognition experiments) and their product/wiki docs
live on the `full-project` branch; do not reintroduce them here.

- Start with [README.md](README.md), [SUBMISSION.md](SUBMISSION.md) and the
  [Vega guide](app/src/features/tv-learning/vega/README.md).
- The main video position is the single playback authority. Learning panels,
  saves and recall must not pause, seek or resume the match; Play/Pause and
  Restart are explicit playback choices.
- Keep behaviour and its tests in `app/src/features/tv-learning/vega/`; packaging
  stays in `app/native/vegaTV/`. Keep the full match recording, secrets,
  `node_modules`, `generated/` and `build/` out of Git. Only the tracked 36-second
  clip and the prebuilt release `.vpkg` are binary media/build outputs here.
- Verify with `npm test` (root), `vega exec npm run typecheck` and
  `vega exec npm run build:release` in `app/native/vegaTV`, plus the simulator
  journey for behaviour changes. If app code changes, rebuild and replace the
  prebuilt `.vpkg` and its SHA-256 in SUBMISSION.md.
- Report simulator evidence separately from physical Fire TV; Spanish awaits
  fluent review.
