# Form-filler prompt (optional, separate step)

Only run on a packet you've read, whose `## Fact-check` says PASS. Requires browser-control tooling in this Codex session; if you don't have it,
Codex says so and stops.

Copy the block below, replacing `{PACKET}` with the packet path, e.g.
`runs/packets/acme-corp-mfg-intern/packet.md`.

---

Read `RULES.md`, then read `agents/form-filler.md` and adopt that role to pre-fill `{PACKET}`. Open the
listing's URL in a brand-new tab, fill what you can from the packet and `PROFILE.md`, stop
before Submit. Report what's filled, what's blank and why, and confirm the tab is open.

---

### More than one application

Run this again with a different `{PACKET}` each time, in its own new tab. Never reuse a
tab, that loses the filled-out form with no way back.
