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
| `independence-stated` (**blocking**) | Pass | qa-report § Independence achieved: tier 3 stated, with the agent (a QA sub-agent, not the raise-qa definition), the model (Claude Opus 5.5), what was read beyond the black box (route declarations, schemas, parsers), and that the build model is unknown, so the same model may have built and tested |
| `every-criterion-has-a-result` (**blocking**) | Pass | qa-report § Acceptance criteria: 19 of 19 rows, each Passed; CQ-01 and CQ-02 noted against #2 and #5 without changing the result the criterion as written earned |
| `defects-carry-reproductions` (**blocking**) | N/A | No defect was raised (defect-log § Open defects). Every executed case carries its full HTTP exchange in evidence/<case>/http-log.json, so each outcome can be replayed |
| `expectations-are-sourced` (**blocking**) | N/A | No defect was raised. Every case in test-cases.md §3 names what it traces to (criterion, threat, N-target, practice lesson) |
| `boundaries-were-tested` (**blocking**) | Pass | test-cases.md §4 lists 10 thresholds; each has a case on the value itself: 0.0001 and 0 (TC-20/29), 900719925474.0991/.0992 (TC-20/29/53), 64/65 characters (TC-21), 500/501 (TC-30), 0 and 100 % (TC-51), N = 0 and 1 (TC-25) |
| `repeats-and-sequences-tested` (**blocking**) | Pass | Repeats: TC-24 (load twice), TC-33 (close twice), TC-31 (same price), TC-36 (name and remove twice). Cross-story: TC-34, TC-35, TC-54. Concurrency: TC-27, TC-32, TC-55 |
| `authorization-probed` (**blocking**) | Pass | qa-report § Security: TC-10–14, 19, 37–44 and 46, each refusal paired with a success on the same route in the same run (TC-12, TC-39, TC-42) |
| `untested-areas-named` (**blocking**) | Pass | qa-report § Not tested, and why: 9 entries, each with its reason (no browser, no real ERP, N-01 environment, Stage 2, N-11, real second origin, one role manager, empty history tables) |
| `criterion-disputes-escalated` (**blocking**) | Pass | criterion-questions.md CQ-01 to CQ-03, each with a recommended answer and the answer cell left for the operator (sub-agent, cannot ask). Criteria quoted unchanged; TC-28 recorded Blocked, not Passed or Failed |
| `cases-trace-to-criteria` (**blocking**) | Pass | test-cases.md §2 maps all 19 criteria to at least one case; every row in §3 names its technique (TC-54/55 marked as added during execution) |
| `every-case-has-an-outcome` (**blocking**) | Pass | test-results.md §1: 55 designed, 55 executed + 0 not executed = 55; 54 passed, 0 failed, 1 blocked. §2 has a row for each of TC-01 to TC-55 |
| `results-name-the-build` (**blocking**) | Pass | test-results.md header: commit 762f093, HEAD c7e3524, no source change between them |
| `failures-have-defects` (**blocking**) | N/A | No case failed. The one case that did not pass (TC-28) is Blocked on criterion question CQ-01, which is named in its Defect column rather than a defect |
| `criterion-questions-kept-separate` (**blocking**) | Pass | criterion-questions.md holds CQ-01 to CQ-03, addressed to the operator; defect-log.md holds no criterion question and points to that file |
| `severity-by-consequence` (advisory) | N/A | No defect, so no severity was assigned; for the FDE to confirm that none of CQ-01 to CQ-03 should have been a defect instead |
| `observation-separated-from-diagnosis` (advisory) | Pass | criterion-questions.md separates "Observed behaviour" from "Why the criterion may be wrong"; test-results.md §5 records the two harness corrections (TC-28 CRLF, TC-55 timing) as QA errors, not portal behaviour |
| `tests-beyond-the-criteria` (advisory) | Pass | 55 cases against 19 criteria; the 36 beyond each name a technique (boundary 5, failure mode 10, state transition 4, cross-story 3, authorization 7, non-functional 4, regression 1, exploratory 2) |

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

1. **Nothing was clicked in a browser.** Every case drove the HTTP routes the screens call. The words a person reads on the store pages have not been seen by QA or by the build. This is the largest gap, and the Epic Review is the first place it closes.
2. **The independence claim is only tier 3.** This is a fresh context, not a distinct agent definition, and the model may be the same one that built the Epic. This context also read the route declarations, schemas and parsers to learn the interface. That is not the builders' reasoning, but it is more than a black box.
3. **No defect was found.** The build went through three review rounds before QA, and the harness was checked against itself: every refusal paired with a success, database bytes rather than rendered text, concurrency rather than sequence. A clean log after 55 cases is still a statement about those 55 cases. The three findings that matter came as criterion questions, and they were found at the seams between documents, not inside any one story.
4. **N-01 was not judged.** A busy host made the 250,000-product figure swing from 256 ms to 2,288 ms. The honest result is "needs a clean retest", not a number.
5. **The test-count check (self-check 1).** 55 cases against 19 criteria is not close to the list, so this is not only a test of the criteria. But 19 of the cases are one-to-one with criteria. The weight of the extra testing sits on the load and on authorization, and it is thinner on price history (TC-07, 08, 31, 32).

