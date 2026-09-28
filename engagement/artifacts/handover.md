# Handover — Bow Electronics Reseller Portal

**Handed over by**: Yash Dixit · **To**: Jensen Huang · **Date**: 2026-09-27

## In one paragraph

One of the six Epics in the approved backlog was delivered: **epic-01, the catalog and pricing store that replaces the Excel ERP**. The other five were excluded from this engagement and moved to a follow-on engagement: requesting a quote, the reps' open requests list, building and sending quotes, the reseller's response, and reseller admins managing users. As a result, **no reseller can use the portal yet.** What Bow receives is the internal catalog and pricing store, and it runs only on a local machine with stand-ins for sign-in, email and the database (Stage 1). The Azure services that production needs (Stage 2) were designed but not built. Nothing has been deployed. The one-off load of the real ERP has not been run, because no ERP owner has been named. Each of these points is set out below with what it means for Bow.

## What was delivered

| Epic | What it does | Epic Review approved |
|---|---|---|
| epic-01 | **The catalog and pricing store replaces the Excel ERP.** Bow's staff load the Excel ERP into the store once and check a load summary that lists every row not loaded, with the reason. They search, add and close products, and change prices with a history of who changed what and when. Only **named users** may change prices (price maintainers) or set a reseller's **standard discount** (discount setters). Every refused attempt is recorded. A **role manager** decides who is named. Resellers are refused every store page. | **Approved by Yash Dixit (FDE), 2026-09-27** (recorded 00:00:59 UTC). Relayed by the agent. The evidence is **operator-asserted**: no client stakeholder's statement is attached to this decision in the record. |

**What epic-01's approval rests on, and what it does not.**
- **Rests on:** QA at build `762f093`. All 19 acceptance criteria passed, as did 36 further cases on boundaries, concurrency, cross-story sequences and security. No defect was found (`qa-report.md`, `defect-log.md`).
- **Not seen in a browser:** QA drove every behaviour through the interface the screens call. The rendered screens were first meant to be clicked at the Epic Review. The record does not say whether that demonstration took place, or who attended it.
- **story-01-01 is not done by its own definition.** Its definition of done requires a run against a copy of the real ERP spreadsheet, and no ERP owner has supplied one (architecture C-10, Q-11). The Epic was approved with that run still outstanding. It is still outstanding at handover.
- **Built for Stage 1 only.** Every outside service sits behind a local stand-in: sign-in, email, the database (SQLite in place of Azure SQL), the clock and telemetry. The real Azure and Microsoft 365 implementations are not built.

## What was not delivered, and why

Every excluded Epic was excluded on the same basis, in the same meeting.

- **Asked for by:** Jensen Huang (PO).
- **Decided by:** Yash Dixit (FDE).
- **Recorded reason:** "Descoped for this engagement: epic-01 proves the flow; the rest move to a follow-on".
- **Client's words:** "Stop after epic-01; the rest go to a follow-on engagement". Source: meeting, "Scope review with Jensen Huang, 27 Sep". The reference was entered by the operator and is not a retrievable document.

No Build or QA work was started on any of the five.

