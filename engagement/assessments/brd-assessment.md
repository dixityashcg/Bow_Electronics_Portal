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
| `problem-distinct-from-request` (**blocking**) | Pass | §2.2 names two roles — internal sales reps and resellers' buyers — and what each does today instead: the rep logs the phone call in Excel, prices from the ERP spreadsheet and quotes by hand; the buyer phones again for status. Neither is phrased as the portal. §2.1 keeps the request separately, labelled as the client's preference. |
| `outcomes-measurable` (**blocking**) | Pass | O-01 to O-03 each name a source (rep tally or sample checked against the portal's request list; the portal's recorded times; a status-call tally) and state that no baseline exists, with Jensen Huang named to establish it and when. The weak spot: every source except the portal's own record is a manual sample that does not exist yet. |
| `outcomes-are-effects` (**blocking**) | Pass | No row names a deliverable. O-01 (fewer requests existing only in a call or spreadsheet) is the closest to an adoption measure; it is kept because the client's one stated outcome is that no request goes untracked, and it counts requests that escaped, not portal usage. |
| `scope-exclusions-stated` (**blocking**) | Pass | §4.2 has seven exclusions, each checkable: payments/invoicing, fulfilment after approval, stock, historical migration, electronic quote exchange, classification/screening, discount approval. Each names who raised it. None is a catch-all. |
| `requirements-falsifiable` (**blocking**) | Pass | BR-01 to BR-20 each carry an explicit 'Unmet if' condition. Weakest: BR-04 falsifies only exact part-number search; search by description words has no stated failure condition beyond a closed product appearing. |
| `assumptions-recorded` (**blocking**) | Pass | §9 A-01 to A-15 each give the adopted answer, what becomes false and a confirmer; §8 NF rows name owners. No questions remain in the document (checked: no '?' in brd.md). The five Discovery answers (A-02, A-04, A-05, A-07, A-10) are marked as the operator's, pending client confirmation. |
| `requirements-carry-evidence` (advisory) | Pass | Every §7 row cites D-nn and/or inputs/brief.md; rows resting on a guess also name the §9 assumption (A-01, A-02, A-03, A-04, A-05, A-07, A-08, A-14, A-15). |
| `summary-stands-alone` (advisory) | Pass | §1 states the request, the problem, what changes, what does not (payments, fulfilment, stock, history) and what approval commits Bow to. System terms in §1–§7 (ERP, CRM, catalog and pricing store) are in the glossary. It runs long for five sentences. |
| `unhappy-paths-considered` (advisory) | Pass | BR-03 (reseller reaching internal screens refused), BR-05 (invalid request refused with the line named), BR-07/BR-13 (email failure listed for sales), BR-12 (expired quote cannot be approved), BR-14 (response to closed quote refused), BR-18 (closed product flagged on open requests), BR-20 (no discount on file). |
| `problem-recognisable` (advisory) | Pass | Judged by BA — agent's provisional view. §2.2 uses the client's own specifics (phone, Excel request log, home-grown ERP spreadsheet, reps losing track of arrival time, key-client losses). But it is built from one relayed conversation; no one at Bow has read it back. The BA should confirm with the PO before treating this as a pass. |
| `causal-claims-tested` (advisory) | Pass | Judged by BA — agent's provisional view. The claim is not tested with the client; it is presented as untested: §2.2 'The causal claim' paragraph, A-09 (key-client business) and A-13 (resellers will use a portal). The verdict is a pass on presentation, not on testing. |
| `constraints-beyond-the-stated` (advisory) | Pass | Judged by BA — agent's provisional view. Not volunteered by the client: NF-01 one source of price at cutover, NF-03 unowned ERP spreadsheet, NF-04 reseller accounts with no CRM, NF-05 requests open at go-live, NF-07 personal data law, NF-08 unknown volumes, NF-10 discount terms to be signed, plus A-08 export jurisdiction. |

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

1. **Nothing in this document has been heard from Bow directly.** Every fact comes from one conversation relayed by Yash Dixit. The whole §4.2 boundary is the agent's recommendation accepted by the operator (A-12). The five Discovery answers were given by the operator, not the client. The review with Jensen Huang is the first time the client sees any of it.
2. **No outcome can be judged on the day this is approved.** Every baseline is missing. O-02 and O-03 have no target by design (A-10). O-01's measurement depends on reps keeping an honest tally of calls, which is the very habit the problem says they lack.
3. **BR-20 / NF-10 (standard discount per reseller) is the biggest scope risk.** It was added on the operator's answer to Q4, and it rests on A-07: that a reseller's terms fit in one number. Where those terms live today is unknown. If they turn out to vary by product, quantity or contract, this requirement grows into a pricing rules engine, and go-live waits on a signed terms list.
4. **Timings are the agent's (A-15).** The 15-minute email and one-minute list thresholds were not set by anyone at Bow.
5. **Export position is unknown (A-08).** BR-19's five-year retention and the screening exclusion both depend on whether Bow exports under US jurisdiction and screens today. If Bow does not screen, an approved quote could lead to a shipment nobody screened. The BRD raises this and does not solve it.
6. **BR-04 search by description** has no quality threshold. Only exact part-number search can clearly be failed.
7. **No reseller has been asked** whether they would use a portal rather than phone (A-13). That is the pre-mortem's failure mode.
