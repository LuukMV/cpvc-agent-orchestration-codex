#!/usr/bin/env node
// Renders a resume.json into an ATS-friendly one-page resume.docx next to it, then checks
// that it really fits on one page.
// Usage: node resume-builder/build.js runs/packets/<company>-<role>/resume.json
// Exit codes: 0 = built and fits on one page, 1 = bad input, 3 = built but runs past one page.
//
// ATS-friendly means: one column, no tables or text boxes, standard section headings,
// contact info in the body (not a header), real text everywhere.
//
// Page check: if LibreOffice is installed, the .docx is converted to PDF and the real pages
// are counted. Otherwise every line is laid out with Carlito, a free font with exactly the
// same character widths as Calibri, so line wraps match what Word does.

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { pathToFileURL } = require("url");
const fontkit = require("fontkit");
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

// Page geometry, in twips (1/1440 inch) for docx and points for measuring.
const MARGIN_TB = 576;  // 0.4in
const MARGIN_LR = 720;  // 0.5in
const PAGE_W = 12240, PAGE_H = 15840; // US Letter
const RIGHT_TAB = PAGE_W - 2 * MARGIN_LR;
const BULLET_LEFT = 300, BULLET_HANGING = 200;
const pt = (tw) => tw / 20;
const TEXT_W = pt(RIGHT_TAB);
const TEXT_H = pt(PAGE_H - 2 * MARGIN_TB);

const FONT = "Calibri";
const BODY = 20; // half-points: 10pt
const NAME = 32, CONTACT = 19, HEAD = 22;

// Every paragraph goes into the .docx and into a matching layout record used for measuring.
const body = [];
const layout = [];

const run = (text, opts = {}) => new TextRun({ text, font: FONT, size: BODY, ...opts });
function add(children, segs, opts = {}, meas = {}) {
  body.push(new Paragraph({ children, spacing: { after: 0 }, ...opts }));
  layout.push({ segs, ...meas });
}
const seg = (text, size, style = "") => ({ text, size: size / 2, style });

function heading(text) {
  const t = text.toUpperCase();
  add([run(t, { bold: true, size: HEAD })], [seg(t, HEAD, "b")], {
    spacing: { before: 120, after: 40 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 } },
  }, { before: pt(120), after: pt(40), border: 1.75 });
}
function titleLine(left, right) {
  const children = [run(left, { bold: true })];
  if (right) children.push(run("\t" + right));
  add(children, [seg(left, BODY, "b")], { tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }] },
      { right: right ? seg(right, BODY) : null });
}
function line(text, style = "") {
  add([run(text, { bold: style.includes("b"), italics: style.includes("i") })], [seg(text, BODY, style)]);
}
function labeled(label, text) {
  add([run(label, { bold: true }), run(text)], [seg(label, BODY, "b"), seg(text, BODY)]);
}
function bullet(text) {
  add([run(text)], [seg(text, BODY)], { numbering: { reference: "bullets", level: 0 } },
      { indent: pt(BULLET_LEFT) });
}
function centered(text, size, style = "") {
  add([run(text, { size, bold: style.includes("b") })], [seg(text, size, style)], { alignment: AlignmentType.CENTER });
}
function entry(e, title) {
  titleLine(title, e.date);
  if (e.location) line(e.location, "i");
  (e.bullets || []).forEach(bullet);
}

centered(r.name, NAME, "b");
if (r.contact && r.contact.length) centered(r.contact.filter(Boolean).join("  |  "), CONTACT);
if (r.headline) centered(r.headline, BODY, "b");
if (r.summary) { heading("Summary"); line(r.summary); }
if (r.education && r.education.length) {
  heading("Education");
  r.education.forEach((ed) => {
    titleLine(ed.school, ed.date);
    if (ed.degree) line(ed.degree, "i");
    (ed.details || []).forEach((d) => line(d));
  });
}
if (r.skills && r.skills.length) {
  heading("Skills");
  r.skills.forEach((g) => labeled(g.label + ": ", (g.items || []).join(", ")));
}
if (r.experience && r.experience.length) {
  heading("Experience");
  r.experience.forEach((e) => entry(e, [e.title, e.org].filter(Boolean).join(", ")));
}
if (r.projects && r.projects.length) {
  heading("Projects");
  r.projects.forEach((p) => entry(p, p.title));
}
if ((r.activities && r.activities.length) || (r.additionalActivities && r.additionalActivities.length)) {
  heading("Leadership & Activities");
  (r.activities || []).forEach((a) => entry(a, [a.title, a.org].filter(Boolean).join(", ")));
  if (r.additionalActivities && r.additionalActivities.length) {
    labeled("Additional activities: ", r.additionalActivities.join("; "));
  }
}

