// Deliberately limited to repository Markdown links and basic formatting.
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, dirname, extname } from "node:path";

const guidance = [
  "AGENTS.md",
  "README.md",
  "docs/index.md",
  "docs/project-state.md",
  "docs/AI_COLLABORATION.md",
  "docs/chat-starters.md",
  "docs/wiki/AGENTS.md",
  "docs/wiki/index.md",
  "docs/wiki/architecture.md",
];
const files = [...new Set([...guidance, ...process.argv.slice(2)])];
let errors = 0;
let links = 0;
const fail = (file, message) => {
  console.error(`${file}: ${message}`);
  errors++;
};
const withoutCode = (text) =>
  text.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, "");
function anchors(text) {
  const seen = new Map();
  const ids = new Set();
  for (const match of withoutCode(text).matchAll(/^#{1,6}\s+(.+?)\s*#*$/gm)) {
    const base = match[1]
      .toLowerCase()
      .replace(/<[^>]*>/g, "")
      .replace(/[^\p{L}\p{N}\p{M}_\-\s]/gu, "")
      .replace(/\s/g, "-");
    const count = seen.get(base) ?? 0;
    ids.add(count ? `${base}-${count}` : base);
    seen.set(base, count + 1);
  }
  for (const match of text.matchAll(/(?:id|name)=["']([^"']+)["']/g))
    ids.add(match[1]);
  return ids;
}
for (const file of files) {
  if (!existsSync(file)) {
    fail(file, "file missing");
    continue;
  }
  const raw = readFileSync(file, "utf8");
  if (!raw.endsWith("\n")) fail(file, "missing final newline");
  if (
    raw.split(/\r?\n/).some((line) => {
      const tail = line.match(/[ \t]+$/)?.[0];
      return tail && tail !== "  "; // Two spaces are a valid Markdown hard break.
    })
  )
    fail(file, "trailing whitespace");
  const text = withoutCode(raw);
  // Inline links/images and reference definitions; repository docs use these forms.
  const destinations = [
    ...[
      ...text.matchAll(/!?\[[^\]\n]*\]\((<[^>]+>|[^\s)]+)(?:\s+"[^"]*")?\)/g),
    ].map((m) => m[1]),
    ...[...text.matchAll(/^\s*\[[^\]]+\]:\s*(\S+)/gm)].map((m) => m[1]),
  ];
  for (let destination of destinations) {
    destination = destination.replace(/^<|>$/g, "");
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(destination)) continue;
    const [path, fragment] = destination.split("#");
    const target = path
      ? resolve(dirname(file), decodeURIComponent(path.split("?")[0]))
      : resolve(file);
    links++;
    if (!existsSync(target)) {
      fail(file, `missing link target: ${destination}`);
      continue;
    }
    if (
      fragment &&
      extname(target) === ".md" &&
      statSync(target).isFile() &&
      !anchors(readFileSync(target, "utf8")).has(decodeURIComponent(fragment))
    ) {
      fail(file, `missing heading: ${destination}`);
    }
  }
}
if (errors) process.exitCode = 1;
else
  console.log(
    `Documentation checks passed: ${files.length} files, ${links} local links/anchors. Review facts and external links separately.`,
  );
