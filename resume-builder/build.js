#!/usr/bin/env node
// Renders a resume.json into an ATS-friendly one-page resume.docx next to it.
// Usage: node resume-builder/build.js runs/packets/<company>-<role>/resume.json
// ATS-friendly means: one column, no tables or text boxes, standard section headings,
// contact info in the body (not a header), real text everywhere.

const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, TabStopType,
  BorderStyle, LevelFormat,
} = require("docx");

const inPath = process.argv[2];
if (!inPath) {
  console.error("Usage: node resume-builder/build.js <path/to/resume.json>");
  process.exit(1);
}
const r = JSON.parse(fs.readFileSync(inPath, "utf8"));

const problems = [];
if (!r.name) problems.push("missing \"name\"");
const leftover = JSON.stringify(r).match(/\{\{[^}]*\}\}|\[CONFIRM[^\]]*\]/g);
if (leftover) problems.push("unfilled placeholders or [CONFIRM] markers: " + leftover.join(", "));
if (problems.length) {
  console.error("resume.json not ready: " + problems.join("; "));
  process.exit(1);
}

const FONT = "Calibri";
const BODY = 20; // half-points, so 10pt
const RIGHT_TAB = 10800; // 7.5in in twips: right edge of the text area on Letter with 0.5in margins

const run = (text, opts = {}) => new TextRun({ text, font: FONT, size: BODY, ...opts });
const para = (children, opts = {}) => new Paragraph({ children, spacing: { after: 0 }, ...opts });

function heading(text) {
  return para([run(text.toUpperCase(), { bold: true, size: 22 })], {
    spacing: { before: 120, after: 40 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 } },
  });
}

function titleLine(left, right) {
  const children = [run(left, { bold: true })];
  if (right) children.push(run("\t" + right));
  return para(children, { tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }] });
}

function bullet(text) {
  return para([run(text)], { numbering: { reference: "bullets", level: 0 } });
}

function entry(e, title) {
  const out = [titleLine(title, e.date)];
  if (e.location) out.push(para([run(e.location, { italics: true })]));
  (e.bullets || []).forEach((b) => out.push(bullet(b)));
  return out;
}

const body = [];
body.push(para([run(r.name, { bold: true, size: 32 })], { alignment: AlignmentType.CENTER }));
if (r.contact && r.contact.length) {
  body.push(para([run(r.contact.filter(Boolean).join("  |  "), { size: 19 })], { alignment: AlignmentType.CENTER }));
}
if (r.headline) body.push(para([run(r.headline, { bold: true })], { alignment: AlignmentType.CENTER }));

if (r.summary) {
  body.push(heading("Summary"));
  body.push(para([run(r.summary)]));
}

if (r.education && r.education.length) {
  body.push(heading("Education"));
  r.education.forEach((ed) => {
    body.push(titleLine(ed.school, ed.date));
    if (ed.degree) body.push(para([run(ed.degree, { italics: true })]));
    (ed.details || []).forEach((d) => body.push(para([run(d)])));
  });
}

if (r.skills && r.skills.length) {
  body.push(heading("Skills"));
  r.skills.forEach((g) => body.push(para([run(g.label + ": ", { bold: true }), run((g.items || []).join(", "))])));
}

if (r.experience && r.experience.length) {
  body.push(heading("Experience"));
  r.experience.forEach((e) => body.push(...entry(e, [e.title, e.org].filter(Boolean).join(", "))));
}

if (r.projects && r.projects.length) {
  body.push(heading("Projects"));
  r.projects.forEach((p) => body.push(...entry(p, p.title)));
}

if ((r.activities && r.activities.length) || (r.additionalActivities && r.additionalActivities.length)) {
  body.push(heading("Leadership & Activities"));
  (r.activities || []).forEach((a) => body.push(...entry(a, [a.title, a.org].filter(Boolean).join(", "))));
  if (r.additionalActivities && r.additionalActivities.length) {
    body.push(para([run("Additional activities: ", { bold: true }), run(r.additionalActivities.join("; "))]));
  }
}

const doc = new Document({
  creator: r.name,
  title: r.name + " Resume",
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 300, hanging: 200 } } },
      }],
    }],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 576, bottom: 576, left: 720, right: 720 },
      },
    },
    children: body,
  }],
});

// Rough one-page check: about 95 characters fit on a line, about 58 lines fit on a page.
const lines = body.length + (JSON.stringify(r).length / 95) * 0.35;
const outPath = path.join(path.dirname(inPath), "resume.docx");
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(outPath, buf);
  console.log("Wrote " + outPath);
  if (lines > 58) console.log("Warning: this may run past one page. Cut the least relevant bullets and rebuild.");
});