// ---- Measuring ----
const fontDir = path.join(__dirname, "fonts");
const fonts = {
  "": fontkit.openSync(path.join(fontDir, "Carlito-Regular.ttf")),
  b: fontkit.openSync(path.join(fontDir, "Carlito-Bold.ttf")),
  i: fontkit.openSync(path.join(fontDir, "Carlito-Italic.ttf")),
  bi: fontkit.openSync(path.join(fontDir, "Carlito-BoldItalic.ttf")),
};
const width = (text, s) => {
  const f = fonts[s.style] || fonts[""];
  return (f.layout(text).advanceWidth / f.unitsPerEm) * s.size;
};
const lineHeight = (sizePt) => {
  const f = fonts[""];
  return ((f["OS/2"].winAscent + f["OS/2"].winDescent) / f.unitsPerEm) * sizePt;
};

// Greedy word wrap across mixed-style segments, the way Word breaks at spaces.
function wrap(segs, maxW) {
  const words = [];
  segs.forEach((s) => s.text.split(/(?<= )/).forEach((w) => w && words.push({ w, s })));
  let lines = 1, x = 0;
  for (const { w, s } of words) {
    const full = width(w, s), bare = width(w.trimEnd(), s);
    if (x > 0 && x + bare > maxW) { lines += 1; x = 0; }
    x += full;
    while (x > maxW + 0.01 && bare > maxW) { lines += 1; x -= maxW; } // a single word wider than the line
  }
  return { lines, lastWidth: x };
}

let used = 0;
for (const p of layout) {
  const avail = TEXT_W - (p.indent || 0);
  let { lines, lastWidth } = wrap(p.segs, avail);
  if (p.right && lastWidth + 6 + width(p.right.text, p.right) > avail) lines += 1; // date pushed to its own line
  const size = Math.max(...p.segs.map((s) => s.size));
  used += (p.before || 0) + lines * lineHeight(size) + (p.after || 0) + (p.border || 0);
}

function realPageCount(docxPath) {
  const candidates = ["soffice", "libreoffice", "/Applications/LibreOffice.app/Contents/MacOS/soffice",
    "C:\\Program Files\\LibreOffice\\program\\soffice.exe"];
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "resume-check-"));
  const profile = pathToFileURL(path.join(outDir, "profile")).href;
  for (const bin of candidates) {
    try {
      execFileSync(bin, ["-env:UserInstallation=" + profile, "--headless", "--convert-to", "pdf",
        "--outdir", outDir, docxPath], { stdio: "ignore", timeout: 90000 });
      const pdf = fs.readFileSync(path.join(outDir, path.basename(docxPath, ".docx") + ".pdf"));
      return (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
    } catch (e) { /* try the next location */ }
  }
  return null;
}

const doc = new Document({
  creator: r.name,
  title: r.name + " Resume",
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: {
          paragraph: { indent: { left: BULLET_LEFT, hanging: BULLET_HANGING } },
          run: { font: FONT, size: BODY }, // without this some renderers swap in a taller font for the bullet
        },
      }],
    }],
  },
  sections: [{
    properties: {
      page: {
        size: { width: PAGE_W, height: PAGE_H },
        margin: { top: MARGIN_TB, bottom: MARGIN_TB, left: MARGIN_LR, right: MARGIN_LR },
      },
    },
    children: body,
  }],
});

const outPath = path.join(path.dirname(inPath), "resume.docx");
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(outPath, buf);
  console.log("Wrote " + outPath);

  const pages = realPageCount(outPath);
  const pct = Math.round((used / TEXT_H) * 100);
  let fits;
  if (pages !== null) {
    fits = pages === 1;
    console.log(`Page check (rendered with LibreOffice): ${pages} page${pages === 1 ? "" : "s"}, measured ${pct}% of one page used.`);
  } else {
    // Without a real render, keep two lines of slack for small differences between Word versions.
    fits = used <= TEXT_H - 2 * lineHeight(BODY / 2);
    console.log(`Page check (measured with Calibri-width fonts): ${pct}% of one page used.`);
  }
  if (fits) {
    console.log("Fits on one page.");
  } else {
    console.log("Runs past one page. Cut the least relevant bullet (or shorten the summary) and build again.");
    process.exit(3);
  }
});
