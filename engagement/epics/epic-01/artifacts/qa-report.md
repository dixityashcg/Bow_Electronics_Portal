# QA Report — epic-01: The catalog and pricing store replaces the Excel ERP

**Tested by**: independent QA agents · **Overseen by**: Yash Dixit
**Build under test**: commit `762f093` (no source change up to repository HEAD `c7e3524`) · **Tested**: 2026-09-26

**In one paragraph.** All 19 acceptance criteria passed against the running portal. So did 36 further cases, written before execution to cover boundaries, repeats, concurrency, cross-story sequences, authorization and the threat model. No defect was found. Three **criterion questions** are open for the operator; none is a defect.
- **CQ-01**: the load trims spaces around a part number or description. Does that count as "matching the ERP"?
- **CQ-02**: an empty spreadsheet is reported "Load complete".
- **CQ-03**: one product added before the go-live load blocks that load for good, and nothing in the portal can undo it.

The main limits of this run: nothing was clicked in a browser, and there is still no real ERP file.

## Independence achieved

**Tier**: 3, a separate session with fresh context. · **Agents**: one QA sub-agent, launched by the operator's session to run `/raise-v3-qa epic-01`. It is not the `raise-qa` agent definition this installation carries. · **Model**: Claude Opus 5.5 (`claude-opus-5-5`).

**What separated this context from the build**:
- This context did not perform the build. It started with none of the build's conversation.
- It did not read the build's review record, critique, adversarial review, hand-off brief or DoD reasoning (`internal/`, `assessments/`, `dod.md`).
- It read what the phase directs: the approved criteria, the architecture's targets and threats, the demo record, and the AC-verification matrix.
- To call the interface directly, it also read the route declarations (`catalog.controller.ts`, `access.controller.ts`, `rules.ts`), the input schemas and price/percent parsers (`packages/shared`), the start-up configuration (`config.ts`, `main.ts`) and the seed's list of people. That is interface knowledge, not the builders' argument for correctness, but it is more than a pure black-box tester would hold, and it is stated here for that reason.

**What did not separate it**: the host would allow a distinct model for QA (tier 1). This run used Opus 5.5, and which model built the Epic is not recorded where this context could see it. The same model may have built and tested this Epic. A distinct agent definition (tier 2) was also not used. So this is a fresh context, and nothing more.

## Acceptance criteria

| Story | Criterion | Result | Notes |
|---|---|---|---|
| story-01-01 | #1 loaded + not loaded = N | Passed | 2,000 + 8 = 2,008, with N counted independently of the portal. Held on every hand-built file too, at N = 0, 1, 3, 10, 11, 14 and 250,000 (TC-01, 20–27) |
| story-01-01 | #2 fields match the ERP row | Passed | Every one of the 2,000 loaded rows compared at the database bytes, not a sample (TC-02). **CQ-01** open: surrounding spaces are trimmed (TC-28) |
| story-01-01 | #3 no part number / no price listed with reason | Passed | TC-03, TC-22 |
| story-01-01 | #4 duplicates at different prices both listed | Passed | TC-04. Same price, case, spacing and triples also listed (TC-23) |
| story-01-01 | #5 not complete when any row not loaded | Passed | TC-05, TC-22. **CQ-02** open: at N = 0 it reports complete |
| story-01-02 | #1 added product found by part number | Passed | TC-06 |
| story-01-02 | #2 10.00 → 12.00: one line, old/new/who/when | Passed | TC-07 |
| story-01-02 | #3 three changes, three lines, oldest first | Passed | TC-08 |
| story-01-03 | #1 closed product shows Closed | Passed | TC-09. The status was read from the interface; the rendered badge was not seen |
| story-01-04 | #1 rep not named: price change refused | Passed | TC-10 |
| story-01-04 | #2 rep not named: add / close refused | Passed | TC-11 |
| story-01-04 | #3 reseller refused every store page | Passed | TC-12 (8 pages, each paired with a 200 for Pat), TC-44 (11 other spellings) |
| story-01-04 | #4 refused attempt record | Passed | TC-13 |
| story-01-04 | #5 direct price change refused | Passed | TC-14 |
| story-01-05 | #1 named user can change a price | Passed | TC-15, from a session opened before the naming |
| story-01-05 | #2 no longer named: refused | Passed | TC-16 |
| story-01-05 | #3 named discount setter can set a discount | Passed | TC-17 |
| story-01-05 | #4 no longer named: refused | Passed | TC-18 |
| story-01-05 | #5 named for neither: cannot change who is named | Passed | TC-19 |

