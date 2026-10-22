// Real input against the managed IWSDK emulator; never sets CelebrationStatus.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
const output = "content-source/match-analysis/celebration-guides";
mkdirSync(output, { recursive: true });
const evidence = [];
function call(group, command, input = {}, extra = []) {
  const raw = execFileSync(
    "npx",
    [
      "@iwsdk/cli",
      group,
      command,
      "--input-json",
      JSON.stringify(input),
      ...extra,
    ],
    { encoding: "utf8", timeout: 60000 },
  );
  const result = JSON.parse(raw);
  evidence.push({ group, command, input, result });
  writeFileSync(
    `${output}/emulator-inputs.json`,
    JSON.stringify(evidence, null, 2),
  );
  assert.equal(result.ok, true, raw);
  return result.data.result;
}
function query(name, component) {
  const found = call("ecs", "find", { namePattern: `^${name}$`, limit: 1 })
    .entities[0];
  assert.ok(found, `Missing ${name}`);
  return call("ecs", "query", {
    entityIndex: found.entityIndex,
    components: [component],
  }).components[0].values;
}
function state() {
  return query("celebration-state", "CelebrationStatus");
}
function click(name) {
  const p = query(`minimal-target/${name}`, "Transform").position;
  call("xr", "look-at", {
    device: "controller-right",
    target: { x: p[0], y: p[1], z: p[2] },
  });
  call("xr", "select", { device: "controller-right", duration: 0.1 });
}
function pose(side, y) {
  call("xr", "set-transform", {
    device: `controller-${side}`,
    position: { x: side === "left" ? -0.29 : 0.29, y, z: -0.5 },
  });
}
function wait(durationMs) {
  call("browser", "interact", { steps: [{ action: "wait", durationMs }] });
}
assert.equal(
  call("xr", "status").sessionActive,
  true,
  "Enter the managed XR emulator first.",
);
const initial = state();
assert.equal(
  initial.enabled,
  false,
  "Use a fresh page so the opt-in starts disabled.",
);
assert.equal(initial.phase, "idle");
if (!initial.playing) click("minimal-play");
click("minimal-more");
click("minimal-celebration");
assert.equal(state().enabled, true);
pose("left", 1);
pose("right", 1);
call("browser", "screenshot", {}, ["--output-file", `${output}/before.png`]);
click("minimal-celebration-demo");
const invited = state();
assert.equal(invited.phase, "invited");
assert.equal(invited.goalId, "demo");
call("browser", "screenshot", {}, [
  "--output-file",
  `${output}/invitation.png`,
]);
pose("left", 1.58);
const oneHand = state();
assert.equal(oneHand.phase, "invited", "One placed hand must not celebrate.");
assert.equal(oneHand.leftInPlace, true);
assert.equal(oneHand.rightInPlace, false);
call("browser", "screenshot", {}, ["--output-file", `${output}/one-hand.png`]);
pose("right", 1.58);
wait(450);
const complete = state();
assert.equal(complete.phase, "celebrating");
assert.equal(complete.leftInPlace, true);
assert.equal(complete.rightInPlace, true);
assert.equal(complete.holdProgress, 1);
assert.equal(complete.playing, true);
assert.ok(
  complete.recordingSeconds > invited.recordingSeconds,
  "The match must keep advancing.",
);
call("browser", "screenshot", {}, [
  "--output-file",
  `${output}/celebrating.png`,
]);
pose("left", 1);
pose("right", 1);
wait(4200);
assert.equal(state().phase, "idle", "The companion must leave quietly.");
writeFileSync(
  `${output}/emulator-summary.json`,
  JSON.stringify(
    {
      passed: true,
      initial,
      invited,
      oneHand,
      complete,
      final: state(),
      scope:
        "Actual controller input in managed browser emulation. No physical hand-tracking or Quest acceptance.",
    },
    null,
    2,
  ),
);
console.log("Celebration emulator journey passed; match advanced throughout.");
