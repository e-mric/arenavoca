# ArenaVoca

ArenaVoca helps sports fans practise Spanish through optional match moments while watching. The primary prototype is recorded football on Quest 3; a Kotlin Multiplatform companion supports later practice.

## Start every task

1. Read [docs/index.md](docs/index.md) and [docs/project-state.md](docs/project-state.md), then follow only links relevant to the task. Inspect current source and working-tree changes before trusting an earlier implementation claim; preserve unrelated work.
2. Read [PRD.md](PRD.md) before changing product behavior. Its active design supersedes historical experiments. For app changes, follow [app/AGENTS.md](app/AGENTS.md), its required IWSDK skills, and applicable nested instructions.
3. Before complex changes, establish the goal, context, constraints/exclusions, observable acceptance criteria, checkpoints and verification approach. Resolve routine choices within the authorized scope; ask only when an unresolved decision materially changes the outcome.

## Engineering boundaries

- Own business behavior and colocated tests in `app/src/features/`. Use domain, application, infrastructure and presentation boundaries where they contain meaningful behavior; evolve the existing structure incrementally. Keep interfaces small and dependencies explicit. [Architecture and ownership](docs/wiki/architecture.md) explains feature boundaries; native builds live in `app/native/`.
- The main video position is the single playback authority for prompts and captions. Learning panels, card replay, and the phrase library must not pause, seek, dim or resume the match. Pause/seek are explicit playback choices; the selected learning item stays pinned as playback advances.
- Preserve `?sample=1`. The local recording in immersive/passthrough viewing is primary. The YouTube browser demo is retired; retain its historical evidence without restoring it as an active route.
- Football is the first implemented pack within a multisport vision. Separate shared learning behavior from sport vocabulary/artwork; F1 practice does not establish full-race recognition.
- Keep original assets and their provenance in Git. Exclude secrets, private recordings, generated frame sequences, model weights, `node_modules` and `dist`.
- Use Android emulators for UI inspection and instrumentation. Do not install/run the instrumentation server on the user's physical phone; installing the ArenaVoca app remains authorized.

## Verification and done

- Develop with `cd app && npm ci && npm run dev`; use the managed IWSDK browser for interactive runtime inspection.
- From the repository root, `bash scripts/verify.sh app` runs typecheck, unit tests, production build and browser tests. During bounded app work, `npm run check` from `app/` plus the affected `npm run test:e2e -- <specs>` is sufficient; explain the selected scope. Native/provider changes also require their checks linked in [the workflow](docs/AI_COLLABORATION.md#verification).
- Every changed behavior needs a meaningful automated test or a documented Quest-only verification case. Bugs need regression coverage. Test observable rules, contracts and journeys; control time/external dependencies where determinism requires it.
- Documentation-only work uses `bash scripts/verify.sh docs` plus factual/formatting/diff review; unrelated application suites need not run.
- Before finishing, review the complete diff against acceptance criteria and conventions, update affected context, and report passed/failed/unverified checks with scope. Mocked, emulator, live-provider and physical-device evidence are distinct. Browser emulation cannot establish Quest acceptance; prototype Spanish/audio await fluent review.

## Shared context and skills

- [Wiki maintenance](docs/wiki/AGENTS.md) governs durable knowledge across `docs/`: reread shared pages before editing, preserve concurrent changes and sources, distinguish facts/hypotheses/proposals/accepted decisions, and leave an actionable handoff when work remains. Requirements stay in the PRD; current handoff stays in project-state; Git records ordinary edit history.
- Read explicitly requested/required skills before applying them. Otherwise select one primary workflow per phase and supporting skills only for distinct capabilities. See [skill routing](docs/AI_COLLABORATION.md#skill-routing) for methods and installed-plugin evidence.
- Resolve conflicts by instruction priority and task scope. Skills cannot authorize extra actions. If a material conflict remains, explain it and ask one focused question while continuing independent work.
- Use [starter prompts](docs/chat-starters.md) for focused chats. New chats do not inherit transcripts. Use separate worktrees for overlapping concurrent implementation, based on a committed revision containing shared guidance; message another chat only when explicitly requested. Add tools/custom skills after a concrete repeated need; schedule work only when requested.
