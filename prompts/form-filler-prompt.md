# Form-filler prompt (optional, separate step)

This step touches a real website with your real information. Only run it on a packet you've
actually read, whose `## Fact-check` section says PASS, and that you want to apply to.
Requires browser-control tooling in this Codex session. If you don't have it, Codex will
say so and stop rather than fake it.

Copy the block below into Codex, replacing `{PACKET}` with the path to the packet you
want filled, e.g. `runs/packets/acme-corp-mfg-intern/packet.md`.

---

Read `RULES.md` in full, then read `agents/form-filler.md` and adopt that role to pre-fill
the application in `{PACKET}`. Open the listing's URL in a brand-new tab, fill every field
you can from the packet and `PROFILE.md`, and stop before clicking Submit. Report back
exactly what's filled, what's left blank and why, and confirm the tab is still open and
ready for me to review.

---

### If you're filling more than one application

Run this prompt again with a different `{PACKET}` for each one. Each run should open its
own new tab, don't ask it to reuse the last one, that's how you lose a filled-out form with
no way to get it back.
