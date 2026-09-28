# Self-assessment — Handover

<!--
  Internal working evidence. This does NOT go to the client, and its content
  must not appear in the deliverable.

  The criteria below are generated from the phase's rubric — the same rubric
  the operator reviews at the gate. Do not add, remove, or reword them here.
  An assessment that could restate its own criteria would be a second copy of
  them, and the two would drift within a release.

  Every criterion needs a verdict. Write one of:

    Pass    — the deliverable meets it, and you can say where
    Fail    — it does not; name the exact section, row, or id that fails
    N/A     — it does not apply, with the reason

  A blank cell, or one reading "partially" or "see below", is not a verdict.
  `raise phase complete` refuses the phase until every criterion carries one,
  because an unreadable verdict read as a pass is the failure this file exists
  to prevent.
-->

**Rubric**: `handover` · **Deliverable**: handover

| Criterion | Verdict | Where it fails, or why not applicable |
|---|---|---|
| `every-epic-accounted-for` (**blocking**) | Pass | All six backlog Epics appear: epic-01 under § What was delivered; epic-02 to epic-06 under § What was not delivered, each Excluded. None omitted, no third status |
| `delivery-claims-are-sourced` (**blocking**) | Pass | epic-01 names its g4-epic-review approval: Yash Dixit (FDE), 2026-09-27, relayed, operator-asserted. Checked against `raise gate status` and ledger 72b7b8f0, not against memory. The pack says no client statement is attached |
| `exclusions-carry-a-basis` (**blocking**) | Pass | Each row gives the requester (Jensen Huang), the decider (Yash Dixit), the date, the client's words, the meeting reference, and what Bow lacks without that Epic. Weak point: the recorded reason is thin ("epic-01 proves the flow"), and the reference is operator-entered, not retrievable. Both are stated |
| `artifact-index-carries-fingerprints` (**blocking**) | Pass | All 9 client deliverables approved at a gate are listed with the SHA-256 from `raise verify --json`. Documents with no recorded fingerprint are named as such. Internal assessments and critiques are left out because they are not client deliverables |
| `deployment-claims-are-marked` (**blocking**) | Pass | § Deployment reads exactly "Deployment not recorded." (`raise deployment list`: none). The pack says Stage 2 is not built. It makes no claim about deployment beyond that |
| `change-history-is-complete` (**blocking**) | Pass | cr-01, cr-02 and cr-03 (all from `raise change list`) appear with outcome Rejected, the decider, the date, relayed and operator-asserted, and the note that no reason is recorded. Impact is marked as the operator's assessment ("not assessed") |
| `open-defects-are-stated` (**blocking**) | Pass | No defect is open (epic-01 `defect-log.md`), and the pack says so. Open non-defect items are listed individually with what each affects: CQ-01, CQ-02, CQ-03, the real-ERP DoD run, N-01, and two observations |
| `risks-are-owned` (**blocking**) | Pass | R-01 to R-06 are each given with a trigger, and the pack says they were only provisionally accepted by the FDE and are not individually ratified on the record. The pack adds the live risks left by the rejected change requests and CQ-03, plus no ERP owner, Stage 2 not built, runbooks not written and no support partner |
| `ownership-is-explicit` (**blocking**) | Pass | § What you operate from here states what Bow owns (the repository, the record, the design), what runs today (Stage 1 only, with the commands), and the full list of what production would need. The repository is still under `dixityashcg`, and the pack states its transfer to Bow as an open action (confirmed by the FDE, 2026-09-27) |
| `record-is-independently-verifiable` (**blocking**) | Pass | The commands are copied from `engagement/keys/VERIFYING.md` (fsck, log, grep sha256, shasum, grep relayed), and the pack points to that file. It says no allowed-signers file exists, so who recorded a decision is not proven |
| `readable-by-someone-who-was-not-there` (advisory) | Pass | The opening paragraph says what was and was not received, and that no reseller can use the portal. Each section is written without engagement shorthand, and any code (CQ, R-, T-) is explained where it is used. The document is long, but the length is carried by tables a newcomer can scan |

## What to check for each criterion

- `every-epic-accounted-for` — every Epic defined in the approved backlog appears with a disposition of delivered or excluded — none omitted, and no Epic listed under a status that is neither (§ What was delivered / § What was not delivered)
- `delivery-claims-are-sourced` — every Epic stated as delivered names the Epic Review decision that carried it, with the approver and the date — a claim of delivery with no decision behind it does not satisfy this (§ What was delivered)
- `exclusions-carry-a-basis` — every Epic that did not ship states why and who decided it, in terms a reader outside the engagement can act on — "descoped" alone is a label, not a basis (§ What was not delivered)
- `artifact-index-carries-fingerprints` — every client deliverable is listed with the fingerprint recorded for it, so a reader can tell which version of each document was accepted (§ Artifact index)
- `deployment-claims-are-marked` — any deployment stated is marked as self-reported by the operator, and where none is recorded the section reads "deployment not recorded" rather than asserting that nothing was deployed (§ Deployment)
- `change-history-is-complete` — every change request raised during the engagement appears with its outcome — accepted, rejected, withdrawn, or still open — and none is omitted; assessed impact, where stated, is marked as the operator's assessment rather than a measurement (§ Change requests)
- `open-defects-are-stated` — defects still open at handover are listed individually with what each one affects — a count, or a statement that defects exist, does not satisfy this (§ Open defects)
- `risks-are-owned` — each risk still live is stated as something the client is taking on, with what would trigger it, including risks accepted rather than resolved during architecture (§ Risks you now own)
- `ownership-is-explicit` — what the client now owns and operates is stated, together with what they need in order to operate it (§ What you operate from here)
- `record-is-independently-verifiable` — instructions are present for verifying the engagement record with git alone — no RAISE installation, no network — and the commands shown match those the engagement actually ships (§ Verifying this record without RAISE)
- `readable-by-someone-who-was-not-there` — whether a competent person who joined the client last week could read this document and know what they received, what they did not, and what they now have to do — judged by FDE

## Weakest points

<!--
  Report these to the operator in plain language, before they ask.

  An assessment that finds nothing wrong is not a strong result — it is one
  that was not run. Every real deliverable has a weakest point, and naming it
  yourself is what makes the rest of the assessment worth reading.
-->

1. **Delivery rests on the operator's word alone.** epic-01's Epic Review approval is by the FDE, relayed and operator-asserted. No PO or EA statement is attached, and the record does not say whether the Epic Review demonstration happened. g5 is the first point where the client speaks on delivery.
2. **story-01-01 is not done by its own DoD.** The real-ERP run is outstanding (no ERP owner), yet the Epic was approved. The pack says so. A reader could still ask why an Epic with an undone story counts as delivered.
3. **The change request rejections carry no reason and no client voice.** All three were rejected by the FDE, relayed, with impact "not assessed". Two of them (cr-01, cr-02) mitigate the live go-live risks CQ-02 and CQ-03.
4. **CQ-01 to CQ-03 are unanswered on the record.** The Epic Review brief carried them, but no answer was recorded.
5. **The §10.4 runbooks were never written.** This is the same pattern as the practice lesson from 2026-09-23: a non-code Build deliverable absent at handover with every gate green. It is mitigated only by stating it.
6. **R-01 to R-06 have no per-risk ratification.** Elon Musk approved the architecture that listed them for ratification, but did not ratify each risk.
7. **`raise verify` reports PII-pattern warnings** (phone numbers, email addresses) in epic-01's QA artifacts and evidence. The seed is fictional by design, so these are probably fictional values. That has not been checked line by line here.

