#!/usr/bin/env node
// Builds runs/APPLICATIONS.md: one table row per packet in runs/packets/, with the company,
// job title, location, pay, fact-check result, open questions and links to the resume,
// packet and posting. Everything comes from the files on disk, nothing is written by hand.
// Usage: node scripts/applications.js
//
// dashboard.html loads this same file in the browser and uses parsePacket() to show the
// same table live, so the two can never disagree.

(function (root) {
  // Reads the parts of a packet.md the tailor and fact-checker always write.
  function parsePacket(text) {
    text = String(text || "");
    var lines = text.split(/\r?\n/);
    var app = { company: "", title: "", location: "", pay: "", url: "", factCheck: "pending", questions: 0 };

    var heading = lines.find(function (l) { return /^#\s+\S/.test(l); });
    if (heading) {
      var h = heading.replace(/^#\s+/, "").trim();
      var i = h.indexOf(": ");
      if (i > 0) { app.company = h.slice(0, i).trim(); app.title = h.slice(i + 2).trim(); }
      else app.title = h;
    }

    function field(name) {
      var m = text.match(new RegExp("\\*\\*" + name + ":\\*\\*\\s*([^·\\n]+)"));
      return m ? m[1].trim() : "";
    }
    app.location = field("Location");
    app.pay = field("Pay");
    var url = field("Listing").replace(/^<|>$/g, "").split(/\s/)[0];
    app.url = /^https?:\/\//i.test(url) ? url : "";

    // The last ## Fact-check section is the current verdict (a revised packet has its old one deleted).
    var section = null;
    lines.forEach(function (l) {
      var m = l.match(/^##\s+(.+?)\s*$/);
      if (m) { section = m[1].toLowerCase(); return; }
      if (section === "fact-check") {
        var t = l.trim();
        if (/^PASS\b/i.test(t)) app.factCheck = "PASS";
        else if (/^FAILED\b/i.test(t)) app.factCheck = "FAILED";
      }
      if (section === "questions for you" && /^\s*(?:[-*]|\d+\.)\s+\S/.test(l) && !/^\s*[-*]\s*none\b/i.test(l)) {
        app.questions += 1;
      }
    });
    return app;
  }

  var ORDER = { PASS: 0, pending: 1, FAILED: 2 };
  function sortApps(apps) {
    return apps.sort(function (a, b) {
      return (ORDER[a.factCheck] - ORDER[b.factCheck]) ||
        a.company.localeCompare(b.company) || a.title.localeCompare(b.title);
    });
  }

  root.CPVCApplications = { parsePacket: parsePacket, sortApps: sortApps };

  if (typeof module === "undefined" || typeof require === "undefined" || require.main !== module) return;

  // ---- Node: write runs/APPLICATIONS.md ----
  var fs = require("fs");
  var path = require("path");
  var runs = path.join(__dirname, "..", "runs");
  var packetsDir = path.join(runs, "packets");

  var apps = [];
  (fs.existsSync(packetsDir) ? fs.readdirSync(packetsDir) : []).forEach(function (slug) {
    var dir = path.join(packetsDir, slug);
    var packet = path.join(dir, "packet.md");
    if (!fs.statSync(dir).isDirectory() || !fs.existsSync(packet)) return;
    var app = parsePacket(fs.readFileSync(packet, "utf8"));
    app.slug = slug;
    app.resume = fs.existsSync(path.join(dir, "resume.docx"));
    apps.push(app);
  });
  sortApps(apps);

  var cell = function (s) { return String(s || "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim() || "-"; };
  var count = function (v) { return apps.filter(function (a) { return a.factCheck === v; }).length; };
  var out = [
    "# Applications",
    "",
    apps.length + " packet(s): " + count("PASS") + " passed fact-check, " + count("FAILED") +
      " failed, " + count("pending") + " not checked yet.",
    "Only use a packet whose fact-check says PASS. Answer its open questions before you apply.",
    "Rebuild this list any time with `node scripts/applications.js`.",
    "",
    "| Company | Job title | Location | Pay | Fact-check | Open questions | Resume | Packet | Posting |",
    "|---|---|---|---|---|---|---|---|---|",
  ];
  apps.forEach(function (a) {
    var base = "packets/" + encodeURI(a.slug) + "/";
    out.push("| " + [
      cell(a.company), cell(a.title), cell(a.location), cell(a.pay), a.factCheck, String(a.questions),
      a.resume ? "[resume.docx](" + base + "resume.docx)" : "not built",
      "[packet.md](" + base + "packet.md)",
      a.url ? "[posting](" + a.url.replace(/[()\s]/g, encodeURIComponent) + ")" : "-",
    ].join(" | ") + " |");
  });
  if (!apps.length) out.push("", "No packets yet. They appear here once the tailor writes them.");

  fs.mkdirSync(runs, { recursive: true });
  var target = path.join(runs, "APPLICATIONS.md");
  fs.writeFileSync(target + "." + process.pid + ".tmp", out.join("\n") + "\n");
  fs.renameSync(target + "." + process.pid + ".tmp", target);
  console.log("Wrote runs/APPLICATIONS.md with " + apps.length + " application(s).");
})(typeof window !== "undefined" ? window : globalThis);
