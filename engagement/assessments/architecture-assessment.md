# Self-assessment — Solution Architecture

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

**Rubric**: `architecture` · **Deliverable**: architecture

| Criterion | Verdict | Where it fails, or why not applicable |
|---|---|---|
| `requirements-traced` (**blocking**) | | |
| `decisions-carry-alternatives` (**blocking**) | | |
| `decisions-carry-consequences` (**blocking**) | | |
| `decisions-have-revisit-conditions` (**blocking**) | | |
| `trust-boundaries-drawn` (**blocking**) | | |
| `threats-name-consequences` (**blocking**) | | |
| `accepted-risks-owned` (**blocking**) | | |
| `mitigations-are-testable` (**blocking**) | | |
| `nonfunctional-targets-are-numbers` (**blocking**) | | |
| `existing-system-constraints-carried` (**blocking**) | | |
| `summary-readable-cold` (advisory) | | |
| `buildable-in-slices` (advisory) | | |
| `operable-by-this-client` (advisory) | | |
| `decisions-worth-recording` (advisory) | | |

## What to check for each criterion

- `requirements-traced` — every approved requirement appears against a component or a stated deferral, and no component exists that traces to no requirement (§9 Traceability)
- `decisions-carry-alternatives` — every decision record names at least one rejected alternative with the constraint that eliminated it, or states explicitly that none was considered and why (decisions.md, each ADR)
- `decisions-carry-consequences` — every decision record states at least one cost, limitation, or thing it forecloses — not only benefits (decisions.md, each ADR)
- `decisions-have-revisit-conditions` — every decision record names the condition under which it should be reopened — a volume, a date, or a change in a dependency (decisions.md, each ADR)
- `trust-boundaries-drawn` — the threat model names each boundary where control changes hands, and each data class with who may read and change it (§8 Security)
- `threats-name-consequences` — every threat states what specifically happens if it fires, naming the data and the party, rather than a category such as breach or injection (§8 Security)
- `accepted-risks-owned` — every accepted risk names the person who accepted it and the date (§8 Security)
- `mitigations-are-testable` — every mitigation is phrased as something QA could attempt and observe, rather than as an instruction to implement (§8 Security)
- `nonfunctional-targets-are-numbers` — every non-functional target states a number and how it will be measured, or is recorded as not committed (§7 Non-functional targets)
- `existing-system-constraints-carried` — for a brownfield engagement, every constraint from the as-is assessment appears in the design or is explicitly addressed (§3 Constraints, as-is assessment §6)
- `summary-readable-cold` — the executive summary names the approach, the decisions that matter most, what it costs to run and what it does not attempt, and §1–§2 use the client's names for their systems with no unexplained acronym (§1 Executive summary, §2 Context)
- `buildable-in-slices` — whether the Epics in the approved backlog can each be built and demonstrated against this design, rather than requiring most of the architecture to exist first — judged by FDE
- `operable-by-this-client` — whether the client's own team could run, monitor, and recover this — as opposed to whether it is well designed in the abstract — judged by EA
- `decisions-worth-recording` — whether each decision recorded would genuinely be expensive to reverse, and whether any decision of that kind is missing — judged by FDE

## Weakest points

<!--
  Report these to the operator in plain language, before they ask.

  An assessment that finds nothing wrong is not a strong result — it is one
  that was not run. Every real deliverable has a weakest point, and naming it
  yourself is what makes the rest of the assessment worth reading.
-->
