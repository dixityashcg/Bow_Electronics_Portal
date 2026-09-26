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
| `epics-demonstrable` (**blocking**) | Pass | Each Epic's demo-notes name the actor, numbered actions and what is visible after each; prerequisites stated (store loaded, discounts set). epic-02 step 10 needs email sending switched off in the demo environment — stated in the notes. |
| `stories-have-criteria` (**blocking**) | Pass | All 33 stories carry Given/When/Then criteria (2–7 each). |
| `criteria-observable` (**blocking**) | Pass | Every then-clause names a screen value, a message, an email received, or a refusal with unchanged data. Refusal-recording criteria (story-01-04 #3, story-02-01 #5, story-02-06 #4, story-04-01 #4) name what is recorded; where it is read is left to Architecture. |
| `stories-carry-statement` (**blocking**) | Pass | Every story opens with As a / I want / so that; roles are rep, reseller buyer, reseller admin, Product Owner, Bow user named to maintain prices / set discounts. |
| `criteria-one-assertion-each` (**blocking**) | Pass | One then-clause per criterion; field lists in tables (story-01-01, story-03-01, story-05-06). |
| `demo-narrative-for-the-owner` (**blocking**) | Pass | Each Epic has a second-person 'Demo — what you will see' using client screen names and ending with Exercises. Screen names new to the glossary (open requests list, failed emails list, My requests, Users, quote builder) added to glossary. |
| `coverage-stated-both-ways` (**blocking**) | Pass | § Coverage has requirement→story for BR-01..BR-20 with no deferrals, NF handling stated, and story→requirement for all 33 stories. |
| `unhappy-paths-present` (**blocking**) | Pass | epic-01: story-01-04 (permission), story-01-01 #3 (rejected rows); epic-02: story-02-04 (rejection), story-02-05 #2 (email unavailable), story-02-06 (permission); epic-03: story-03-03 (concurrency); epic-04: story-04-03, story-04-04 (rejection, empty list); epic-05: story-05-04 (expired), story-05-05 (already/concurrent); epic-06: story-06-03 (permission). |
| `no-invented-scope` (**blocking**) | Pass | Every story traces to a BR. Items that go beyond BRD words are decisions put to the BA (D2-Q1..Q5) or stated assumptions: rep-side user creation (story-02-01, story-03-04 #5) rests on D2-Q1/Q5; story-03-06 (internal admin reassigns) is the operator's decision D2-C1 and extends BR-10 with a role the BRD does not name — marked in Coverage for Jensen Huang to confirm at the gate; past-date valid-until refusal (story-04-05 #3) and change-request comment required (story-05-02 #1, BR-14 says 'with a comment') are rejection paths of the BR they sit under. |
| `slicing-is-vertical` (advisory) | Pass | Each Epic is a person newly able to do something end to end (maintain prices, request, triage, quote, respond, manage users); none is a layer. |
| `order-is-not-forced` (advisory) | Fail | epic-01 → epic-02 → epic-03 → epic-04 → epic-05 is fixed (products, then resellers and emails, then a taken request, a sent quote, a response); only epic-06 is free after epic-02. The chain follows the business process and is stated under Delivery order. |
| `criteria-are-buildable-without-asking` (advisory) | Pass | Five ambiguities put to the BA and applied (D2-Q1..Q5). Mechanisms deferred to Architecture are written as observable behaviour: named-user lists (story-01-04), sign-in (story-02-01), email platform (story-02-05), five-year keeping (story-05-07), 'today' for expiry (story-05-04). Rounding of net price (story-04-02) is a DoD item to agree with Jensen Huang, not a criterion gap. |

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

1. **The order is forced.** Only epic-06 can move. The Delivery order section says so.
2. **Demos can pass on empty data.** Search passes on a store with three products, and quoting passes when no reseller has a discount. story-04-04 #5 makes the empty discount list visible, and the demo-notes forbid running against an empty store or with no discounts on file. The signed discount list (NF-10) and the ERP owner (NF-03) are still unnamed go-live dependencies outside the build.
3. **story-03-06 goes beyond the approved BRD.** The internal admin role (D2-C1) was decided by the operator, not approved in g1-brd. It is marked in Coverage. If Jensen Huang does not confirm it at the gate, remove it or route it through a g1-brd change.
4. **Failed response emails to the rep are not listed.** The BRD asks for a failure list only for BR-07 and BR-13. Stated as an assumption, not filled in.
5. **Refusal records have no reader yet.** BR-03 says refused attempts are logged. The stories record them, but no screen shows them. Where they are read is left to Architecture.

6. **Two change requests are pending outside this backlog.** BR-06 received time for rep-entered requests, and closing abandoned requests. Both are for the operator to raise against g1-brd. Until they are decided, the reps' oldest-first order is out for requests keyed in late.
