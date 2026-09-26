# Self-assessment — Build

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

**Rubric**: `dev-demo` · **Deliverable**: demo-record

| Criterion | Verdict | Where it fails, or why not applicable |
|---|---|---|
| `every-criterion-demonstrated` (**blocking**) | Pass | demo-record.md § Against which acceptance criteria: all 19 criteria are mapped to steps 1–10, each an action on the running portal; story-01-04 c5 by step 10 (direct request with curl). Rehearsed over HTTP against `dev.sh`, not through a browser |
| `demo-follows-the-backlog-notes` (**blocking**) | Pass | demo-record.md § What will be shown: steps 1–6 follow the demo-notes (1)–(6) in order; steps 7–10 are additions, and say so |
| `failure-paths-shown` (**blocking**) | Pass | Steps 6, 7, 8, 9 and 10: a removed price maintainer refused, a reseller refused a store page, a removed discount setter refused, a rep named for nothing refused, a direct request refused; step 1 shows eight rows refused with reasons |
| `incomplete-work-named` (**blocking**) | Pass | demo-record.md § Known gaps: story-01-01 not done (real ERP, provisional mapping), the three open change requests, the minimal discount action, the Stage 2 deferral, no browser run, no internal users screen, times in UTC, what the load refuses |
| `review-record-present` (**blocking**) | Pass | internal/review-record.md §1 (what was reviewed), §2 (what was not), §3 and §3a (every required change and finding, with status) |
| `review-coverage-declared` (**blocking**) | Pass | internal/review-record.md §2 names eight areas: the real ERP, SQL Server, four seed and test files, the browser, the production bundles, four minor screens, performance and accessibility, and the dependency audit |
| `required-changes-resolved` (**blocking**) | Pass | internal/review-record.md §3/§3a: R-1, the one required change, is done (2ce51fe); every non-blocking item is done or decided by the FDE (R-4 built; R-6 and R-10 as cr-01 to cr-03) |
| `risks-carried-to-qa` (**blocking**) | Pass | internal/review-record.md §5: eleven areas, including N-3's fix verified only by the build |
| `scope-matches-the-stories` (advisory) | Pass | Beyond the stories, only what the FDE decided (the discount set action) or the architecture requires (the walking skeleton, T-05 admission, the refused attempts list). Nothing requested was dropped silently; story-01-01's real-file run is named as not done |
| `demo-would-convince-a-stranger` (advisory) | Pass | Every step is an action with a visible outcome, including ten refusals. The weakest point: step 1 always ends "Not complete" on the sample, which a stranger may read as a failure until cr-01 lands |
| `conventions-followed` (advisory) | N/A | Greenfield: there is no earlier code in these modules. The build follows the architecture's stated stack (§4.3) and one convention throughout: explicit injection tokens, shared Zod schemas, whole-number money |

## What to check for each criterion

- `every-criterion-demonstrated` — every acceptance criterion in the Epic is shown by an action performed against the running system, with the observable outcome recorded — not by showing code or describing intent (demo-record.md § Criteria demonstrated)
- `demo-follows-the-backlog-notes` — what was demonstrated matches the demo-notes the backlog recorded for this Epic, or the difference is stated (demo-record.md § What was shown)
- `failure-paths-shown` — at least one rejection, unavailable dependency, or unauthorised attempt is demonstrated, not only successful paths (demo-record.md § Criteria demonstrated)
- `incomplete-work-named` — anything in the Epic not finished, or finished differently from the story, is listed rather than omitted (demo-record.md § Not complete)
- `review-record-present` — the review record states what was examined, what was not, and every required change with whether it was made (internal/review-record.md §1, §2, §3)
- `review-coverage-declared` — the review record's not-reviewed section names files or areas and is not empty, N/A, or a claim of complete coverage (internal/review-record.md §2)
- `required-changes-resolved` — every required change is marked done, or carries a recorded reason for not being made (internal/review-record.md §3)
- `risks-carried-to-qa` — the review record names where the reviewer is unsure, by area, for QA to probe (internal/review-record.md §5)
- `scope-matches-the-stories` — whether the work delivered is what the stories asked for, without unrequested refactors bundled in or requested behaviour quietly dropped — judged by FDE
- `demo-would-convince-a-stranger` — whether someone who was not in Discovery would accept, from this demo, that the Epic does what was agreed — judged by FDE
- `conventions-followed` — whether the new code matches the conventions in use where it landed, rather than introducing a further style into the same module — judged by FDE

## Weakest points

1. **story-01-01 is not done.** It has never run against the real ERP, the column mapping is provisional, and no ERP owner is named. Every load claim rests on a sample file the team made.
2. **The go-live load has one attempt.** Until cr-01 is accepted and built, any not-loaded row leaves the summary at "Load not complete" for good, and nothing lets Jensen sign it as complete.
3. **Nobody has clicked through the screens.** The server behaviour is tested and was run over HTTP. The React screens were typechecked, built and reviewed from source only.
4. **The page-spelling guard needed three attempts.** The third (762f093) was verified by the build's own fuzz probe, not by a reviewer.
5. **Every database guarantee is proved on SQLite only.** Ledger immunity against administrators, true concurrency and SQL Server full-text are Stage 2.

<!--
  Report these to the operator in plain language, before they ask.

  An assessment that finds nothing wrong is not a strong result — it is one
  that was not run. Every real deliverable has a weakest point, and naming it
  yourself is what makes the rest of the assessment worth reading.
-->
