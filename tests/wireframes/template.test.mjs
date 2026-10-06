import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { buildPage, loadRules, readModel } from "../../skills/wireframes/scripts/check.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const skill = resolve(here, "../../skills/wireframes");
const template = readFileSync(join(skill, "assets/template.html"), "utf8");
const example = readFileSync(join(skill, "assets/example-content.html"), "utf8");
const checkCli = join(skill, "scripts/check.mjs");

const rules = loadRules(template);

const screen = (over = {}) => ({
  id: "b1",
  k: "B1",
  parent: "",
  name: "Pick a service",
  group: "Owner",
  scope: "required",
  scopeWhy: "",
  reqs: ["BOOK-1"],
  gos: [],
  open: 0,
  hasLede: true,
  bodies: 1,
  ...over,
});

const model = (over = {}) => ({
  project: { name: "Pawline", version: "0.1", date: "2026-10-06" },
  requirements: [{ id: "BOOK-1", text: "An owner can book a groom.", source: "Brief" }],
  journeys: [{ role: "Owner", steps: [{ screen: "B1", text: "Picks a service" }] }],
  screens: [screen()],
  ...over,
});

const messages = (m, level) =>
  rules
    .collectProblems(m)
    .filter((p) => p.level === level)
    .map((p) => p.msg);

test("a clean model has no problems", () => {
  assert.deepEqual(rules.collectProblems(model()), []);
});

test("duplicate screen ids and labels are errors", () => {
  const m = model({ screens: [screen(), screen()] });
  const errors = messages(m, "error");
  assert.ok(errors.some((e) => /id "b1" is used twice/.test(e)));
  assert.ok(errors.some((e) => /label "B1" is used twice/.test(e)));
});

test("a screen missing its name or group is an error", () => {
  const errors = messages(model({ screens: [screen({ name: "", group: "" })] }), "error");
  assert.ok(errors.some((e) => /data-name/.test(e)));
  assert.ok(errors.some((e) => /data-group/.test(e)));
});

test("an unknown scope is an error, a blank scope is a guide page", () => {
  assert.ok(messages(model({ screens: [screen({ scope: "maybe" })] }), "error").length > 0);
  const guide = model({ screens: [screen(), screen({ id: "a1", k: "A1", scope: "", reqs: [] })] });
  assert.deepEqual(rules.collectProblems(guide), []);
});

test("citing a requirement that is not in the list is an error", () => {
  const errors = messages(model({ screens: [screen({ reqs: ["BOOK-1", "BOOK-9"] })] }), "error");
  assert.ok(errors.some((e) => /BOOK-9/.test(e)));
});

test("a journey step or a link pointing at a missing screen is an error", () => {
  const badStep = model({ journeys: [{ role: "Owner", steps: [{ screen: "Z9", text: "" }] }] });
  assert.ok(messages(badStep, "error").some((e) => /Z9/.test(e)));
  const badGo = model({ screens: [screen({ gos: ["nowhere"] })] });
  assert.ok(messages(badGo, "error").some((e) => /nowhere/.test(e)));
});

test("a journey step may name a parent screen", () => {
  const m = model({
    screens: [screen({ id: "b1-1", k: "B1.1", parent: "B1" }), screen({ id: "b1-2", k: "B1.2", parent: "B1" })],
  });
  assert.deepEqual(messages(m, "error"), []);
});

test("a requirement with no id or a repeated id is an error", () => {
  const m = model({
    requirements: [
      { id: "BOOK-1", text: "", source: "" },
      { id: "BOOK-1", text: "", source: "" },
      { id: "", text: "Loose sentence", source: "" },
    ],
  });
  const errors = messages(m, "error");
  assert.ok(errors.some((e) => /BOOK-1 is used twice/.test(e)));
  assert.ok(errors.some((e) => /Loose sentence/.test(e)));
});

