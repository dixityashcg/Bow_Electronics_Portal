# Self-assessment — Ideation & BRD

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

**Rubric**: `brd` · **Deliverable**: brd

| Criterion | Verdict | Where it fails, or why not applicable |
|---|---|---|
| `problem-distinct-from-request` (**blocking**) | | |
| `outcomes-measurable` (**blocking**) | | |
| `outcomes-are-effects` (**blocking**) | | |
| `scope-exclusions-stated` (**blocking**) | | |
| `requirements-falsifiable` (**blocking**) | | |
| `assumptions-recorded` (**blocking**) | | |
| `requirements-carry-evidence` (advisory) | | |
| `summary-stands-alone` (advisory) | | |
| `unhappy-paths-considered` (advisory) | | |
| `problem-recognisable` (advisory) | | |
| `causal-claims-tested` (advisory) | | |
| `constraints-beyond-the-stated` (advisory) | | |

## What to check for each criterion

- `problem-distinct-from-request` — the section names a role who experiences the problem and describes what that role does today instead, and neither is a restatement of the solution the client proposed (§2 Background and problem)
- `outcomes-measurable` — every row has a named measurement source, and a baseline value or an explicit statement that no baseline exists with a named owner to establish it (§3 Objectives and measurable outcomes)
- `outcomes-are-effects` — no row states a deliverable being shipped, launched, or built — each states something that changes as a result (§3 Objectives and measurable outcomes)
- `scope-exclusions-stated` — the out-of-scope list contains at least two entries, each specific enough that the finished build could be checked against it, and none is a catch-all such as "anything not listed above" (§4 Scope)
- `requirements-falsifiable` — every requirement row states a condition under which it would be unmet, without relying on words like prompt, intuitive, seamless, or robust to carry the threshold (§7 Business requirements)
- `assumptions-recorded` — every assumption the document relies on appears in writing with what becomes false if it is wrong and who confirms it, and the document carries no open questions — anything unanswered has become an assumption to confirm at review (§8 Non-functional requirements and constraints, §9 Assumptions to confirm at review)
- `requirements-carry-evidence` — every requirement row's Evidence cell names at least one dossier claim [D-nn] or client input inputs/<file>, or states "assumption" and points at the row in §9 that carries it (§7 Business requirements)
- `summary-stands-alone` — the executive summary states the request, the problem, what changes, what does not, and what approval commits the client to — and no sentence in §1–§7 uses a system, vendor or engineering term the glossary does not define (§1 Executive summary)
- `unhappy-paths-considered` — at least one requirement addresses what happens when an input is rejected, a dependency is unavailable, or a permission is missing (§7 Business requirements)
- `problem-recognisable` — whether someone who works at this client would recognise their own situation in §2, rather than a description that would fit any organisation — judged by BA
- `causal-claims-tested` — whether the document's implied claim that this work improves the stated outcomes has been tested with the client, or is presented as an untested hypothesis where it has not — judged by BA
- `constraints-beyond-the-stated` — whether the constraints section contains anything the client did not volunteer — a review process, an unowned system, a seasonal deadline — judged by BA

## Weakest points

<!--
  Report these to the operator in plain language, before they ask.

  An assessment that finds nothing wrong is not a strong result — it is one
  that was not run. Every real deliverable has a weakest point, and naming it
  yourself is what makes the rest of the assessment worth reading.
-->
