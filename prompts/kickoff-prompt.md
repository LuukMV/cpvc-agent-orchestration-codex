# Codex kickoff prompt

Two ways to get started, pick one:

- **Fast path**: paste your resume text and/or LinkedIn text right above the prompt block
  below. Codex spawns the `intake` agent to build a first-draft `PROFILE.md` from it before
  running the rest of the pipeline.
- **Thorough path**: `cp PROFILE_TEMPLATE.md PROFILE.md` and fill it in yourself first.

Whichever path you pick, add these two lines (write whatever is true for you):

```
Work authorization: U.S. citizen, no sponsorship needed
Currently enrolled: yes
```

Resumes almost never say either one and most postings ask, so without them nearly every
packet comes back with `[CONFIRM]` questions about them.

Before you paste: when Codex asks whether to trust this folder, say yes. Codex only loads
the custom agents in `.codex/agents/` and the live web search setting in
`.codex/config.toml` for trusted folders.

---

Follow `AGENTS.md` as the coordinator. Read `RULES.md` first. Handle Step 0 (spawn intake on
the resume/LinkedIn text above, or confirm `PROFILE.md` exists), then run the pipeline with
subagents: one finder, then parallel validators on batches of listings, then one tailor per
GO listing in parallel, then one fact_checker per packet in parallel. Give every agent its
own output file and status file exactly as `AGENTS.md` describes. Don't run the form-filler
step. When done, tell me how many listings you found, how many were GO, how many packets
passed fact-check outright, and name any that failed.

---

### If subagents don't work

Paste this instead to run the same pipeline one role at a time, with no subagents:

```
Follow AGENTS.md in fallback mode: run every stage yourself, one role at a time, reading
each agents/<role>.md as you go. Don't spawn subagents.
```

### Pre-filling a real application afterward

Only once you've read a packet in `runs/packets/`, confirmed its fact-check says PASS, and
actually want to apply to it. Tell Codex: "Run the form-filler step from `AGENTS.md` on
`runs/packets/<company>-<role>/packet.md`." It opens a fresh tab, fills what it can, and
stops before Submit.
