# Scout prompt (optional, separate step)

Use this any time you want to improve one specific part of the pipeline instead of running
the core four. Scout doesn't change anything, it researches real GitHub repos and hands you
a comparison to decide from.

Replace `{ASPECT}` with whatever you want to improve, in your own words: "better ghost-job
detection," "parsing resumes more reliably," "filling out Workday forms," or something
outside the current pipeline entirely, like outreach or interview prep.

---

Read `RULES.md` in full, then read `agents/scout.md` and adopt that role. Find real,
actively-maintained GitHub repos that could help with: {ASPECT}. Vet each one for basic
safety (license, real recent activity, a README that matches what the code does) before it
makes the list. Write the top 5 with pros, cons, and how each could plug into this pipeline
to `runs/scouted/{ASPECT}.md`, then tell me what you found and let me pick.

---

### After you pick one

Scout only researches, nothing gets installed automatically. If you want to actually wire a
chosen repo into the pipeline, say so explicitly in a new message, that's a deliberate step
you're asking for, not something that happens on its own.
