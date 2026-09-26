# Self-assessment — QA

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

**Rubric**: `qa-report` · **Deliverable**: qa-report

| Criterion | Verdict | Where it fails, or why not applicable |
|---|---|---|
| `independence-stated` (**blocking**) | | |
| `every-criterion-has-a-result` (**blocking**) | | |
| `defects-carry-reproductions` (**blocking**) | | |
| `expectations-are-sourced` (**blocking**) | | |
| `boundaries-were-tested` (**blocking**) | | |
| `repeats-and-sequences-tested` (**blocking**) | | |
| `authorization-probed` (**blocking**) | | |
| `untested-areas-named` (**blocking**) | | |
| `criterion-disputes-escalated` (**blocking**) | | |
| `cases-trace-to-criteria` (**blocking**) | | |
| `every-case-has-an-outcome` (**blocking**) | | |
| `results-name-the-build` (**blocking**) | | |
| `failures-have-defects` (**blocking**) | | |
| `criterion-questions-kept-separate` (**blocking**) | | |
| `severity-by-consequence` (advisory) | | |
| `observation-separated-from-diagnosis` (advisory) | | |
| `tests-beyond-the-criteria` (advisory) | | |

## What to check for each criterion

- `independence-stated` — the report states whether the session performing QA also performed the build, and names the agent set and model actually used — a tier alone does not satisfy this, because a tier describes what the host could support and not what happened (§ Independence achieved)
- `every-criterion-has-a-result` — every acceptance criterion in the Epic appears with a result of passed, failed, or not tested — none omitted, and "not tested" carries a reason (§ Acceptance criteria)
- `defects-carry-reproductions` — every defect states a starting state, the exact steps, the observed result, and the expected result — a finding without these is an observation, not a defect report (§ Defects)
- `expectations-are-sourced` — every defect cites where its expected behaviour comes from — an acceptance criterion, a committed non-functional target, or a stated security expectation (§ Defects)
- `boundaries-were-tested` — for each threshold or limit the Epic contains, a test exists at the boundary value itself, not only on either side of it (§ System-level testing)
- `repeats-and-sequences-tested` — at least one state-changing operation was run twice, and at least one sequence crossing two or more stories was run end to end (§ System-level testing)
- `authorization-probed` — an attempt was made to perform an operation or read a record as a caller not entitled to it, and the outcome recorded (§ Security)
- `untested-areas-named` — the section lists what was not tested and why, and is not empty (§ Not tested, and why)
- `criterion-disputes-escalated` — where a test failed because the criterion appears wrong rather than the code, it is recorded as escalated and the criterion is unchanged (§ Defects, § Acceptance criteria)
- `cases-trace-to-criteria` — every acceptance criterion in the Epic appears in the coverage table with at least one case against it, and every case names the technique that produced it (test-cases.md §2 Coverage of acceptance criteria, §3 Test cases)
- `every-case-has-an-outcome` — every case in the design appears in the results with passed, failed, blocked, or not executed — and the executed plus not-executed counts sum to the number designed (test-results.md §1 Summary, §2 Results by case)
- `results-name-the-build` — the build or commit tested is recorded, so the result can be tied to a version of the code (test-results.md header)
- `failures-have-defects` — every failed case names an entry in the defect log, and every defect names the case that found it (test-results.md §2, defect-log.md)
- `criterion-questions-kept-separate` — behaviours where the criterion appears wrong are recorded under criterion questions rather than as defects, and are addressed to the operator (criterion-questions.md (defect-log.md § Criterion questions on earlier records))
- `severity-by-consequence` — whether each severity reflects what happens if the defect ships, rather than how hard the defect was to find or how large the code change is — judged by FDE
- `observation-separated-from-diagnosis` — whether each defect distinguishes what was observed from what is inferred, so a wrong hypothesis does not send the fix to the wrong place — judged by FDE
- `tests-beyond-the-criteria` — whether the test set is materially larger than the acceptance criteria, and whether each additional test is attributable to a named technique rather than to inspiration — judged by FDE

## Weakest points

<!--
  Report these to the operator in plain language, before they ask.

  An assessment that finds nothing wrong is not a strong result — it is one
  that was not run. Every real deliverable has a weakest point, and naming it
  yourself is what makes the rest of the assessment worth reading.
-->
