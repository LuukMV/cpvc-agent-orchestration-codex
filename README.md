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
output file, so no two agents ever write the same file.

That's the contrast with the Claude Code version, where teammates message each other and
hand off one item at a time. Same files, same rules, two ways to orchestrate. Scout runs on
its own, whenever you ask for it.

## Prerequisites

- A current Codex release (CLI, IDE extension or desktop app). Subagents are on by default.
- Git
- Node.js 18 or newer (for building the Word resumes)
- Optional: LibreOffice, so the resume builder can render each resume and count its real pages.
  Without it, the builder measures the layout using Calibri's exact character widths instead.
- For the form-filler step only: whatever browser-control tooling your Codex setup has, if
  any

## Step 1: set up a folder, all from the chat

You won't need a terminal for any of this, your AI runs every command.

1. Make an empty folder, for example `job-pipeline` on your Desktop, and open it in
   Codex (add a project or folder, then `job-pipeline`).
2. Paste this into the chat:

   ```
   Set this folder up for the CPVC job pipeline. Run these here, in this empty folder:
   1. git clone https://github.com/LuukMV/cpvc-job-pipeline-codex.git .
   2. npm install --prefix resume-builder
   If git says the folder isn't empty and the only thing in it is a hidden .DS_Store file,
   delete just that file and try again. If anything else is in the folder, stop and ask me.
   If git or Node.js isn't installed, stop and tell me how to install it on my computer.
   When both steps work, tell me it's ready.
   ```

3. **Start a new chat in the same folder** and use it for everything after this.
   Say yes when Codex asks whether to trust the folder. Codex reads `AGENTS.md`, the custom
   agents in `.codex/agents/` and the live web search setting only when a chat starts in a
   trusted folder.

## Step 2: get a profile in place (two ways)

**Fast path, see results in minutes.** Don't fill anything in by hand. When you paste the
kickoff prompt in Step 3, paste your resume text and/or your LinkedIn "About"/experience
section right above it. The `intake` role builds a first-draft `PROFILE.md` from it
automatically, everything it's not sure about gets flagged rather than guessed.

Add two lines too, with whatever is true for you: `Work authorization: U.S. citizen, no
sponsorship needed` and `Currently enrolled: yes`. Resumes almost never say either, and
without them nearly every packet comes back asking you to confirm them.

**Thorough path, more accurate, slower to start.** Ask your AI: "Copy
PROFILE_TEMPLATE.md to PROFILE.md and open it so I can fill it in." Then fill in your real info: contact details, what you're looking for,
education, and real experience with real numbers.

Either way, `PROFILE.md` is gitignored, it never gets committed, and every role in this
pipeline reads this file and only this file for facts about you. Doing the fast path first
and refining `PROFILE.md` by hand afterward is the intended flow, not a compromise. Rerun
the pipeline once you've sharpened it and watch the packets get better.

Also skim `RULES.md`. It's short, and it's the whole reason this is safe to point at a real
job search: never fabricate a fact, verify every claim before it's considered done, never
submit anything for you, never check a consent box on your behalf.

## Step 3: run the kickoff prompt

In your fresh chat, send one message: your resume or LinkedIn text and the two extra lines
(fast path only), then the prompt block from `prompts/kickoff-prompt.md`.
Watch it right in the chat: the coordinator keeps a plan with one step per stage and one
per job, checking each off with its fact-check result as agents report back. Type `/agent` in Codex to switch between running agents and watch any one of them work.

## Step 4: read your packets

Everything the pipeline writes lands in `runs/`:

```
runs/
  APPLICATIONS.md             start here: one row per job, with links to everything below
  found.md                    every listing finder turned up
  validated.md                GO or SKIP for each one, with the reason
  packets/
    acme-corp-data-analyst-intern/     one folder per job: company and job title
      packet.md               bullets, cover letter, answers, fact-check verdict
      resume.json             the resume's content, every line from PROFILE.md
      resume.docx             the one-page tailored resume, ready for Word or Google Docs
```

Open `runs/APPLICATIONS.md` first. It lists every job with its company, job title, location,
pay, fact-check result and how many questions you still need to answer, plus links to its
`resume.docx`, `packet.md` and the posting. Passing packets sort to the top. If the list ever looks out of date, ask
your AI to run `node scripts/applications.js`.

Then open `runs/validated.md` to see every listing's verdict and why (SKIP always
comes with a real reason, never a silent drop), then open whatever landed in
`runs/packets/`. Each packet has resume bullets, a cover letter, question answers, a tailored
one-page `resume.docx` (Word, built from that packet's `resume.json`), and a `## Fact-check`
section at the bottom, scroll straight to that first. PASS means every claim
traced to your profile. FAILED means exactly what it sounds like, don't use that packet as-is.

The tailored resume is ready to open in Word or Google Docs. Every line on it came from your
`PROFILE.md`, checked by the fact-checker. The form-filler attaches it for you.

## Step 5 (optional): pre-fill a real application

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
