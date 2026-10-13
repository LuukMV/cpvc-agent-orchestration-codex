# AGENTS.md: Codex entry point

This repo is a 6-stage job pipeline, each stage defined as a plain markdown role file in
`agents/`. Codex doesn't spawn parallel teammates the way Claude Code does, so adopt each
role yourself, in sequence, in this one session, instead.

**Read `RULES.md` in full before doing anything.** Those rules apply to every stage below,
no exceptions: never fabricate a fact not in `PROFILE.md`, every claim in a packet must
trace back to it exactly, never submit anything, never check a consent box, one fresh
browser tab per application.

## Step 0: get a profile in place

- If `PROFILE.md` already exists, skip to the core pipeline.
- If it doesn't exist and the user pasted resume text and/or LinkedIn text in their message
  (or pointed you at a resume file), read `agents/intake.md`, adopt that role, and
  build a first-draft `PROFILE.md` from what they gave you. Tell them plainly it's a rough
  draft worth refining later.
- If it doesn't exist and they gave you nothing to work from, stop and ask them to either
  paste a resume/LinkedIn or run `cp PROFILE_TEMPLATE.md PROFILE.md` and fill it in
  themselves.

## Core pipeline (run this whenever asked to find/tailor jobs)

1. Read `agents/finder.md`. Adopt that role completely for this phase and do exactly
   what it says, ending with `runs/found.md` written.
2. Read `agents/validator.md`. Adopt that role, reading `runs/found.md`, writing
   `runs/validated.md` with a verdict and reason for every listing.
3. Read `agents/tailor.md`. Adopt that role for every GO verdict, writing
   `runs/packets/<company>-<role-slug>/packet.md` for each.
4. Read `agents/fact-checker.md`. Adopt that role on every packet you just wrote,
   appending a `## Fact-check` section (PASS or FAILED with specifics) to each one. This
   step is not optional, a packet without a passing fact-check is not finished.
5. Stop there and report back: how many found, how many GO, how many packets passed
   fact-check outright, and name any that failed. Do not run the form-filler step
   automatically, see below.

Treat `runs/found.md`, `runs/validated.md`, and `runs/packets/` as the real handoff between
phases, re-read them rather than relying on your own memory from a few steps back. That's
intentional, it's the same file-based handoff the Claude Code version uses between its
parallel teammates, just run one phase at a time here instead of concurrently.

## Form-filler step (separate, explicit, never automatic)

Only run this when the user names a specific packet and explicitly asks for it to be
pre-filled, and only on a packet whose fact-check says PASS. This is the only stage that
touches a real website with their real information.

1. Check you actually have browser-control tooling available in this session. If you don't,
   say so plainly and stop. Don't attempt it with plain HTTP requests, that doesn't fill out
   a real form.
2. If you do, read `agents/form-filler.md` and the browser-automation section of
   `RULES.md`. Adopt that role for exactly the one packet named, open the listing's URL in a
   brand-new tab (never reuse a tab from a previous application), fill what you can from the
   packet and `PROFILE.md`, and stop before Submit.
3. Report exactly what's filled, what's left blank and why, and that the tab is open and
   ready for the user to review and submit themselves.

## Quick start

See `prompts/codex-kickoff-prompt.md` for the copy-paste version of the core pipeline
prompt, if you'd rather paste it explicitly than rely on this file loading automatically.
