# Codex kickoff prompt

Two ways to get started, pick one:

- **Fast path**: paste your resume text and/or LinkedIn text right above the prompt block
  below. Codex will build a first-draft `PROFILE.md` from it (the `intake` role in
  `AGENTS.md`) before running the rest of the pipeline.
- **Thorough path**: `cp PROFILE_TEMPLATE.md PROFILE.md` and fill it in yourself first.

Codex should pick up `AGENTS.md` automatically when you open this folder. If it doesn't act
on it, paste the block below as-is (with your resume/LinkedIn text above it, if you're on
the fast path).

---

Follow `AGENTS.md`: read `RULES.md`, handle Step 0 (build `PROFILE.md` from whatever
resume/LinkedIn text I've given you above, or confirm one already exists), then run the
core pipeline, finder, then validator, then tailor, then fact-checker, each as described in
their files under `agents/`, writing to `runs/` as you go. Don't run the
form-filler step, that's separate. When done, tell me how many listings you found, how many
were marked GO, how many packets passed fact-check outright, and name any that failed.

---

### Pre-filling a real application afterward

Only once you've read a packet in `runs/packets/`, confirmed its fact-check says PASS, and
actually want to apply to it. Tell Codex: "Run the form-filler step from `AGENTS.md` on
`runs/packets/<company>-<role>/packet.md`." It opens a fresh tab, fills what it can, and
stops before Submit.
