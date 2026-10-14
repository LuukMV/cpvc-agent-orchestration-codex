# CPVC Job Pipeline (Codex)

A real, working job-application pipeline built for the Cal Poly Vibe Coding Club. By the
end of this walkthrough you'll have Codex turning your resume or LinkedIn into a profile,
finding real job listings, checking them for ghost-listing red flags, tailoring your resume
and cover letter to each one, strictly fact-checking every claim before it reaches you, and
(optionally) pre-filling the actual application form in your browser, stopping right before
you'd click submit.

This isn't a toy. Point it at your own job search and it goes to work on real postings with
your real information. Treat every output like a first draft from a fast, tireless intern:
useful, but yours to review before anything goes out.

Using Claude Code instead? This is the Codex version. Head to the
[Claude Code version](https://github.com/LuukMV/cpvc-job-pipeline-claude) instead, same
pipeline, same rules, same output, with teammates that message each other directly.

## What you'll end up with

Seven roles, each one a Codex custom agent in `.codex/agents/`:

- **intake**: builds a first-draft profile from a pasted resume or LinkedIn, so you get
  real results in minutes instead of filling out a form first
- **finder**: searches real job boards and company career pages for roles matching your
  profile
- **validator**: re-checks each listing for ghost-listing signals (dead links, evergreen
  "always hiring" language, scraped/duplicate postings) and your actual fit
- **tailor**: drafts tailored resume bullets, a cover letter, and application-question
  answers, pulling only from facts you've actually written down
- **fact-checker**: a strict, zero-tolerance pass on every packet. Every claim either
  traces exactly to your profile or the packet is marked FAILED, not "close enough"
- **form-filler** (optional, needs browser-control tooling): opens the real application and
  fills it in, stopping before the Submit button
- **scout** (optional, run any time): point it at one part of the pipeline you want to
  improve and it researches 5 real, vetted GitHub repos that could help, with pros and
  cons, and lets you decide. It never installs or wires anything in on its own

Your main Codex session acts as a **coordinator**. It spawns the other roles as subagents
and runs them in waves: one finder, then several validators in parallel on batches of
listings, then one tailor per GO listing in parallel, then one fact-checker per packet in
parallel. Codex subagents can't message each other, they only report back to the
coordinator, so each wave starts once the last one is done and reads the files it wrote
(`runs/found.md`, `runs/validated.md`, `runs/packets/`). Every parallel copy gets its own
output file and status file, so no two agents ever write the same file.

That's the contrast with the Claude Code version, where teammates message each other and
hand off one item at a time. Same files, same rules, two ways to orchestrate. Scout runs on
its own, whenever you ask for it.

## Prerequisites

- A current Codex release (CLI, IDE extension or desktop app). Subagents are on by default.
- Git
- For the form-filler step only: whatever browser-control tooling your Codex setup has, if
  any

## Step 1: get this repo

```bash
git clone https://github.com/LuukMV/cpvc-job-pipeline-codex.git
cd cpvc-job-pipeline-codex
```

## Step 2: get a profile in place (two ways)

**Fast path, see results in minutes.** Don't fill anything in by hand. When you paste the
kickoff prompt in Step 4, paste your resume text and/or your LinkedIn "About"/experience
section right above it. The `intake` role builds a first-draft `PROFILE.md` from it
automatically, everything it's not sure about gets flagged rather than guessed.

Add two lines too, with whatever is true for you: `Work authorization: U.S. citizen, no
sponsorship needed` and `Currently enrolled: yes`. Resumes almost never say either, and
without them nearly every packet comes back asking you to confirm them.

**Thorough path, more accurate, slower to start.**
```bash
cp PROFILE_TEMPLATE.md PROFILE.md
```
Open `PROFILE.md` and fill in your real info: contact details, what you're looking for,
education, and real experience with real numbers.

Either way, `PROFILE.md` is gitignored, it never gets committed, and every role in this
pipeline reads this file and only this file for facts about you. Doing the fast path first
and refining `PROFILE.md` by hand afterward is the intended flow, not a compromise. Rerun
the pipeline once you've sharpened it and watch the packets get better.

Also skim `RULES.md`. It's short, and it's the whole reason this is safe to point at a real
job search: never fabricate a fact, verify every claim before it's considered done, never
submit anything for you, never check a consent box on your behalf.

## Step 3: open this folder in Codex

When Codex asks whether to trust this folder, say yes. Codex only loads the project's
`.codex/` settings for trusted folders, which is where the custom agents and the live web
search setting live.

Codex reads `AGENTS.md` automatically. That file makes your session the coordinator: it
spawns intake (if needed), then finder, validators, tailors and fact-checkers as subagents.
Each agent's file in `.codex/agents/` is short on purpose. It points at the full job
description in `agents/<role>.md`, so there's one copy of every role to read and edit.
Type `/agent` in Codex to switch between running agents and watch any one of them work.

## Step 4: run the kickoff prompt

Open `prompts/kickoff-prompt.md`, copy the prompt block, paste it into Codex (with your
resume/LinkedIn text above it if you're on the fast path). If Codex doesn't act on
`AGENTS.md` automatically, this prompt spells the steps out explicitly.

### Optional: watch it on the dashboard too

Every role writes its own small status file in `runs/status/` as it works (see
`RULES.md`), and `dashboard.html` turns those into a live status board, one card per
agent, including each parallel copy, showing what it's working on and how many it's finished.
Watching five tailor cards light up at once is the fan-out happening for real. In a second terminal,
from the repo root:

```bash
python3 -m http.server 8010 --bind 127.0.0.1
```

Then open `http://localhost:8010/dashboard.html` (opening the file directly won't work, it
has to be served). Leave it open in a tab while the pipeline runs.

Don't drop `--bind 127.0.0.1`. Without it the server listens on every network you're on,
and anyone on the same wifi could open your `PROFILE.md` and packets from their laptop.

## Step 5: read your packets

Once it's done, open `runs/validated.md` to see every listing's verdict and why (SKIP always
comes with a real reason, never a silent drop), then open whatever landed in
`runs/packets/`. Each packet has resume bullets, a cover letter, question answers, and a
`## Fact-check` section at the bottom, scroll straight to that first. PASS means every claim
traced to your profile. FAILED means exactly what it sounds like, don't use that packet as-is.

## Step 6 (optional): pre-fill a real application

Only do this for a packet whose fact-check says PASS and that you've actually read and want
to apply to. See `prompts/form-filler-prompt.md` for the exact steps. The form-filler opens
a brand-new browser tab for each application, fills what it can, and stops before Submit.
You click submit.

## What's actually happening here

- **File-based handoffs**: `runs/found.md` then `runs/validated.md` then `runs/packets/` are
  the real contract between waves. Subagents can't talk to each other, so the files are the
  only way work moves forward, which is exactly why every parallel copy gets its own file.
- **Fan out, fan in**: the coordinator splits work into independent pieces (batches of
  listings, one packet each), runs them in parallel, waits for all of them, then merges
  (`runs/validated/batch-*.md` into `runs/validated.md`). That's the most common
  multi-agent pattern there is.
- **Reusable roles as plain markdown**: the role definitions in `agents/` aren't anything
  Codex-specific, they're just markdown files with instructions. The custom agents in
  `.codex/agents/` and the Claude Code version's teammates all read the same text.
- **The safety rail is the point**: `RULES.md` is what makes this usable on a real job
  search instead of a demo you'd never trust. Notice the tailor role would rather write
  `[CONFIRM: ...]` than invent a number, the fact-checker would rather fail a packet than
  wave through a plausible-sounding claim, and the form-filler would rather stop and tell
  you something looks wrong than guess.
- **Fast start without cutting corners**: `intake` is the one place in this pipeline allowed
  to infer anything (a likely target role/location from your resume), and even then it's
  only a search filter, clearly flagged, never something that ends up in a sentence sent to
  an employer. Everything downstream of that is held to the strict standard.

## Troubleshooting

- **Codex doesn't seem to be following `AGENTS.md`**: paste `prompts/kickoff-prompt.md`'s
  prompt block explicitly instead of relying on automatic pickup.
- **Subagents don't spawn, or spawn without their role**: check you trusted the folder (the
  custom agents only load for trusted folders) and that Codex is up to date. If it still
  won't work, use the fallback prompt at the bottom of `prompts/kickoff-prompt.md`. It runs
  the same pipeline one role at a time with no subagents.
- **Form-filler says it has no browser-control tooling**: that's correct behavior, not a
  bug, it won't fake filling a form with plain HTTP requests. Check your Codex setup's
  browser-automation option, or skip that step and apply manually using the packet.
- **A filled-out form disappeared**: almost always a tab got reused instead of opened fresh.
  `RULES.md` and `agents/form-filler.md` both call this out, it's a real failure mode, not a
  hypothetical.
- **Dashboard says "Not connected yet"**: you opened `dashboard.html` as a file. Start the
  server from the repo root (`python3 -m http.server 8010 --bind 127.0.0.1`) and open
  `http://localhost:8010/dashboard.html`. "Address already in use" means port 8010 is
  taken, use 8011 in both places. A card stuck on "No update for N min" means that agent
  stalled, go check on it.
- **A packet keeps coming back FAILED**: that usually means `PROFILE.md` is too thin (common
  right after the fast path) for the tailor to write specific-enough bullets without
  reaching. Fill in more of the Experience/Projects tables and rerun.

## Going further

- **Pick one part of the pipeline to upgrade, then scout it.** Open `prompts/scout-prompt.md`,
  name the aspect you want to improve (better ghost-job detection, more reliable resume
  parsing, a smarter outreach step, anything), and paste the prompt in. Scout comes back
  with 5 real, actively-maintained repos, their pros and cons, and how each could plug into
  this pipeline, written to `runs/scouted/<aspect>.md`. You pick, nothing gets wired in
  automatically.
- Rerun `finder` with a different target role in `PROFILE.md` to see it build a fresh batch.
- Try the [Claude Code version](https://github.com/LuukMV/cpvc-job-pipeline-claude) to see
  the same roles run as teammates that message each other instead of a coordinator with
  workers.
