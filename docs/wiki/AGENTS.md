# Maintaining the ArenaVoca wiki

Read [index.md](index.md) first, then only pages relevant to the task. This directory contains synthesis; the PRD defines product requirements, feature READMEs define setup, and dated experiment reports hold evidence.

- Keep one topic per page, with a descriptive title, `Reviewed: YYYY-MM-DD`, links to sources, and explicit unresolved questions. Update the date only after checking the claims against their sources.
- Distinguish decisions, implementation, automated verification, device observations, research findings, and hypotheses. Name the device or test scope. A corrected example is separate from raw model output; one successful clip is separate from a benchmark.
- Ingest: read the source, update relevant existing pages, link any new page from the index, and append a dated entry to log.md. Preserve raw evidence; link to canonical docs rather than reproducing their configuration, commands, deadlines, or full checklists.
- Query: answer from the relevant pages and their sources. When asked to retain a useful finding, add its evidence and uncertainty to the existing topic page, then log the update.
- Lint: check relative links, index coverage, stale claims, contradictions, missing provenance, and open questions. Record material discrepancies rather than silently choosing whichever account sounds plausible.
- Use repository-relative Markdown links so the wiki works on Windows, macOS, and GitHub. Keep secrets, local recording files, model weights, and extracted frames outside Git. Describe missing private evidence and its canonical location without copying it here.
- Log entries are append-only with `## [YYYY-MM-DD] ingest | ...`, `query | ...`, or `lint | ...`. Correct earlier conclusions in a new entry and update the topic page.
- Before finishing, verify every new local link resolves, every topic is indexed, and every claimed result has a source and scope. Report checks actually performed; documentation edits do not establish device acceptance.

For a learning entry, use **What we expected → what happened → what we learned → evidence → next check**. Record the user's own explanation when available; distinguish it from an AI-written summary of project lessons.
