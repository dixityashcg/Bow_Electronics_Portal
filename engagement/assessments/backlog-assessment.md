# Self-assessment — Backlog

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

**Rubric**: `backlog` · **Deliverable**: backlog

| Criterion | Verdict | Where it fails, or why not applicable |
|---|---|---|
| `epics-demonstrable` (**blocking**) | | |
| `stories-have-criteria` (**blocking**) | | |
| `criteria-observable` (**blocking**) | | |
| `stories-carry-statement` (**blocking**) | | |
| `criteria-one-assertion-each` (**blocking**) | | |
| `demo-narrative-for-the-owner` (**blocking**) | | |
| `coverage-stated-both-ways` (**blocking**) | | |
| `unhappy-paths-present` (**blocking**) | | |
| `no-invented-scope` (**blocking**) | | |
| `slicing-is-vertical` (advisory) | | |
| `order-is-not-forced` (advisory) | | |
| `criteria-are-buildable-without-asking` (advisory) | | |

## What to check for each criterion

- `epics-demonstrable` — every Epic has demo-notes describing an action a person performs and what is visibly true afterwards, specific enough to follow without asking what was meant (each Epic block)
- `stories-have-criteria` — every Story carries at least one acceptance criterion in Given/When/Then form (each Story block)
- `criteria-observable` — every then-clause names something a person could check without being told the intended behaviour, rather than restating the story title (Acceptance Criteria lists)
- `stories-carry-statement` — every Story opens with "As a [role], I want [capability], so that [benefit]", where the role is one the client would recognise and the benefit is not a restatement of the capability (each Story block)
- `criteria-one-assertion-each` — no acceptance criterion contains more than one then-clause, and field lists appear as tables beneath the criteria rather than inside them (Acceptance Criteria lists)
- `demo-narrative-for-the-owner` — every Epic carries a "Demo — what you will see" paragraph in the second person, naming screens by the client's names, containing no system term, and ending with the stories it exercises (each Epic block)
- `coverage-stated-both-ways` — the coverage section maps every requirement id to at least one story id or lists it as deferred with a reason, and every story traces to a requirement id (§ Coverage)
- `unhappy-paths-present` — each Epic contains at least one story covering a rejection, an unavailable dependency, a missing permission, or concurrent action (each Epic block)
- `no-invented-scope` — no story introduces capability that traces to no approved requirement (§ Coverage)
- `slicing-is-vertical` — whether each Epic delivers something usable on its own, rather than being a layer of the system that only becomes useful once another Epic lands — judged by BA
- `order-is-not-forced` — whether the client could choose a different delivery order among the Epics, or whether hidden dependencies force one — judged by BA
- `criteria-are-buildable-without-asking` — whether two engineers reading a story independently would build the same thing, and a tester who was not in Discovery could write cases from it — judged by BA

## Weakest points

<!--
  Report these to the operator in plain language, before they ask.

  An assessment that finds nothing wrong is not a strong result — it is one
  that was not run. Every real deliverable has a weakest point, and naming it
  yourself is what makes the rest of the assessment worth reading.
-->
