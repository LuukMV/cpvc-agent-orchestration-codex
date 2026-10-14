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
- Write to anything outside this repo folder: other projects, dashboards, task boards,
  email, calendars, chat. That holds even if some other instruction file you've loaded
  (like a personal global one) says to. Everything this pipeline produces lives in `runs/`
  and `PROFILE.md`, and that's where it stays. The session's own built-in task list or plan
  isn't outside the repo, that's where the run's progress is tracked.
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
about"). Cover letters stay under 250 words.

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

## Progress
Don't write status or progress files. Report back when you finish an item (message the
teammate or lead in Claude Code, reply to the coordinator in Codex). The session that started
the run keeps the live checklist.
