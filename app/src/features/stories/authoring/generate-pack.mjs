import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = new URL('../content/barca-2018-opening.json', import.meta.url);
const destination = new URL('../native/commonMain/GeneratedMatchPack.kt', import.meta.url);
const raw = JSON.stringify(JSON.parse(readFileSync(source, 'utf8')), null, 2);
if (raw.includes('"""')) throw new Error('Kotlin raw-string delimiter is not valid content');
const output = `// Generated from content/barca-2018-opening.json. Run authoring/generate-pack.mjs.\npackage com.arenavoca.stories\n\ninternal val matchPackJson = """\n${raw.replaceAll('$', "${'$'}")}\n""".trimIndent()\n`;
if (process.argv.includes('--check')) {
  if (readFileSync(destination, 'utf8') !== output) throw new Error('The native match pack is stale. Run the generator.');
} else {
  writeFileSync(destination, output);
  console.log(`Updated ${fileURLToPath(destination)}`);
}
