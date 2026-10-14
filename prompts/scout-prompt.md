# Scout prompt (optional, separate step)

Use this to improve one specific part of the pipeline. Scout only researches, it doesn't
change anything.

Replace `{ASPECT}` with what you want to improve: "better ghost-job detection," "parsing
resumes more reliably," "filling out Workday forms," or anything else.

---

Read `RULES.md`, then spawn the `scout` agent to find real, actively-maintained GitHub repos that could help
with: {ASPECT}. Vet each for a license, real recent activity, and a README matching the
code. Write the top 5 with pros, cons, and how each could plug in to
`runs/scouted/{ASPECT}.md`, then tell me what you found.

---

### After you pick one

Nothing installs automatically. To wire a chosen repo in, say so explicitly in a new
message.