No criterion was reworded, and none was resolved quietly. Where a criterion is silent or can be read two ways, the question is in `criterion-questions.md` with the criterion unchanged.

## System-level testing

55 cases against 19 criteria. The 36 cases beyond the criteria each name the technique that produced them (`test-cases.md` §3).

- **Boundaries, each tested on the value itself** (TC-20, 21, 25, 29, 30, 51, 53):
  - Price: 0 refused. 0.0001 accepted and stored as 1. Five places refused.
  - Largest exact price: 900719925474.0991 stored exactly, from a number cell and from a text cell. One ten-thousandth more is refused as "too large", so there is no silent rounding.
  - Part number: 64 characters accepted, 65 refused, on add and in the load.
  - Description: 500 characters accepted, 501 refused.
  - Standard discount: 0 and 100 accepted, 100.01 and 12.555 refused.
  - ERP of 0 rows and of 1 row: see CQ-02.
- **Repeats and state transitions**:
  - Load twice: the second is refused, and a maintained price survives (TC-24).
  - Close twice: 409 (TC-33).
  - Same price: 409, no history line (TC-31).
  - Name twice and remove twice: 409, one live assignment (TC-36).
  - Grant → revoke → grant (TC-35).
- **Concurrency**, following the practice lesson that sequential tests hide check-then-act races:
  - 5 simultaneous loads: exactly 1 accepted (TC-27).
  - 10 simultaneous price changes: the history chains without a gap (TC-32).
  - Adds racing the load (TC-55): the store is never half-loaded.
- **Cross-story sequences**:
  - add → change price → close → change price (TC-34).
  - Role removed, then add, close, price and load all refused (TC-35).
  - **An add before the go-live load** (TC-54): the load is then refused for good, and no route or database identity can remove the product (CQ-03).
- **Raw bytes**, following the practice lesson "assert on the record as the system holds it": TC-02 and TC-28 compare the database file, not a rendered page. That is how the whitespace trimming behind CQ-01 was seen. A JSON or HTML reading would have hidden it.
- **Observed, with no criterion either way**: a closed product's price can still be changed, and it stays Closed (TC-34).

## Regression

This is the first Epic, so there is no earlier behaviour to break. At the build under test:
- the build's own suite passes, 110 of 110 (`npm test`);
- the type check passes;
- the production build succeeds (TC-48);
- the final QA run repeated every case at the same commit, with the same outcomes as the first run.

## Security

**Authorization.** Every refusal is paired with a success on the same route in the same run, following the practice lesson "a negative authorization assertion passes for free against a route that does not exist".
- **Reseller user**:
  - Casey (Reseller A buyer) is refused all 16 `/api/sales` routes, reads included. Every answer carries no store data, and every refusal is recorded (TC-39, T-06).
  - Casey is refused 8 store pages (TC-12) and 11 other spellings of them (case, `//`, `%2e%2e`, `%2F`, `%00`, `;`), each ending in 403 (TC-44).
  - Riley (Reseller A admin) is refused too.
- **No session**: 401 everywhere (TC-40).
- **A Bow account not on the internal users list** (Chris): refused and recorded (TC-41, T-05).
- **Reps and the named lists**:
  - The two named lists are separate: a price maintainer cannot set a discount, and a discount setter cannot touch the store (TC-38).
  - Nobody can name themself, and an internal admin cannot name anyone (TC-37, T-08).
  - Removal takes effect on the next call (TC-46, N-09).
- **Refused attempts list**: only the internal admin can read it (TC-43).

