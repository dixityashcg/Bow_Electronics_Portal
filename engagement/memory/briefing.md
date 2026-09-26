# Briefing — v1-architecture

Compiled by rule from the memory stores — nothing here was written by a model. Read it before the inputs; act on what applies; note what you learn with `raise memory note`.

## From the engagement

- **2026-09-26 · v1-architecture** — When customers hold an identifier on paper, choosing its format is an architecture decision, not a detail. A counter has two costs that are easy to miss: any customer comparing two of their own IDs learns the business's volume, and a restore from backup hands out again numbers already printed on customers' emails. Random codes from an alphabet with no look-alikes remove both. But do the birthday arithmetic before writing down a collision rate: 1.8 million draws from 850 billion codes repeat an existing ID about twice, not once in centuries. The unique constraint and a redraw make that harmless, and the record has to say so correctly, because an EA who checks the arithmetic and finds it wrong stops trusting the rest of the record. _(bow-electronics-reseller-portal, note)_
- **2026-09-26 · d1-brd** — A discount a rep applies from memory is a judgement; the same discount pre-filled by a system is a price policy. When a quote workflow is asked to hold per-reseller discount terms, the requirement is small, but it brings a go-live dependency the request never mentioned: the terms have to be found, written down in one shape, and signed by someone commercial before they are loaded — otherwise the build turns today's habits into policy nobody agreed to. Write the pre-fill, the override-with-reason and the no-terms-on-file path as requirements, and write the signed terms list as a go-live constraint with an owner. Also record the shape you assumed (one number per reseller), because if the terms vary by product, quantity or contract, the requirement grows into a pricing rules table. _(bow-electronics-reseller-portal, note)_

## From the practice

- **2026-09-23 · v1-architecture** — A mitigation that refuses the empty configuration misses the way the configuration actually goes wrong. An allowlist guard that refuses to start on an absent or empty list still starts cleanly on a list somebody widened to a default route at 6pm to prove the application worked — which is how the restriction is really lost. Make the start-up check refuse the over-broad value too, and have QA start the system once with each bad configuration rather than only with the missing one. _(voltway-returns-portal, note)_
- **2026-09-23 · v1-architecture** — A start-up guard that refuses the absent configuration can be exactly the wrong guard when the absent value is the legitimate one. Here an empty part-classification list is a required state — before the owning team has populated it, every claim must be admitted rather than refused — so refusing to start on an empty list, which is the reflex and is what the same codebase correctly does for its network allowlist, would have broken an approved criterion. The dangerous value was the malformed one: a list carrying a class outside the two, or the same part twice, silently changes what the system applies to a customer. Ask of each configuration guard which value is legal-but-empty and which is present-but-wrong, point the refusal at the second, and have QA start the system once with each bad value rather than once with the missing one. _(voltway-warranty-claims, note)_
- **2026-09-23 · v1-architecture** — When a system takes over an identifier series that customers hold on paper, check what the backup regime does to the counter. A nightly snapshot restores the counter along with the data, so the system re-issues numbers already printed on customers' documents and two records end up sharing one identifier permanently. The lost day is unavoidable; the re-issue is not. Make advancing the counter past the highest number ever issued a mandatory step in the restore procedure, and have the system refuse to accept work until a restore marker is cleared. _(voltway-returns-portal, note)_
- **2026-09-23 · v1-architecture** — A passing check that pins an absence can be satisfied by design rather than widened. A check asserting a data directory holds exactly four named files would have failed the moment a fifth log was added — and the reflex is to add the name to the list, which is how such a check stops meaning anything. Opening the new log's handle on its first write instead left the check passing unmodified and made the file's existence evidence that the event it records actually happened. Before widening an absence check to admit new work, ask whether the new thing can be built so the absence is still true; where it genuinely cannot, scope the change to the surface the criterion is about and name what is allowed to break it, so a later addition still fails. _(voltway-warranty-claims, note)_
- **2026-09-23 · d1-brd** — A client asking for a rule to refuse a request at the door, in a system with no customer identity and no way to reach a customer afterwards, is asking for two things that pull apart: fewer refusals reaching the desk, and fewer arguments. The first is delivered by the rule; the second is not, because an unidentified visitor who is refused can resubmit with a better answer, and the desk that by design never sees the refusal cannot tell the second attempt from an honest one. The refusal also stops being evidence — where a human refusal left a thread, an automated one leaves nothing unless a requirement says otherwise. Two requirements follow and neither is in the request: record every door refusal with the values it was computed from, and treat the refusal screen as the only sentence the organisation gets to say, because nothing reaches the visitor after it. Worth applying wherever an eligibility, entitlement or qualification check is being moved from a person to a form. _(voltway-warranty-claims, note)_

## Practice for this phase

Selected by rule from the declared modules — 3 of them, the most
specific first. **When you act on one of these, name it in the artifact**: a
citation is the only way anyone can tell later whether this reached the work.

For this phase that means: **name it in the architecture or the decision it informed** — in artifacts/architecture.md or artifacts/decisions.md.
Nothing refuses if you do not; whether a piece of practice fits this Epic is
your judgement. What is not your judgement is whether anyone can tell later.

### Compliance screening gate design · `electronics-distribution-compliance-screening-gate`

**When**: Open when designing any order or shipment workflow that must run export or restricted-party screening — makes the check a gate the workflow cannot bypass under load.

From electronics-distribution (playbook) — matched on bypas, cannot, export, gate, load, order. Full text: `domains/electronics-distribution/playbooks/electronics-distribution-compliance-screening-gate.md`

### Partner EDI onboarding · `electronics-distribution-edi-onboarding`

**When**: Open when scoping a new partner file or EDI integration — prices the rejection path and the malformed sample before the mapping meeting, not after.

From electronics-distribution (playbook) — matched on integration, partner, path, price. Full text: `domains/electronics-distribution/playbooks/electronics-distribution-edi-onboarding.md`

### as-is assessment · `ed-allocation-rule-assessment`

**When**: Read when assessing an existing allocation rule before a new demand channel — shows finding who actually owns it and how often it is overridden.

From electronics-distribution (example) — matched on assessment, channel, existing, owns. Full text: `domains/electronics-distribution/examples/ed-allocation-rule-assessment.md`

## Compiled from

- `engagement/memory/lessons.md` · dff215516e4d
- `~/.raise/memory/practice/lessons.md` · 6c2778ff4ce6
