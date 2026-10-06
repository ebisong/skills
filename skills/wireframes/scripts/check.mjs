#!/usr/bin/env node
// Checks a wireframe file built from assets/template.html.
//
//   node check.mjs path/to/index.html     report errors and warnings, exit 1 on errors
//   node check.mjs --example out.html     write the finished Pawline example to out.html
//
// Node built-ins only. The rules are read from this skill's own assets/template.html
// (between the wf:rules markers), the same code the page runs for its "File checks".
// Nothing from the file being checked is ever executed.
import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const MARKERS = { requirements: "<!-- wf:requirements -->", journeys: "<!-- wf:journeys -->", screens: "<!-- wf:screens -->" };
// Attributes of a tag, allowing ">" inside quoted values.
const ATTRS = `((?:"[^"]*"|'[^']*'|[^>"'])*)`;

const decode = (t) =>
  t.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const text = (html) => decode(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
const attr = (attrs, name) => {
  const m = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`).exec(attrs);
  return m ? decode(m[1] ?? m[2] ?? m[3]) : "";
};
const hasClass = (attrs, name) => attr(attrs, "class").split(/\s+/).includes(name);
/** Every `<tag ...>body</tag>` in html, as { attrs, body }. Does not handle a tag nested in itself. */
const elements = (html, tag) =>
  [...html.matchAll(new RegExp(`<${tag}\\b${ATTRS}>([\\s\\S]*?)</${tag}>`, "g"))].map((m) => ({ attrs: m[1], body: m[2] }));
/** The content between an opening tag with the given id and a marker, with comments removed. */
const block = (html, id, marker) => {
  const open = new RegExp(`<\\w+\\b[^>]*\\bid="${id}"`).exec(html);
  const end = html.indexOf(marker);
  if (!open || end < open.index) return "";
  return html.slice(html.indexOf(">", open.index) + 1, end).replace(/<!--[\s\S]*?-->/g, "");
};

/**
 * Pull the pure rule functions out of the template. Only pass this skill's own
 * template.html: the block is evaluated as code.
 *
 * @param {string} html contents of assets/template.html
 * @returns {{collectProblems: Function, coverage: Function, visibleScreens: Function, feedbackText: Function, markKey: Function}}
 */
export function loadRules(html) {
  const m = /\/\* wf:rules:start[\s\S]*?\*\/([\s\S]*?)\/\* wf:rules:end \*\//.exec(html);
  if (!m) throw new Error("template.html has no wf:rules block.");
  return new Function(`${m[1]}; return { collectProblems, coverage, visibleScreens, feedbackText, markKey };`)();
}

function readScreen({ attrs, body }) {
  const notes = elements(body, "aside").filter((n) => hasClass(n.attrs, "note"));
  const ofKind = (kind) => notes.filter((n) => attr(n.attrs, "data-kind") === kind).map((n) => n.body);
  const reqs = ofKind("req").flatMap((n) => elements(n, "code").map((c) => text(c.body)));
  const opening = (tag, cls) => [...body.matchAll(new RegExp(`<${tag}\\b${ATTRS}>`, "g"))].filter((m) => hasClass(m[1], cls));
  return {
    id: attr(attrs, "id"),
    k: attr(attrs, "data-k"),
    parent: attr(attrs, "data-parent"),
    name: attr(attrs, "data-name"),
    who: attr(attrs, "data-who"),
    group: attr(attrs, "data-group"),
    scope: attr(attrs, "data-scope"),
    scopeWhy: attr(attrs, "data-scope-why"),
    reqs: [...new Set(reqs)],
    gos: [...body.matchAll(new RegExp(`<\\w+\\b${ATTRS}>`, "g"))].map((m) => attr(m[1], "data-go")).filter(Boolean),
    open: ofKind("open").reduce((n, note) => n + (note.match(/<li\b/g) || []).length, 0),
    hasLede: opening("p", "lede").length > 0,
    bodies: opening("div", "screen").length,
  };
}

/**
 * Read the project, requirements, journeys and screens out of a wireframe file.
 *
 * @param {string} html a file built from template.html
 * @returns {{project: object, requirements: object[], journeys: object[], screens: object[], sectionCount: number, missingMarkers: string[]}}
 */
export function readModel(html) {
  const projectAttrs = new RegExp(`<div\\b${ATTRS}>`, "g");
  const projectTag = [...html.matchAll(projectAttrs)].find((m) => attr(m[1], "id") === "wf-project")?.[1] ?? "";
  const project = {
    name: attr(projectTag, "data-name"),
    client: attr(projectTag, "data-client"),
    version: attr(projectTag, "data-version"),
    date: attr(projectTag, "data-date"),
  };

  const requirements = elements(block(html, "wf-requirements", MARKERS.requirements), "li").map((li) => ({
    id: attr(li.attrs, "data-id"),
    text: text(li.body),
    source: attr(li.attrs, "data-source"),
  }));

  const journeys = elements(block(html, "wf-journeys", MARKERS.journeys), "ol").map((ol) => ({
    role: attr(ol.attrs, "data-role"),
    steps: elements(ol.body, "li").map((li) => ({ screen: attr(li.attrs, "data-screen"), text: text(li.body) })),
  }));

  const screenBlock = block(html, "wf-screens", MARKERS.screens);
  const screens = elements(screenBlock, "section")
    .filter((s) => hasClass(s.attrs, "wf"))
    .map(readScreen);

  return {
    project,
    requirements,
    journeys,
    screens,
    sectionCount: (screenBlock.match(/<section\b/g) || []).length,
    missingMarkers: Object.values(MARKERS).filter((marker) => !html.includes(marker)),
  };
}

/**
 * Fill the template from a content file that uses "block:" comments
 * (see assets/example-content.html).
 *
 * @param {string} template contents of template.html
 * @param {string} content contents of a block file
 * @returns {string} a complete wireframe page
 */
export function buildPage(template, content) {
  const part = (name) => {
    const m = new RegExp(`<!-- block:${name} -->([\\s\\S]*?)(?=<!-- block:|$)`).exec(content);
    return m ? m[1].trim() : "";
  };
  let page = template;
  const project = part("project");
  if (project) page = page.replace(/<div id="wf-project"[\s\S]*?<\/div>/, () => project);
  for (const [name, marker] of Object.entries(MARKERS)) {
    page = page.replace(marker, () => `${part(name)}\n${marker}`);
  }
  return page;
}

const assets = join(dirname(fileURLToPath(import.meta.url)), "../assets");
const shippedTemplate = () => readFileSync(join(assets, "template.html"), "utf8");

function printReport(model, rules) {
  const problems = rules.collectProblems(model);
  const errors = problems.filter((p) => p.level === "error");
  const warnings = problems.filter((p) => p.level === "warn");
  const covered = rules.coverage(model).filter((r) => r.screens.length).length;
  const lean = rules.visibleScreens(model.screens, true).length;
  const open = model.screens.reduce((n, s) => n + s.open, 0);

  console.log(`${model.project.name}: ${model.screens.length} screens (${lean} in the lean set)`);
  console.log(`Requirements shown: ${covered} of ${model.requirements.length}. Open decisions: ${open}.`);
  for (const p of errors) console.log(`ERROR  ${p.msg}`);
  for (const p of warnings) console.log(`warn   ${p.msg}`);
  console.log(`${errors.length} errors, ${warnings.length} warnings`);
  return errors.length ? 1 : 0;
}

function main(args) {
  const [first, second] = args;
  if (!first || (first === "--example" && !second)) {
    console.error("Usage: node check.mjs <wireframes.html> | --example <out.html>");
    return 2;
  }
  if (first === "--example") {
    writeFileSync(second, buildPage(shippedTemplate(), readFileSync(join(assets, "example-content.html"), "utf8")));
    console.log(`Wrote the Pawline example to ${second}`);
    return 0;
  }
  let html;
  try {
    html = readFileSync(first, "utf8");
  } catch (e) {
    console.error(`Cannot read ${first}: ${e.message}`);
    return 2;
  }
  return printReport(readModel(html), loadRules(shippedTemplate()));
}

const isMain = () => {
  try {
    return realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
};

if (isMain()) process.exitCode = main(process.argv.slice(2));
