import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

function fixture(run) {
  const dir = mkdtempSync(join(tmpdir(), "arenavoca-docs-"));
  try {
    run(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("documentation checker rejects broken links, anchors and formatting", () => {
  fixture((dir) => {
    const file = join(dir, "fixture.md");
    for (const [content, message] of [
      ["[Missing](missing.md)\n", "missing link target"],
      ["[Missing](#missing)\n", "missing heading"],
      ["Missing newline", "missing final newline"],
      ["Trailing space \n", "trailing whitespace"],
    ]) {
      writeFileSync(file, content);
      const result = spawnSync(
        process.execPath,
        ["scripts/check-docs.mjs", file],
        { encoding: "utf8" },
      );
      assert.equal(result.status, 1);
      assert.ok(result.stderr.includes(message), result.stderr);
    }
  });
});

test("documentation checker accepts Unicode/duplicate headings and ignores code examples", () => {
  fixture((dir) => {
    const file = join(dir, "fixture.md");
    writeFileSync(
      file,
      "# Café\n\n# Café\n\n[First](#café)  \n[Second](#café-1)\n\n```md\n[Example](absent.md)\n```\n",
    );
    const result = spawnSync(
      process.execPath,
      ["scripts/check-docs.mjs", file],
      { encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);
  });
});

test("verification wrapper forwards browser scope and stops on failed app checks", () => {
  fixture((dir) => {
    const log = join(dir, "calls");
    writeFileSync(
      join(dir, "npm"),
      '#!/bin/sh\nprintf "%s\\n" "$*" >> "$VERIFY_TEST_LOG"\nif [ "$2" = check ]; then exit "${VERIFY_TEST_FAIL:-0}"; fi\n',
      { mode: 0o755 },
    );
    const env = {
      ...process.env,
      PATH: `${dir}:${process.env.PATH}`,
      VERIFY_TEST_LOG: log,
    };
    let result = spawnSync(
      "bash",
      ["scripts/verify.sh", "app", "tests/e2e/launcher.spec.ts"],
      { env },
    );
    assert.equal(result.status, 0);
    assert.equal(
      readFileSync(log, "utf8"),
      "run check\nrun test:e2e -- tests/e2e/launcher.spec.ts\n",
    );
    rmSync(log);
    result = spawnSync("bash", ["scripts/verify.sh", "app"], {
      env: { ...env, VERIFY_TEST_FAIL: "7" },
    });
    assert.equal(result.status, 7);
    assert.equal(readFileSync(log, "utf8"), "run check\n");
  });
});

test("verification wrapper rejects an unknown mode", () => {
  assert.equal(spawnSync("bash", ["scripts/verify.sh", "unknown"]).status, 2);
});
