# Codex kickoff prompt

Get `PROFILE.md` in place first, pick one:

- **Fast path:** paste your resume/LinkedIn text above the prompt block below. Codex spawns
  `intake` to build a first-draft `PROFILE.md`.
- **Thorough path:** ask your AI to copy `PROFILE_TEMPLATE.md` to `PROFILE.md` and fill it
  in yourself first.

Either way, add these two lines (write whatever is true for you):

```
Work authorization: U.S. citizen, no sponsorship needed
Currently enrolled: yes
```

Before you paste: say yes when Codex asks to trust this folder. It only loads
`.codex/agents/` and live web search for trusted folders.

---

Follow `AGENTS.md` as the coordinator. Read `RULES.md` first. Handle Step 0 (spawn intake
on the resume/LinkedIn text above, or confirm `PROFILE.md` exists), ask me how many
listings to look for per Step 1, then run the pipeline: one finder, then parallel
validators on batches of listings, then one tailor per GO listing in parallel, then one
fact_checker per packet in parallel. Give every agent its own output file exactly as
`AGENTS.md` describes, and keep your plan current as the run moves. Don't run the
form-filler step. When done, run `node scripts/applications.js`, then tell me how many
listings you found, how many were GO, how many packets passed fact-check outright, and
name any that failed.

---

### If subagents don't work

Paste this instead to run the same pipeline one role at a time, with no subagents:

```
Follow AGENTS.md in fallback mode: run every stage yourself, one role at a time, reading
each agents/<role>.md as you go. Don't spawn subagents.
```

### Pre-filling a real application afterward

Only once you've read a packet, confirmed its fact-check says PASS, and want to apply.
Tell Codex: "Run the form-filler step from `AGENTS.md` on
`runs/packets/<company>-<role>/packet.md`." It opens a fresh tab, fills what it can, and
stops before Submit.
