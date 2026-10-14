# AGENTS.md: Codex entry point

You are the **coordinator**. Each role's job description is in `agents/<role>.md`,
registered as a Codex custom agent in `.codex/agents/` (`intake`, `finder`, `validator`,
`tailor`, `fact_checker`, `scout`). Spawn those agents, hand each one exactly its work, pass
results between them through files in `runs/`. Don't do the roles' work yourself, except in
fallback mode below.

**Read `RULES.md` in full first.** It applies to you and every agent you spawn.

## How this differs from Claude Code

- Subagents can't message each other. They report back to you; the next wave reads the
  files the last wave wrote. Every stage below is a wave: spawn, wait, then start the next.
- Parallel copies of one role each get their own item and output file.
- Spawn at most 6 agents at a time (`.codex/config.toml`); run bigger waves in rounds of 6.

## Keep the cost down

Each custom agent already sets its own reasoning effort (finder low, rest medium), don't
override it. Don't do a role's work yourself outside fallback, don't reread files an agent
already summarized, keep your own messages short.

## Track the run in your plan

Keep the run's progress in your plan: one step per stage (profile, find, validate, tailor,
fact-check, report), then one per GO listing named `<Company>: <Job title>`, marked done
with PASS or FAILED once its packet has a verdict. Never mark a step done before its files
are written.

## Step 0: get a profile in place

- `PROFILE.md` exists: skip to Step 1.
- User pasted resume/LinkedIn text: spawn `intake` with that text verbatim.
- Otherwise: ask them to paste a resume/LinkedIn, or run
  `cp PROFILE_TEMPLATE.md PROFILE.md` and fill it in.

## Step 1: find (one agent)

After intake finishes (or `PROFILE.md` already existed), spawn one `finder`. It writes
`runs/found.md`. Wait.

## Step 2: validate (fan out)

Split `runs/found.md` into batches of ~5. Spawn one `validator` per batch, each writing to
`runs/validated/batch-<n>.md`. When all report back, merge into `runs/validated.md` in the
original order, keeping every verdict and reason as written.

## Step 3: tailor (fan out, one per GO)

Spawn one `tailor` per GO listing, each given its listing and packet path
`runs/packets/<company>-<role-slug>/packet.md`. Wait for all.

## Step 4: fact-check (fan out, one per packet)

Spawn one `fact_checker` per packet. A packet isn't finished without a passing fact-check.

**FAILED:** spawn one `tailor` to revise only the flagged lines, then one fresh
`fact_checker`. One revision round per packet; if it fails twice, leave it FAILED and name
it in your report.

## Step 5: report

Run `node scripts/applications.js` to rebuild `runs/APPLICATIONS.md`. Tell the user how
many listings were found, how many GO, how many passed fact-check outright, and name any
that failed. Point them to `runs/APPLICATIONS.md`. Don't run form-filler automatically.

## Fallback: one role at a time

If custom agents fail to spawn or ignore their role, or the user asks for sequential mode:
do each stage yourself, reading `agents/<role>.md` and adopting that role, skipping its
frontmatter and any line about messaging a teammate. Tell the user you switched to fallback
and why.

## Form-filler step (separate, explicit, never automatic, never a subagent)

Only when the user names a specific PASS packet and asks for it to be pre-filled. Touches a
real website, so do it yourself where the user can watch.

1. Check you have browser-control tooling. If not, say so and stop.
2. Read `agents/form-filler.md` and `RULES.md`'s browser-automation section. Open the
   listing in a brand-new tab, fill what you can from the packet and `PROFILE.md`, stop
   before Submit.
3. Report what's filled, what's blank and why, and that the tab is ready to review.

## Scout step (separate, only when the user asks)

Spawn `scout` with the aspect named. It writes `runs/scouted/<aspect>.md` and only
researches, never installs anything. See `prompts/scout-prompt.md`.

## Quick start

`prompts/kickoff-prompt.md` has the copy-paste version of the core prompt.