| Epic | Disposition | Basis | Decided by | Date |
|---|---|---|---|---|
| epic-02 — A reseller user requests a quote and gets a request ID | Excluded; moved to a follow-on engagement | Client asked to stop after epic-01 (see above). **Without it:** resellers cannot sign in, search the catalog or send a quote request, and no confirmation email or request ID exists. Resellers keep phoning and emailing reps as they do today. The reseller sign-in, invitation and email stand-ins it needs were not built. | Yash Dixit (FDE), at Jensen Huang's (PO) request | 2026-09-27 |
| epic-03 — Reps see every open request in one list, including the ones that came by phone | Excluded; moved to a follow-on engagement | As above. **Without it:** there is no open requests list, no taking or handing over of requests and no rep-entered requests. The Excel request logs stay the reps' working list. | Yash Dixit (FDE), at Jensen Huang's (PO) request | 2026-09-27 |
| epic-04 — Reps build and send a quote priced from the store, with the reseller's discount filled in | Excluded; moved to a follow-on engagement | As above. **Without it:** no quote is built or sent in the portal. The store's prices and standard discounts exist, but nothing reads them into a quote. Reps quote as they do today. **The store therefore does not yet become "the only source of quote prices" (C-01).** | Yash Dixit (FDE), at Jensen Huang's (PO) request | 2026-09-27 |
| epic-05 — The reseller answers the quote, and both sides see the same status | Excluded; moved to a follow-on engagement | As above. **Without it:** there is no approve, request-a-change or decline in the portal, no shared status and no quote expiry. | Yash Dixit (FDE), at Jensen Huang's (PO) request | 2026-09-27 |
| epic-06 — Reseller admins manage their own company's users | Excluded; moved to a follow-on engagement | As above. **Without it:** reseller admins cannot add or deactivate their colleagues. This matters only once epic-02 exists. | Yash Dixit (FDE), at Jensen Huang's (PO) request | 2026-09-27 |

**For whoever picks up the follow-on.** The approved backlog (`backlog.md`) and architecture (`architecture.md`) still describe all six Epics, and neither was changed by the exclusions. The architecture sets the order: epic-02, then 03, 04 and 05 in sequence, with epic-06 needing only epic-02 (architecture §9.3). Stage 2, the real Azure and Microsoft services, is needed before any go-live, whichever Epics are built.

## Change requests

Three change requests were raised during the engagement, all by Yash Dixit (FDE) on 2026-09-26, from the critique of epic-01. **All three were rejected** by Yash Dixit (FDE) on 2026-09-27. Each rejection was relayed by the agent and is operator-asserted, with no client statement attached. **No reason for any rejection is recorded.**

| Ref | Requested | Raised by | Outcome | Assessed impact |
|---|---|---|---|---|
| cr-01 | Add a **check-only run** of the go-live ERP load. It would read the file and show the same summary but write nothing, so the ERP owner could correct the ERP and repeat until the summary reads complete, or until Jensen Huang accepts each remaining row in writing. Only then would the one live load run. Runbook 2 would be rewritten to match: check-only rehearsals, no product added before the live load, and the ERP set read-only when the frozen copy is taken. | Yash Dixit (FDE), 2026-09-26 | **Rejected** by Yash Dixit (FDE), 2026-09-27 | Operator's assessment, not a measurement: scope, cost and schedule "not assessed" |
| cr-02 | Before the ERP is frozen, Jensen Huang signs a **full machine reconciliation** of every ERP row against the store (part number, description, price, every difference listed), not only the ERP owner's 20-product comparison. | Yash Dixit (FDE), 2026-09-26 | **Rejected** by Yash Dixit (FDE), 2026-09-27 | Operator's assessment, not a measurement: scope, cost and schedule "not assessed" |
| cr-03 | Record **who and when for adding a product** (as a first price-history line) and for **closing** one. Show the load operator against each loaded price. Add a recorded **reopen-for-quoting** action. | Yash Dixit (FDE), 2026-09-26 | **Rejected** by Yash Dixit (FDE), 2026-09-27 | Operator's assessment, not a measurement: scope, cost and schedule "not assessed" |

What each rejection leaves in place is under *Risks you now own*.

## Deployment

Deployment not recorded.

## Artifact index

These are the fingerprints recorded when each document was approved at a gate. A copy of a document whose SHA-256 differs from this table is not the version that was approved.

