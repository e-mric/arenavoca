import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";

test("offline recognition validates evidence, time ranges and provider failures", () => {
  const result = execFileSync(
    "python3",
    ["-m", "unittest", "-v", "test_recognize.py", "test_serve.py"],
    {
      cwd: fileURLToPath(new URL(".", import.meta.url)),
      encoding: "utf8",
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  expect(result).toBe("");
});