**Input handling and forgery.**
- The anti-forgery token is enforced: missing, wrong, another user's, and a plain cross-site form post are all refused (TC-42, T-21). The cookie is `HttpOnly; SameSite=Strict`.
- Search syntax is treated as plain words (TC-50, T-13).
- Malformed, oversized and wrong-type loads are refused with a 4xx and leave the store empty (TC-26, T-14).
- The start-up guard refuses 7 bad configurations, including a `localhost.` look-alike host and `0.0.0.0` (TC-47, T-23). The production server bundle carries no `/dev` routes.

**Records.** Append-only tables refuse update and delete, and ledger tables refuse delete, all at the database (TC-45, N-07). This is on SQLite triggers. Azure SQL ledger is Stage 2.

## Non-functional targets

| Target | Committed | Measured | Result |
|---|---|---|---|
| N-07 Records kept | Update and delete refused on every append-only table | 5/5 append-only tables refuse both. 6/6 updatable ledger tables refuse delete (SQLite) | Met in Stage 1 |
| N-09 Role removal takes effect | Next action refused | Refused on the next call, same session | Met |
| N-01 Product search | p95 ≤ 1.0 s at 250,000 products, 50 concurrent, production database tier | 2,000 products: p95 34.7 ms. 250,000 local: p95 256 / 1,892 / 2,288 ms across three runs on a host at load average 20–25 from unrelated processes. One search at a time: 0–37 ms | **Not determined**: Needs-clean-retest. The committed test is Stage 2's k6 run, and N-01's own search belongs to epic-02 (story-02-02) |
| T-23 start-up guard | Refuse stand-ins off localhost / in production | 7/7 refused | Met |

The N-01 figure is reported rather than judged. The same build gave a p95 of 256 ms in one run and 2,288 ms in the next, on a Mac whose other workloads held the load average at 20–25. The spread says the host is the variable. A clean retest on an idle machine is worth doing before epic-02's review, because 50 concurrent searches on one synchronous SQLite connection queue behind each other. A single search costs under 40 ms.

## Defects

| # | Severity | Description | Status |
|---|---|---|---|
| — | — | No defect was found at build `762f093` | — |

Three criterion questions went to the operator instead of the build team. Each carries QA's recommended answer (`criterion-questions.md`):

| # | Question | QA recommends |
|---|---|---|
| CQ-01 | The load trims spaces around part numbers and descriptions. Does that "match the ERP row"? | Yes. Record the rule in the column mapping the ERP owner signs |
| CQ-02 | A zero-row spreadsheet is reported "Load complete" | Refuse a zero-row workbook as the wrong file (change request, beside cr-01) |
| CQ-03 | One product added before the go-live load blocks that load permanently | Refuse *Add a product* until a load has run (change request). Also name the order in the go-live runbook |

## Not tested, and why

- **The screens in a browser.** The pinned Playwright browser was not connected to this session. Every behaviour was driven through the HTTP routes the screens call, and pages were requested as a browser requests them. Nobody has yet seen the rendered words: "Closed", "Load not complete", the history table, the refusal message on the product page. The same is true of client-side validation. There are no screenshots, console logs or browser network captures. The operator's Epic Review run is the first time these screens will be clicked. This was also the build's own stated gap.
- **Cross-browser (N-14).** No browser was available.
- **The real ERP spreadsheet.** It has not been supplied (no ERP owner, C-10). Whitespace (CQ-01), number formats, extra worksheets and headings are proven only on synthetic files.
- **N-01 at its committed scale and environment.** Local runs are indicative and disturbed by host load (see above).
- **Stage 2**: Entra ID / External ID sign-in and lockout (T-20), Azure SQL ledger immunity against administrators (T-16), SQL Server concurrency and full-text ranking, the CI route-rule check and branch protection (T-22). None of it is built.
- **Session expiry (N-11)**, idle 61 minutes. It is not in this Epic's criteria, and there was no time budget for it.
- **Cross-site forgery from a real second origin.** It was tested as the server refusing a missing or wrong token and a plain form post, plus the cookie's `SameSite=Strict`. No page on another origin was driven in a browser.
- **Two role managers acting on each other.** Only one role manager is seeded, so "a role manager cannot grant themself" was tested, but "a second role manager removes the first" was not.
- **Four `*_history` tables were empty** at TC-45 (standard_discount, internal_user, reseller, reseller_user), so their own update and delete refusal could not be exercised.