| Artifact | Fingerprint (SHA-256) |
|---|---|
| `engagement/artifacts/brd.md` (approved at g1-brd, 2026-09-26) | `47f05f19e1370ae9d7b98ff43be923973a72eb77a995d601dae115f75de2608d` |
| `engagement/artifacts/backlog.md` (approved at g2-backlog, 2026-09-26) | `a7cab25460215e3138b2882a76df92b4cf46b8228d37e2a9784cfcbabcf78265` |
| `engagement/artifacts/architecture.md` (revision 2, approved at g3-architecture, 2026-09-26) | `dc7c8f643bf0f2301e3103ec117007565f8f7b3f81b40875fd6f5b94e14e119d` |
| `engagement/artifacts/decisions.md` (approved at g3-architecture, 2026-09-26) | `a1ea58c95e01b41223c1d76b145d9d71538cc07107270411bbf9bb51f8c3bd25` |
| `engagement/artifacts/demo-topology.md` (approved at g3-architecture, 2026-09-26) | `c13ac378d472144822aebcaa52f6bc4c3e45a566bdc0669284531edb8a4b33f5` |
| `engagement/epics/epic-01/artifacts/test-cases.md` (approved at g4-epic-review, 2026-09-27) | `12707804afa5690d3f3a1157f9d0a13ee0a675940ffdc2e4ff04af27401f461f` |
| `engagement/epics/epic-01/artifacts/test-results.md` (approved at g4-epic-review, 2026-09-27) | `9ae8e220482c052186d91d86f47e39a63aabef09aedc308a13cf5b673158f2b3` |
| `engagement/epics/epic-01/artifacts/defect-log.md` (approved at g4-epic-review, 2026-09-27) | `160f82857cae34826d2ccbc13de50b410daa850edc331ae18fdcd8d7cb4d4bb0` |
| `engagement/epics/epic-01/artifacts/qa-report.md` (approved at g4-epic-review, 2026-09-27) | `1c7ad512ecdaf81ad8405b0c1931e866ddfcb7e611237b64a0e04a154f7a6e69` |

**No fingerprint is recorded** for the following, because none of them was approved at a gate:
- `glossary.md`, `domain-dossier.md` and `assessment.md`;
- epic-01's `demo-record.md`, `criterion-questions.md`, `dod.md`, `ac-verification.md` and `test-design.md`.

This handover, the engagement report and the end-to-end demo brief are fingerprinted when acceptance (g5-acceptance) is decided.

## Open defects

**No defects are open.** QA found none at build `762f093`, and no defect was raised afterwards (`defect-log.md`).

The following are **not defects**, but they are open and they affect Bow:

