import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skills = readdirSync(join(root, "skills"), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const frontmatter = (name) => {
  const text = readFileSync(join(root, "skills", name, "SKILL.md"), "utf8");
  const block = /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? "";
  const field = (key) => new RegExp(`^${key}:\\s*(.*)$`, "m").exec(block)?.[1] ?? "";
  return { name: field("name"), description: field("description") };
};

// Limits the Claude app enforces when a skill zip is uploaded.
for (const skill of skills) {
  test(`${skill}: name matches its folder and fits the upload limits`, () => {
    const fm = frontmatter(skill);
    assert.equal(fm.name, skill);
    assert.ok(fm.name.length <= 64);
    assert.ok(fm.description.length > 0, "has a description");
    assert.ok(fm.description.length <= 200, `description is ${fm.description.length} characters, the limit is 200`);
  });
}

test("zip-skills.sh writes one zip per skill with the folder at the zip root", () => {
  const out = mkdtempSync(join(tmpdir(), "zips-"));
  execFileSync("bash", [join(root, "scripts/zip-skills.sh"), out]);
  assert.deepEqual(readdirSync(out).sort(), skills.map((s) => `${s}.zip`).sort());
  for (const skill of skills) {
    const entries = execFileSync("unzip", ["-Z1", join(out, `${skill}.zip`)], { encoding: "utf8" }).trim().split("\n");
    assert.ok(entries.includes(`${skill}/SKILL.md`));
    assert.ok(entries.every((e) => e.startsWith(`${skill}/`)), "nothing sits outside the skill folder");
  }
});

test("the README links a download for every skill", () => {
  const readme = readFileSync(join(root, "README.md"), "utf8");
  for (const skill of skills) {
    assert.ok(readme.includes(`/releases/download/downloads/${skill}.zip`), `${skill}.zip is linked`);
  }
});
