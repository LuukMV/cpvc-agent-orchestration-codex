# CPVC Agent Orchestration Workshop (Codex)

A hands-on multi-agent orchestration project built for the Cal Poly Vibe Coding Club: a
coordinator session that spawns Codex subagents in waves, fanning work out in parallel and
merging it back through files, with a fact-checker gate that can fail their output. The
applied example is a real job-application pipeline: Codex turns your resume into a profile,
finds real job listings, checks them for ghost postings, tailors a resume and cover letter
to each one, fact-checks every claim, and (optionally) pre-fills the real application form,
stopping before Submit.

Using Claude Code? Use the [Claude Code version](https://github.com/LuukMV/cpvc-agent-orchestration-claude) instead.

## Roles

Custom agents in `.codex/agents/`, spawned by your main session as the coordinator:

- **intake**: builds `PROFILE.md` from a pasted resume/LinkedIn
- **finder**: searches job boards and company sites for matching listings
- **validator**: flags ghost listings, checks fit
- **tailor**: writes resume bullets, cover letter, question answers from `PROFILE.md` only
- **fact-checker**: fails any claim that doesn't trace to `PROFILE.md` or the posting
- **form-filler** (optional, needs browser-control tooling): fills the real form, stops before Submit
- **scout** (optional): researches repos that could improve one part of the pipeline

Subagents can't message each other, so the coordinator runs stages in waves: finder, then
validators in parallel, then one tailor per GO listing, then one fact-checker per packet.

## Prerequisites

- A current Codex release (subagents on by default)
- Git
- Node.js 18+
- Optional: LibreOffice (for an exact one-page check)
- Form-filler only: browser-control tooling

## Step 1: set up a folder, from the chat

1. Make an empty folder (e.g. `job-pipeline`) and open it in Codex.
2. Paste this into the chat:

   ```
   Set this folder up for the CPVC job pipeline. Run these here, in this empty folder:
   1. git clone https://github.com/LuukMV/cpvc-agent-orchestration-codex.git .
   2. npm install --prefix resume-builder
   If git says the folder isn't empty and the only thing in it is a hidden .DS_Store file,
   delete just that file and try again. If anything else is in the folder, stop and ask me.
   If git or Node.js isn't installed, stop and tell me how to install it on my computer.
   When both steps work, tell me it's ready.
   ```

3. **Start a new chat in the same folder.** Say yes when Codex asks to trust the folder;
   it only loads `AGENTS.md` and `.codex/agents/` for trusted folders.
   Type `/model` and pick **medium** reasoning effort; the coordinator only coordinates.

## Step 2: get a profile in place

**Fast path:** paste your resume/LinkedIn text above the kickoff prompt in Step 3. `intake`
builds a first-draft `PROFILE.md` for you. Add two lines, with whatever is true for you:

```
Work authorization: U.S. citizen, no sponsorship needed
Currently enrolled: yes
```

**Thorough path:** ask your AI to copy `PROFILE_TEMPLATE.md` to `PROFILE.md`, then fill it
in yourself.

`PROFILE.md` is gitignored and never committed. Every agent reads only this file for facts
about you. Skim `RULES.md` too, it's short.

## Step 3: run the kickoff prompt

Send one message: your resume/LinkedIn text and the two extra lines (fast path only), then
the prompt block from `prompts/kickoff-prompt.md`. Type `/agent` to watch any agent work.

## Step 4: read your packets

```
runs/
  APPLICATIONS.md        start here: one row per job
  validated.md           GO/SKIP for every listing, with the reason
  packets/<company>-<role>/
    packet.md             bullets, cover letter, answers, fact-check verdict
    resume.docx            one-page tailored resume
```

Open `runs/APPLICATIONS.md` first. Only use a packet whose fact-check says PASS; answer its
open questions before you apply.

## Step 5 (optional): pre-fill a real application

Only for a packet that passed fact-check and that you've read and want to apply to. See
`prompts/form-filler-prompt.md`. Opens a fresh tab, fills what it can, stops before Submit.

## Troubleshooting

- **Codex isn't following AGENTS.md:** paste `prompts/kickoff-prompt.md`'s block directly.
- **Subagents won't spawn:** confirm the folder is trusted, or use the fallback prompt at
  the bottom of `prompts/kickoff-prompt.md`.
- **Form-filler has no browser tooling:** apply manually from the packet instead.
- **Packet keeps failing:** `PROFILE.md` is too thin, fill in more and rerun.

## Going further

- `prompts/scout-prompt.md`: point scout at one part of the pipeline you want to improve.
- Rerun `finder` with a different target role in `PROFILE.md`.
- Try the [Claude Code version](https://github.com/LuukMV/cpvc-agent-orchestration-claude).
