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
| `every-epic-accounted-for` (**blocking**) | | |
| `delivery-claims-are-sourced` (**blocking**) | | |
| `exclusions-carry-a-basis` (**blocking**) | | |
| `artifact-index-carries-fingerprints` (**blocking**) | | |
| `deployment-claims-are-marked` (**blocking**) | | |
| `change-history-is-complete` (**blocking**) | | |
| `open-defects-are-stated` (**blocking**) | | |
| `risks-are-owned` (**blocking**) | | |
| `ownership-is-explicit` (**blocking**) | | |
| `record-is-independently-verifiable` (**blocking**) | | |
| `readable-by-someone-who-was-not-there` (advisory) | | |

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