test("a screen needs exactly one screen box, and should have an explanation line", () => {
  assert.ok(messages(model({ screens: [screen({ bodies: 0 })] }), "error").some((e) => /exactly one/.test(e)));
  assert.ok(messages(model({ screens: [screen({ hasLede: false })] }), "warn").some((w) => /explanation/.test(w)));
});

test("a missing marker or a stray section is an error", () => {
  assert.ok(messages(model({ missingMarkers: ["<!-- wf:screens -->"] }), "error").some((e) => /wf:screens/.test(e)));
  assert.ok(messages(model({ sectionCount: 2 }), "error").some((e) => /2 <section> tags/.test(e)));
});

test("an uncovered requirement is a warning", () => {
  const m = model({
    requirements: [
      { id: "BOOK-1", text: "", source: "" },
      { id: "BOOK-2", text: "", source: "" },
    ],
  });
  assert.ok(messages(m, "warn").some((w) => /BOOK-2/.test(w)));
});

test("a product screen outside every journey, an extra with no reason, and a required screen citing nothing are warnings", () => {
  const m = model({
    screens: [
      screen(),
      screen({ id: "b2", k: "B2", scope: "needed", reqs: [] }),
      screen({ id: "b3", k: "B3", scope: "extra", reqs: [] }),
      screen({ id: "b4", k: "B4", scope: "required", reqs: [] }),
    ],
    journeys: [{ role: "Owner", steps: [{ screen: "B1" }, { screen: "B4" }] }],
  });
  const warns = messages(m, "warn");
  assert.ok(warns.some((w) => /B2/.test(w) && /journey/.test(w)));
  assert.ok(!warns.some((w) => /B3/.test(w) && /journey/.test(w)), "an extra does not need a journey");
  assert.ok(warns.some((w) => /B3/.test(w) && /reason/.test(w)));
  assert.ok(warns.some((w) => /B4/.test(w) && /requirement/.test(w)));
});

test("coverage lists the screens that show each requirement", () => {
  const m = model({ screens: [screen(), screen({ id: "b2", k: "B2" })] });
  assert.deepEqual(rules.coverage(m), [{ id: "BOOK-1", text: "An owner can book a groom.", source: "Brief", screens: ["B1", "B2"] }]);
});

test("the lean set drops extras and keeps guide pages", () => {
  const screens = [screen(), screen({ id: "x", k: "X1", scope: "extra" }), screen({ id: "a", k: "A1", scope: "" })];
  assert.deepEqual(
    rules.visibleScreens(screens, true).map((s) => s.k),
    ["B1", "A1"],
  );
  assert.equal(rules.visibleScreens(screens, false).length, 3);
});

test("feedback text carries screen labels, comments and sign-off marks", () => {
  const m = model();
  const text = rules.feedbackText(m, { b1: "Move the price above the button" }, { [rules.markKey("Owner", 0)]: "dispute" });
  assert.match(text, /Pawline/);
  assert.match(text, /\[B1\] Pick a service: Move the price above the button/);
  assert.match(text, /Owner, step 1 \(B1\): dispute/);
});

test("feedback text says so when there is nothing to report", () => {
  assert.match(rules.feedbackText(model(), {}, {}), /No feedback/);
});

test("the shipped example fills the template with no errors or warnings", () => {
  const page = buildPage(template, example);
  const m = readModel(page);
  assert.ok(m.screens.length >= 6, "example has a useful number of screens");
  assert.ok(m.requirements.length >= 4);
  assert.ok(m.journeys.length >= 2);
  assert.equal(m.project.name, "Pawline");
  assert.deepEqual(rules.collectProblems(m), []);
});

test("the filled page keeps the markers so more screens can be added later", () => {
  const page = buildPage(template, example);
  for (const marker of ["<!-- wf:requirements -->", "<!-- wf:journeys -->", "<!-- wf:screens -->"]) {
    assert.ok(page.includes(marker), marker);
  }
});

