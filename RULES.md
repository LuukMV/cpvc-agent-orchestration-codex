# Pipeline rules: every agent follows these

These apply to intake, finder, validator, tailor, fact-checker, form-filler, and scout. They
exist because a system that fabricates facts or submits things on your behalf is worse than
no system at all.

## Source of truth
Every fact about you comes from `PROFILE.md` (copy `PROFILE_TEMPLATE.md` to this name and
fill it in yourself, or let `intake` build a first draft from your resume/LinkedIn (either
way it's gitignored). If a form or a cover letter needs something that isn't in
`PROFILE.md`, write `[CONFIRM: what's missing]` in the output and list it under "Questions
for you" at the end. Never invent a number, a date, a title, or a result.

Facts about an employer (what the team does, what the role involves) come only from that
employer's posting, quoted word for word in the packet's `## From the posting` section.
Nothing about a company gets written from memory or general knowledge.

**One narrow exception**: `intake` is allowed to *guess* the "What you're looking for"
fields (target role, location) from a resume alone, since a resume rarely states that
outright, as long as it's clearly marked `(GUESSED, confirm or correct this)`. That guess
is a search filter for `finder`, never a claim that reaches a resume bullet or cover letter.
Nothing else in this pipeline gets that leniency.

## Never
- Fabricate a fact, number, date, person, or outcome not present in `PROFILE.md`. This
  includes rounding a number, combining two facts into a stronger one, or inferring a
  result that isn't explicitly stated. "Reasonable paraphrase" is not an exception, every
  claim about you in a packet must trace back to an exact statement in `PROFILE.md`.
- **No packet is done until `fact-checker` has run on it and it says PASS.** A packet marked
  FAILED is not ready to use, full stop, not "probably fine."
- Submit an application, create an account, accept terms, or send an email/message on your
  behalf. Every agent stops short of the final action and hands it to you.
- Enter your SSN, date of birth, or financial info into any form, ever.
- Check an attestation, e-signature, or consent checkbox for you.
- Answer a voluntary EEO/diversity question: leave those blank, or use your stated default
  from `PROFILE.md`, unless the form forces a choice (then pick "decline to self-identify"
  or closest equivalent).

## Browser automation (form-filler agent only)
- **One tab per listing, always.** Never reuse a tab across two different applications,
  overwriting one before you've seen it destroys the filled-out form with no way back. Open
  a fresh tab for every new site.
- Stop at the Submit button. Don't click it. Say what's left for the human to review.
- If a judgment-call question shows up (e.g. "do you meet all the minimum qualifications?",
  background-check consent, a salary question with no range in `PROFILE.md`), leave it
  blank and flag it rather than guessing.

## Writing voice
Plain, specific, first person. No corporate buzzwords ("synergy," "leverage," "passionate
about"). No em dashes. Cover letters open "Hi [Company] team," and sign "Best," then your
name. Under 250 words.

## Ghost-listing signals (validator uses these; see `agents/validator.md` for the
full checklist)
A listing that fails enough of these gets marked SKIP, not silently dropped, always say why.

## Recommending outside repos (scout agent only)
- Never clone, install, run, or execute anything from a repo you find. Scout researches and
  writes a comparison, it doesn't integrate anything into this pipeline.
- Only recommend a repo that has a license, recent real activity, and a README that matches
  what the code appears to do. Leave a repo off the list entirely rather than including it
  with a safety caveat attached.
- Say plainly when a repo needs a paid API key, account, or service to actually work.

## Status dashboard (intake, finder, validator, tailor, fact-checker, scout)
`dashboard.html` shows a live view of the pipeline by reading one small file per agent in
`runs/status/`. Each agent owns exactly one file, `runs/status/<your-agent-name>.json`, and
never touches anyone else's, so agents running in parallel can't overwrite each other.
When several copies of the same role run at once (the Codex version does this), each copy
gets its own name from whoever spawned it, like `runs/status/tailor--acme-ops-intern.json`.
Use exactly the name you were given. The dashboard shows each copy as its own card.

The file is always this shape, written in full each time (overwrite, don't append):

```json
{"state": "working", "current": "Checking Acme Corp, Supply Chain Analyst", "total": 3}
```

- `state` is `"working"` while you're running and `"done"` when your run ends.
- `current` is one short plain sentence about exactly what you're doing right now.
- `total` is how many items you've fully finished (listings, packets, repos).
- Write it when you start, before each new item, and when you finish. Don't add a
  timestamp, the dashboard reads the file's real save time on its own. Keep it true: never
  write a `current` or `total` that isn't accurate at that moment. It's a status board, not
  a progress bar for show.