| Open item | Affects | Status | Workaround |
|---|---|---|---|
| **CQ-01**: the ERP load trims spaces before and after part numbers and descriptions. Does a trimmed value "match the ERP row" (story-01-01 #2)? | The go-live load. A padded part number in the ERP is stored without its spaces, and `" X "` and `"X"` count as duplicates. | **Unanswered on the record.** QA recommends: treat it as a match, and write the rule into the column mapping the ERP owner signs. | Write the trimming rule into the ERP owner's sign-off. |
| **CQ-02**: a spreadsheet with a heading row and no product rows is reported "Load complete: all 0 product rows… were loaded". | The load summary Jensen Huang signs to freeze the ERP. An empty or wrong worksheet produces a summary that looks complete. | **Unanswered on the record.** QA recommends refusing a zero-row workbook, which needs a change request. | Before signing, check that the summary's product row count is the ERP's real row count. |
| **CQ-03**: one product added before the go-live load blocks that load **permanently**, and nothing in the portal or the database can remove it. | Go-live itself. A single trial "Add a product" before the load stops the ERP being loaded at all. | **Unanswered on the record.** QA recommends refusing *Add a product* until a load has run (a change request), plus a runbook step. cr-01, which carried that runbook step, was rejected. | Nobody adds a product before the go-live load. Load first, then name any other price maintainer. |
| **story-01-01's run against the real ERP** | Whether the load works on Bow's actual spreadsheet: number formats, extra worksheets, headings, whitespace. Everything so far was proven on a fictional 2,008-row sample. | Not run. No ERP owner is named (C-10). | None. Name the ERP owner and run it before go-live. |
| **N-01 product search speed** (p95 ≤ 1.0 s at 250,000 products, 50 at once) | Search once the full catalog is loaded. | **Not determined.** Three local runs gave 256 ms, 1,892 ms and 2,288 ms on a heavily loaded machine. The committed test is a Stage 2 load test, and the search screen itself belongs to epic-02. | Re-test on an idle machine, and in Azure at Stage 2. |
| A closed product's price can still be changed (it stays Closed) | Price history of closed products | Observed by QA; no criterion covers it. | None needed unless Bow objects. |
| The production browser bundle links to `/dev/sign-in` from its sign-in page | Appearance only: the page itself is absent from the production server, and a production build refuses to start in Stage 1 | Observed by QA; real sign-in is Stage 2 work. | None. |

## Risks you now own

| Risk | What would trigger it | Current mitigation |
|---|---|---|
| **The go-live load is blocked for good** (CQ-03; cr-01 rejected) | Anyone presses *Add a product* on the production store before the ERP load has run, including a trial on go-live morning. | None in the software. Order of work only: load first. Recovery would need someone with database rights to intervene outside the portal. |
| **A wrong or incomplete ERP is signed as complete** (CQ-02; cr-02 rejected) | The load is run on an empty or wrong worksheet, or the 20-product comparison misses a systematic error. | The load lists every row it did not load, with the reason, and says "not complete" if any row was left out. The ERP owner compares 20 random products (T-14). There is no full reconciliation. |
| **Additions and closures carry no "who and when"** (cr-03 rejected) | A product appears or is closed for quoting and someone asks who did it. | Price *changes* carry who and when (story-01-02). Adding and closing a product do not. There is no reopen action. |
| **No ERP owner** (C-10) | Go-live is scheduled while nobody owns, freezes or signs the ERP file. | None. The architecture makes naming the owner a prerequisite. The owner is to be named by Elon Musk (Q-11). |
| **Stage 2 is not built** | Anyone plans a go-live on the Stage 1 code as it stands. | The start-up guard refuses to run the local stand-ins on a non-local address or in production mode (T-23; tested 7 of 7). The following are **untested**: Entra ID and External ID sign-in and lockout (T-20), the Azure SQL ledger's protection against administrators (T-16), SQL Server concurrency and search, CI, and branch protection (T-22). |
| **The support runbooks do not exist** | The first restore, the go-live load, credential rotation or loss of the region. | Architecture §10.4 names seven runbooks for the support partner: restore, go-live load, seeding, credential rotation, restore drill, go-live re-entry and region loss. **None has been written as a document.** They exist only as outlines in the architecture. |
| **No support partner** (C-05, Q-07) | Go-live without a signed contract. | The architecture provides interim support from the delivery team, but only for a period Jensen Huang and the FDE agree in writing. No such agreement is recorded. |
| **R-01**: someone with Azure owner rights can drop the database or restore over it | More than two people hold Azure owner rights, or an audit asks for it | Ledger tables stop edits, not destruction. Owner rights limited to two named people (§10.1). |
| **R-02**: an email that is accepted and later bounces is not listed | Resellers report missing emails that the failed emails list did not show | None (applies once epic-02 exists) |
| **R-03**: a rep can add a caller to a reseller, and the reseller's admins are told afterwards, not asked | Any report of an outsider added this way | Reseller admins are emailed (detects, does not prevent). Applies once epic-02/03 exist. |
| **R-04**: reseller users' names and emails are kept at least five years, whatever data protection law applies | NF-07 answered, or a reseller user asks to be erased | None. Which law applies is still unknown (C-09). The Azure region also waits on it. |
| **R-05**: whether a request ID exists might be inferred from response timing | Request IDs become guessable | Random IDs (ADR-06) |
| **R-06**: no web application firewall | The portal is attacked, or traffic exceeds 10 times the sizing assumptions | Azure's platform protection only |

**On R-01 to R-06.** The architecture records all six as **provisionally accepted by Yash Dixit (FDE) on 2026-09-26**, for Elon Musk (EA) to ratify or refuse at the architecture gate. Elon Musk approved the architecture at that gate ("Approved revision 2, local-first Stage 1", meeting, 2026-09-26). The record does not show him ratifying or refusing each risk individually. Treat them as accepted with the architecture, not as individually ratified.

## What you operate from here

**What Bow owns.**
- **The source code.** It is currently in the git repository `https://github.com/dixityashcg/Bow_Electronics_Portal`, under the delivery team's account. **Transferring the repository to an account Bow controls is an open action.** The record does not show that it has happened, and Bow should confirm it before relying on the repository. The code is TypeScript: a React 19 browser application and a NestJS 11 server on Node.js 24 LTS, with the server and browser application in `apps/server` and `apps/web`, shared code in `packages/`, scripts in `scripts/` and the fictional seed in `seed/`.
- **The engagement record** under `engagement/`: every decision, the approved documents, and epic-01's QA evidence.
- **The approved design** for all six Epics and for Stage 2 (`architecture.md`, `decisions.md`).

**What runs today.** Only Stage 1, on one machine.

| To do this | You need |
|---|---|
| Start the portal | A Mac or developer machine with **Node.js 24 LTS**. Run `./scripts/dev.sh`, then open `http://localhost:3000`. There is no Docker, Azure or Microsoft 365 dependency. |
| Return it to the known starting state | `./scripts/reset.sh`. It deletes `.local/portal.db` and re-seeds. It touches nothing outside `.local/`. |
| Sign in | The development sign-in page (`/dev/sign-in`) lets you pick a fictional user, such as Pat (price maintainer), Morgan (role manager) or Casey (reseller). This is a stand-in. It does not exist in a production build. |
| Run the tests | `npm test` (110 tests passed at build `762f093`) |
| Walk through what epic-01 does | `engagement/epics/epic-01/artifacts/demo-record.md`: ten steps against the fictional sample ERP `seed/sample-erp.xlsx` |

**What running it in production would need.** None of this is in place, and all of it is outside this engagement's delivery:
- Stage 2 built and tested: Azure resources, Entra ID and External ID sign-in, Azure SQL, Communication Services email, Application Insights, and the CI/CD pipeline (architecture §4.4–§4.6).
- An Azure subscription and a named Microsoft 365 administrator for the one-off setup (Q-06).
- A support partner contract with Azure and TypeScript/Node skills, or a written interim-support agreement (§10.1).
- The seven runbooks in §10.4, written.
- A named ERP owner, the run against the real ERP (story-01-01), and a signed load.
- The code repository transferred to an account Bow controls.
- Two named role managers, Jensen Huang and a deputy he names, set in configuration at first deployment (runbook 3).
- Answers to CQ-01 to CQ-03.
- For resellers to use it at all: epics 02 to 06.

**Anything with an expiry date.** None exists yet. The only long-lived secret in the design, the External ID application credential, is created in Stage 2.

## Verifying this record without RAISE

The full procedure ships in the repository as `engagement/keys/VERIFYING.md`. The steps below are taken from it. You need only `git`, with no RAISE installation and no network.

**Check that the history is intact:**

    git fsck
    git log --oneline -- engagement/ledger

Every event file should appear in exactly **one** commit. An event touched by two commits was changed after it was written.

    git log --format='%h %cI' --name-only -- engagement/ledger

**Check that an artifact is the one that was approved.** Each gate decision records the SHA-256 of what it approved:

    grep -A4 sha256 engagement/ledger/*gate_decision*
    shasum -a 256 engagement/artifacts/<file>

**Check how each decision arrived.** A decision relayed by an AI agent carries `relayed: true`:

    grep -l "relayed: true" engagement/ledger/*gate_decision* || echo "none relayed"

A relayed approval proves what was recorded. It does not prove what the agent showed the operator before relaying, or that the operator's answer happened as described. In this engagement, the BRD approval and epic-01's Epic Review approval were relayed, and so were the three change request rejections.

**Check who made each decision.** `VERIFYING.md` gives the signature check against `engagement/keys/allowed-signers`. **This engagement registered no signing keys, and no `allowed-signers` file exists.** The record therefore proves that its history was not rewritten, but not who recorded any decision. Timestamps are self-reported by the machine that recorded them.

## Acceptance

<!-- Left for the record. Acceptance is decided at the g5-acceptance gate and
     recorded in the ledger, not signed in this document. Editing this file
     after acceptance reopens that gate. -->