test("the template makes no network requests", () => {
  assert.doesNotMatch(template, /https?:\/\//);
});

test("the check command passes the example and fails a broken file", () => {
  const dir = mkdtempSync(join(tmpdir(), "wf-"));
  const good = join(dir, "good.html");
  writeFileSync(good, buildPage(template, example));
  const out = execFileSync("node", [checkCli, good], { encoding: "utf8" });
  assert.match(out, /0 errors/);

  const bad = join(dir, "bad.html");
  writeFileSync(bad, buildPage(template, example).replace('data-go="b2-1"', 'data-go="missing-screen"'));
  const run = spawnSync("node", [checkCli, bad], { encoding: "utf8" });
  assert.equal(run.status, 1);
  assert.match(run.stdout, /missing-screen/);
});

const page = (screens) => buildPage(template, `<!-- block:screens -->\n${screens}`);
const wf = (attrs, inner = "") =>
  `<section class="wf" ${attrs}><p class="lede">x</p><div class="screen">${inner}</div></section>`;

test("the reader copes with awkward but valid markup", () => {
  const m = readModel(
    page(
      [
        `<section data-who="Maya > phone" data-name='Single "quoted"' class="wf wide" id="s1" data-k="S1" data-group="A &amp;lt; B"><p class="lede">x</p><div class="screen"><span class="btn" data-go='s2'>Go</span></div><aside data-kind="req"><ul><li><code>X-1</code></li></ul></aside><aside class="note" data-kind="req"><ul><li><code>X-2</code></li></ul></aside></section>`,
        `<!-- ${wf('id="gone" data-k="G0" data-name="Cut" data-group="A"')} -->`,
        wf('id="s2" data-k="S2" data-name="Two" data-group="A"'),
      ].join("\n"),
    ),
  );
  assert.deepEqual(
    m.screens.map((s) => s.id),
    ["s1", "s2"],
  );
  const [s1] = m.screens;
  assert.equal(s1.who, "Maya > phone");
  assert.equal(s1.name, 'Single "quoted"');
  assert.equal(s1.group, "A &lt; B");
  assert.deepEqual(s1.gos, ["s2"]);
  assert.deepEqual(s1.reqs, ["X-2"], "an aside without the note class is ignored, as the page ignores it");
  assert.equal(m.sectionCount, 2);
  assert.deepEqual(m.missingMarkers, []);
});

test("the reader finds links written with spaces around = or without quotes", () => {
  const m = readModel(
    page(wf('id="s1" data-k="S1" data-name="One" data-group="A"', '<span data-go = "lost-one">a</span><span data-go=lost-two>b</span>')),
  );
  assert.deepEqual(m.screens[0].gos, ["lost-one", "lost-two"]);
  const errors = messages(m, "error");
  assert.ok(errors.some((e) => /lost-one/.test(e)) && errors.some((e) => /lost-two/.test(e)));
});

test("the reader reports a removed marker and a nested section", () => {
  const nested = readModel(page(wf('id="s1" data-k="S1" data-name="One" data-group="A"', "<section>inner</section>")));
  assert.notEqual(nested.sectionCount, nested.screens.length);
  const cut = readModel(buildPage(template, example).replace("<!-- wf:journeys -->", ""));
  assert.deepEqual(cut.missingMarkers, ["<!-- wf:journeys -->"]);
});

test("the check command prints usage when --example has no path", () => {
  const run = spawnSync("node", [checkCli, "--example"], { encoding: "utf8" });
  assert.equal(run.status, 2);
  assert.match(run.stderr, /Usage/);
});

test("the check command works when run through a symlink", () => {
  const dir = mkdtempSync(join(tmpdir(), "wf-"));
  const link = join(dir, "check.mjs");
  symlinkSync(checkCli, link);
  const out = join(dir, "example.html");
  execFileSync("node", [link, "--example", out]);
  assert.match(execFileSync("node", [link, out], { encoding: "utf8" }), /0 errors, 0 warnings/);
});

test("the check command explains itself when the file is missing", () => {
  const run = spawnSync("node", [checkCli, "/no/such/file.html"], { encoding: "utf8" });
  assert.equal(run.status, 2);
  assert.match(run.stderr, /cannot read/i);
});
