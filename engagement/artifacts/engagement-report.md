# Engagement report — Bow Electronics Reseller Portal

_Generated from the engagement record on 2026-09-28. Every figure is a projection of the ledger; "not recorded" means exactly that._

## Executive summary

6 Epic(s) were defined at the approved backlog: 1 delivered, 5 excluded by recorded decision. 3 change request(s) were raised over the engagement. The full decision register, artifact fingerprints, and verification instructions are in the handover pack.

## Objectives (from the approved BRD)

Bow Electronics asked for a web portal where resellers log in, search Bow's products and request a quote, and where the internal sales team builds quotes that resellers can approve, request a change to, or decline. The problem behind it is that every reseller request lives in a phone call and a rep's spreadsheet: requests are lost or delayed, reps lose track of when a request arrived and cannot prioritise, resellers phone again to ask where their quote stands, and business with key clients is lost. This work gives every quote request an ID and a timestamp from the moment it is made, puts every open request in one prioritised view for the reps, lets resellers see their own status, and replaces the Excel ERP with a catalog and pricing store as the source of every quote price. It does not take payments or invoice, does not fulfil or ship anything after a quote is approved, does not manage stock, and does not move historical requests out of the spreadsheets. Approving this document makes the scope in §4 and the requirements in §7 the basis of the backlog, and commits Bow to the go-live preconditions in §8 — above all, that from go-live every quote is priced from the new store and every request, including one taken by phone, is entered in the portal.

## Delivery, Epic by Epic

### epic-01 — The catalog and pricing store replaces the Excel ERP

Delivered — Epic Review approved (QA) on 2026-09-27 by Yash Dixit.

Quality: 0 defect(s) found in QA, 0 resolved, 0 open at delivery; QA evidence for 54 of 54 executed cases. Acceptance criteria: 19 of 19 verified — 19 by the build at aca7300.

### epic-02 — A reseller user requests a quote and gets a request ID

Excluded from delivery — Descoped for this engagement: epic-01 proves the flow; the rest move to a follow-on, decided by Yash Dixit on 2026-09-27.

### epic-03 — Reps see every open request in one list, including the ones that came by phone

Excluded from delivery — Descoped for this engagement: epic-01 proves the flow; the rest move to a follow-on, decided by Yash Dixit on 2026-09-27.

### epic-04 — Reps build and send a quote priced from the store, with the reseller's discount filled in

Excluded from delivery — Descoped for this engagement: epic-01 proves the flow; the rest move to a follow-on, decided by Yash Dixit on 2026-09-27.

### epic-05 — The reseller answers the quote, and both sides see the same status

Excluded from delivery — Descoped for this engagement: epic-01 proves the flow; the rest move to a follow-on, decided by Yash Dixit on 2026-09-27.

### epic-06 — Reseller admins manage their own company's users

Excluded from delivery — Descoped for this engagement: epic-01 proves the flow; the rest move to a follow-on, decided by Yash Dixit on 2026-09-27.

## Decisions register (standing decisions)

| Gate | Scope | Decision | By | On |
|---|---|---|---|---|
| BRD approved (Ideation & BRD) | engagement | approved | Mark Zuckerberg | 2026-09-26 |
| Backlog approved (Backlog) | engagement | approved | Mark Zuckerberg | 2026-09-26 |
| Architecture approved (Solution Architecture) | engagement | approved | Yash Dixit | 2026-09-26 |
| Epic Review approved (QA) | epic-01 | approved | Yash Dixit | 2026-09-27 |

## Change requests

- cr-01: Q1 (epic-01 critique, R-6): the go-live ERP load must be able to reach a summary Jensen Huang can sign. Add a check-only run of the load to story-01-01: it reads the file and shows the same summary but writes nothing, so the ERP owner can correct the ERP and repeat until the summary reads complete, or until Jensen accepts each remaining row in writing; only then does the one live load run (T-15 unchanged). Runbook 2 (architecture §10.4) is rewritten accordingly: check-only rehearsals against the real copy well before go-live; no product added before the live load; the ERP set read-only when the frozen copy is taken. — raised by Yash Dixit, rejected
- cr-02: Q4 (epic-01 critique): before the ERP is frozen, Jensen Huang signs a full reconciliation, not only the ERP owner's 20-product comparison. Add a reconciliation report that matches every ERP row by machine against the store on part number, description and price and lists every difference; the check-only run of Q1 can produce it. T-14's mitigation and runbook 2 name the report as the thing signed, and story-01-01's definition-of-done run uses it. The 20-product comparison stays as a human cross-check. — raised by Yash Dixit, rejected
- cr-03: Q5 (epic-01 critique, R-10): BR-17's 'a price cannot move without someone accountable' covers a product's first price and its closing. Record who and when for adding a product (as a first price-history line from none to the price) and for closing a product; show the load run's operator against each loaded price; add a recorded reopen-for-quoting action for price maintainers. Architecture §5.1 gains who/when for product additions and a close/reopen history. — raised by Yash Dixit, rejected

## What you own now

The handover pack (`handover.md`) lists the artifact index with fingerprints, open defects and risks, ownership, and how to verify this record with git alone.
