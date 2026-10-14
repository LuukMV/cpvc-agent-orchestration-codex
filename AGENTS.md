# AGENTS.md: Codex entry point

You are the **coordinator** for a job pipeline. Each role's job description lives in
`agents/<role>.md`, and each role is registered as a Codex custom agent in `.codex/agents/`
(`intake`, `finder`, `validator`, `tailor`, `fact_checker`, `scout`). Your job is to spawn
those agents, hand each one exactly the work it needs, and pass results between them through
the files in `runs/`. You don't do the roles' work yourself, except in fallback mode below.

**Read `RULES.md` in full before doing anything.** Those rules apply to you and every agent
you spawn, no exceptions: never fabricate a fact, every claim about the student traces to
`PROFILE.md` and every claim about an employer traces to a quote from its posting, never
submit anything, never check a consent box.

## How this differs from the Claude Code version

- Your subagents can't message each other. They report back to you, and the next wave reads
  the files the last wave wrote. That's why every stage below is a wave: spawn, wait for
  every agent in it to report back, then start the next.
- When several copies of one role run at once, give each its own item, its own output file
  and its own status file name, so no two agents ever write the same file.
- Spawn at most 6 agents at a time (`.codex/config.toml`). If a wave has more work than
  that, run it in rounds of 6.

## Step 0: get a profile in place

- If `PROFILE.md` already exists, skip to Step 1.
- If it doesn't and the user pasted resume and/or LinkedIn text (or pointed you at a resume
  file), spawn `intake`. Give it that text verbatim. Its status file is
  `runs/status/intake.json`. Tell the user plainly the result is a rough draft worth
  refining later.
- If it doesn't exist and they gave you nothing, stop and ask them to paste a resume or
  LinkedIn, or run `cp PROFILE_TEMPLATE.md PROFILE.md` and fill it in.

## Step 1: find (one agent)

Only after intake has reported back finished (or `PROFILE.md` already existed), spawn one
`finder`. It writes `runs/found.md` and `runs/status/finder.json`. Wait for it.

## Step 2: validate (fan out)

1. Split the listings in `runs/found.md` into batches of about 5, numbered 1, 2, 3...
2. Spawn one `validator` per batch, all at once. Tell each one exactly which listings are its
   batch, to write its verdicts to `runs/validated/batch-<n>.md` (not `runs/validated.md`),
   and to use `runs/status/validator--batch-<n>.json`.
3. When every validator has reported back, merge all batch files into `runs/validated.md` in
   the same order as `runs/found.md`. Keep every verdict and every reason exactly as written.

## Step 3: tailor (fan out, one per GO)

For each GO listing in `runs/validated.md`, spawn one `tailor`, all at once. Give each one
its single listing, the packet path `runs/packets/<company>-<role-slug>/packet.md`, and the
status file `runs/status/tailor--<company>-<role-slug>.json`. Each packet has its own folder,
so parallel tailors can never overwrite each other. Wait for all of them.

## Step 4: fact-check (fan out, one per packet)

For each packet written in Step 3, spawn one `fact_checker`, all at once. Give each one its
single packet path and the status file `runs/status/fact-checker--<company>-<role-slug>.json`.
This step is not optional: a packet without a passing fact-check is not finished.

**If a packet comes back FAILED:** spawn one `tailor` for that packet with the instruction to
revise it (the tailor role file explains how: fix only the flagged lines, remove the old
verdict, add revision notes), then one fresh `fact_checker` to check it again. One revision
round per packet. If it fails twice, leave it FAILED and name it in your report, the student
fixes it by hand.

## Step 5: report

Tell the user how many listings were found, how many were GO, how many packets passed
fact-check outright, and name any that failed. Do not run the form-filler step
automatically, see below.

## Fallback: one role at a time

If spawning the custom agents fails, a spawned agent ignores its role, or the user asks for
"sequential mode", do the work yourself instead: for each stage in order, read
`agents/<role>.md`, adopt that role completely, and write the same files. Skip each role
file's YAML frontmatter and any line telling it to message a teammate. Use the plain status
file names (`runs/status/finder.json` and so on). Tell the user you switched to fallback mode
and why.

## Form-filler step (separate, explicit, never automatic, never a subagent)

Only run this when the user names a specific packet and explicitly asks for it to be
pre-filled, and only on a packet whose fact-check says PASS. This is the only stage that
touches a real website with their real information, so do it yourself where the user can
watch, not in a subagent.

1. Check you actually have browser-control tooling available in this session. If you don't,
   say so plainly and stop. Don't attempt it with plain HTTP requests, that doesn't fill out
   a real form.
2. If you do, read `agents/form-filler.md` and the browser-automation section of
   `RULES.md`. Adopt that role for exactly the one packet named, open the listing's URL in a
   brand-new tab (never reuse a tab from a previous application), fill what you can from the
   packet and `PROFILE.md`, and stop before Submit.
3. Report exactly what's filled, what's left blank and why, and that the tab is open and
   ready for the user to review and submit themselves.

## Scout step (separate, only when the user asks)

When the user wants to improve one specific part of the pipeline, spawn `scout` with the
aspect they named. It writes `runs/scouted/<aspect>.md` and `runs/status/scout.json`. Scout
only researches, it never clones, installs, or wires anything in. See
`prompts/scout-prompt.md` for the copy-paste version.

## Quick start

See `prompts/kickoff-prompt.md` for the copy-paste version of the core pipeline prompt, if
you'd rather paste it explicitly than rely on this file loading automatically.
