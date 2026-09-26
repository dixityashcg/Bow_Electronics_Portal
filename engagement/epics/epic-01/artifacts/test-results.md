# Test Execution Results — epic-01: The catalog and pricing store replaces the Excel ERP

**Executed by**: independent QA agents · **Overseen by**: Yash Dixit
**Execution date**: 2026-09-26 · **Build under test**: commit `762f093` ("epic-01: review round 3 fixes, and the FDE's ruling on one load rule"). The repository was at `c7e3524`, and `git diff 762f093 HEAD` shows no change under `apps/`, `packages/`, `scripts/` or `seed/`.

**How the cases ran.** Each case ran against a real portal process started from `apps/server/src/main.ts`, the entry point `scripts/dev.sh` starts. Each group of cases had its own SQLite file, seeded by the project's own seed command, and talked to the portal over HTTP exactly as the browser application does. The harness is QA's own (`epics/epic-01/qa/lib.ts`, `epics/epic-01/qa/epic01.qa.ts`), run with `npx vitest run --config engagement/epics/epic-01/qa/vitest.config.ts`. It shares no code with the build's test harness. Database assertions read the file with the application's own driver, as the system holds the bytes, not as a screen shows them. The final run of TC-01 to TC-55 (without TC-49B) is `epics/epic-01/qa/final-run.log`, from 2026-09-26 21:29 to 21:31 UTC. TC-47 and TC-48 ran from the shell, and their logs are in their evidence folders.

## 1. Summary

| | Count |
|---|---|
| Cases designed | 55 |
| Cases executed | 55 |
| Passed | 54 |
| Failed | 0 |
| Blocked | 1 (TC-28, executed; its outcome waits on criterion question CQ-01) |
| Not executed | 0 |

Executed (55) + not executed (0) = designed (55). Of the 55 executed, 54 passed, 0 failed and 1 is blocked.

## 2. Results by case

| Case | Result | Defect | Evidence | Notes |
|---|---|---|---|---|
| TC-01 | Passed | — | evidence/TC-01/ | N = 2,008 counted independently. Summary: 2,008 in the ERP, 2,000 loaded + 8 not loaded. The product table holds 2,000 |
| TC-02 | Passed | — | evidence/TC-02/ | All 2,000 loaded rows compared with the database bytes. 42 were also looked up through the interface, including the first and last. No row is both unlisted and missing |
| TC-03 | Passed | — | evidence/TC-03/ | Row 37 (no part number) and row 211 (no price) are listed with reasons. BWE-R0603-100419 is not in the store |
| TC-04 | Passed | — | evidence/TC-04/ | Rows 1600 and 1601 (BWE-C0402X7R104K at 0.0045 and 0.005) are both listed "duplicate part number". The part number is absent from the store |
| TC-05 | Passed | — | evidence/TC-05/ | Re-opened summary: `complete: false`, "Load not complete: 8 of 2008 …" |
| TC-06 | Passed | — | evidence/TC-06/ | Found by part number and by store search |
| TC-07 | Passed | — | evidence/TC-07/ | One line: 10.00 → 12.00, Pat (rep), time inside the call. Database row 100000 → 120000 |
| TC-08 | Passed | — | evidence/TC-08/ | Three lines, 2.00 / 3.00 / 4.00, oldest first, times non-decreasing |
| TC-09 | Passed | — | evidence/TC-09/ | The status reads Closed through the interface the product page renders. The badge itself was not seen (no browser) |
| TC-10 | Passed | — | evidence/TC-10/ | 403. Price and history unchanged |
| TC-11 | Passed | — | evidence/TC-11/ | Add 403, close 403. Count, absence and status unchanged |
| TC-12 | Passed | — | evidence/TC-12/ | Casey got 403 "Access refused" on 8 pages. Pat got 200 on the same 8 in the same run. Riley (reseller admin) got 403 |
| TC-13 | Passed | — | evidence/TC-13/ | Each of Casey's 8 refusals is recorded with the user, "open page /sales/…" and an ISO time |
| TC-14 | Passed | — | evidence/TC-14/ | Valid session and token, still 403. Price unchanged. Recorded with the route |
| TC-15 | Passed | — | evidence/TC-15/ | Sam was refused before being named. After Morgan named Sam, the same session changed the price |
| TC-16 | Passed | — | evidence/TC-16/ | Pat was removed, and the same session was refused. Price stayed 2.50, history unchanged |
| TC-17 | Passed | — | evidence/TC-17/ | Alex was refused before being named, then set Demo Reseller A to 12 %. One history line, by Alex |
| TC-18 | Passed | — | evidence/TC-18/ | Lee was removed and then refused. C stays 10 % |
| TC-19 | Passed | — | evidence/TC-19/ | Sam was refused naming self, removing Pat and naming Alex. role_assignment unchanged |
| TC-20 | Passed | — | evidence/TC-20/ | 0 and 5-place values refused, both as number and as text cells. 0.0001 stored as 1. 900719925474.0991 stored as 9007199254740991, both as text and as number. 900719925474.0992 refused as "too large", both forms. Identity 11 |
| TC-21 | Passed | — | evidence/TC-21/, evidence/TC-21/load/ | Add: 63 and 64 characters accepted, 65 refused. Load: 63 and 64 loaded, 65 listed |
| TC-22 | Passed | — | evidence/TC-22/ | All nine bad prices and both rows without a part number are listed with reasons. Identity 14, not complete. The text `" 12.50 "` was loaded as 12.50 (surrounding spaces trimmed; see CQ-01) |
| TC-23 | Passed | — | evidence/TC-23/ | All 9 duplicate rows are listed (same price, case, spaces, triple). The unique row is loaded. Identity 10 |
| TC-24 | Passed | — | evidence/TC-24/ | Second load 409, "The store already holds … products". Count and the maintained 77.77 are unchanged |
| TC-25 | Passed | — | evidence/TC-25/ | N = 0: identity 0 = 0, reported "Load complete: all 0 product rows…" (**CQ-02**). A real load afterwards is still accepted. N = 1: loaded and complete |
| TC-26 | Passed | — | evidence/TC-26/ | No file 400. Not multipart 406. Text file 400. No Price column 400. 26 MB 413. Store empty after all five, and the real load then succeeded |
| TC-27 | Passed | — | evidence/TC-27/ | 5 concurrent loads: exactly 1 accepted, the rest 409. 2,000 products, 1 load run |
| TC-28 | Blocked | — (CQ-01) | evidence/TC-28/ | Executed. Surrounding spaces are trimmed from a part number (`"QA-R4 "` → `"QA-R4"`) and a description (`"  padded  "` → `"padded"`), and the row is not listed. Line breaks, tabs and `µ ± Ω` are kept byte for byte. Whether trimming meets story-01-01 #2's "match" is criterion question CQ-01. The workbook's own XML is kept as evidence |
| TC-29 | Passed | — | evidence/TC-29/ | Accepted: 0.0001, 900719925474.0991 (stored exactly) and " 7.50 " (trimmed). Refused with 400: 0, 0.00001, -1, 12,50, empty, 1e3 and 900719925474.0992 |
| TC-30 | Passed | — | evidence/TC-30/ | Duplicates refused in any case or spacing. Blank description refused. 500 characters accepted, 501 refused. Empty body and wrong types 400 |
| TC-31 | Passed | — | evidence/TC-31/ | Same price 409 "Nothing was changed". Invalid 400. Unknown id 404. Malformed id 400. Out-of-range id 4xx. No history line |
| TC-32 | Passed | — | evidence/TC-32/ | 10 concurrent changes: every line chains old → new, and the final price equals the last line |
| TC-33 | Passed | — | evidence/TC-33/ | Second close 409, still Closed, one earlier version kept. Unknown id 404 |
| TC-34 | Passed | — | evidence/TC-34/ | add → price → close → price. A closed product's price change was accepted (201) and it stays Closed. History consistent. Observation, no criterion either way |
| TC-35 | Passed | — | evidence/TC-35/ | Removed Pat was refused add, close, price and load, and the store was unchanged. Re-named Pat then succeeds. Role history keeps both earlier states |
| TC-36 | Passed | — | evidence/TC-36/ | Second naming 409. Second removal 409. Never-named 409. Unknown role 400. One live assignment |
| TC-37 | Passed | — | evidence/TC-37/ | Jo naming self 403. Morgan naming self 403 "Nobody can name themself". internal admin / role manager 400. Unknown id 404. Chris has no internal user id to address |
| TC-38 | Passed | — | evidence/TC-38/ | Pat was refused a discount. Lee was refused price, add, close and load. Nothing changed |
| TC-39 | Passed | — | evidence/TC-39/ | Casey got 403 on all 16 `/api/sales` routes, with no store data in any answer, 16 new refusal records and nothing changed. The entitled caller got 2xx on 15 routes, and the load got its 409 (store not empty) |
| TC-40 | Passed | — | evidence/TC-40/ | 401 on all 16 routes. `/sales/store` redirects to `/sign-in?next=…` |
| TC-41 | Passed | — | evidence/TC-41/ | Chris got 401 "not on the portal's internal users list". No session. Recorded as "staff not listed" |
| TC-42 | Passed | — | evidence/TC-42/ | No token, wrong token, Sam's token and a plain form post: all refused, price 5.00. Cookie `HttpOnly; SameSite=Strict`. The right token is accepted |
| TC-43 | Passed | — | evidence/TC-43/ | Sam, Pat, Morgan, Lee, Casey and Riley got 403. Jo got 200 |
| TC-44 | Passed | — | evidence/TC-44/ | 11 spellings: each ends in 403, either directly or after a 308 to the canonical path. No application page, no 5xx |
| TC-45 | Passed | — | evidence/TC-45/ | UPDATE and DELETE were refused on price_change, erp_load_run, erp_load_rejected_row, discount_change and refused_attempt. DELETE was refused on product, standard_discount, role_assignment, internal_user, reseller and reseller_user. product_history and role_assignment_history also refuse both. Four history tables were empty, so there was nothing to attempt against them |
| TC-46 | Passed | — | evidence/TC-46/ | After the removals, the next action of each user was refused with no grace. Values unchanged |
| TC-47 | Passed | — | evidence/TC-47/ | 7 bad configurations, each refused with exit 1 and a message. A good one starts. The production bundle refuses to start and carries no `/dev` routes |
| TC-48 | Passed | — | evidence/TC-48/ | `npm test` 110/110. Type check and production build exit 0 |
| TC-49 | Passed | — | evidence/TC-49/, evidence/TC-49B/ | 2,000 products, 50 at a time: p95 34.7 ms. At 250,000 the results ranged from 256 ms to 2,288 ms across three runs on a host with load average 20–25 from processes outside this run. **Needs-clean-retest**; N-01 not judged (see §4) |
| TC-50 | Passed | — | evidence/TC-50/ | All 9 query shapes (`" OR 1=1 --`, `NEAR(`, `*`, 2,000 chars, …) got 200 with a list |
| TC-51 | Passed | — | evidence/TC-51/ | 0, 100, 12.5 and "12 %" accepted. -1, 100.01, 12.555, empty, 1e1 and 101 refused. Value right after each. 4 history lines for 4 accepted |
| TC-52 | Passed | — | evidence/TC-52/ | `{"summary":null}`, 200, not complete |
| TC-53 | Passed | — | evidence/TC-53/ | 0.0001, 0.0040 and 900719925474.0991 read back with every place |
| TC-54 | Passed | — | evidence/TC-54/ | The early add was accepted, then the go-live load was refused 409 with a clear reason. The added product cannot be removed by any route or by the database identity, so the load can never run (**CQ-03**) |
| TC-55 | Passed | — | evidence/TC-55/ | Adds sent 110–260 ms into the load all landed before its empty-store check, and the load was refused whole (409). Store = 0 loaded + 8 added. Never half-loaded. Same consequence as TC-54 |

## 3. Acceptance criteria outcome

| Story | Criterion | Result |
|---|---|---|
| story-01-01 | #1 loaded + not loaded = N | Passed (TC-01; also held in TC-20, 22, 23, 25, 27) — on the synthetic sample and hand-built files |
| story-01-01 | #2 fields match the ERP row | Passed on the sample (TC-02, all 2,000 rows). Criterion question CQ-01 open on surrounding spaces (TC-28) |
| story-01-01 | #3 no part number / no price listed with reason | Passed (TC-03, TC-22) |
| story-01-01 | #4 duplicates at different prices both listed | Passed (TC-04, TC-23) |
| story-01-01 | #5 not reported complete when any row is not loaded | Passed (TC-05, TC-22). Criterion question CQ-02 open for N = 0 |
| story-01-02 | #1 added product found by part number | Passed (TC-06) |
| story-01-02 | #2 10.00 → 12.00 adds one line: old, new, who, when | Passed (TC-07) |
| story-01-02 | #3 three changes, three lines, oldest first | Passed (TC-08) |
| story-01-03 | #1 closed product shows Closed | Passed (TC-09) — through the interface; the rendered badge was not seen |
| story-01-04 | #1 rep not named refused a price change | Passed (TC-10) |
| story-01-04 | #2 rep not named refused add / close | Passed (TC-11) |
| story-01-04 | #3 reseller refused every store page | Passed (TC-12, TC-39, TC-44) |
| story-01-04 | #4 refused attempt record: user, page or action, date and time | Passed (TC-13) |
| story-01-04 | #5 direct price change refused | Passed (TC-14) |
| story-01-05 | #1 named user can change a price | Passed (TC-15) |
| story-01-05 | #2 no longer named: refused, price unchanged | Passed (TC-16) |
| story-01-05 | #3 named discount setter can set a standard discount | Passed (TC-17) |
| story-01-05 | #4 no longer named: refused, discount unchanged | Passed (TC-18) |
| story-01-05 | #5 rep named for neither refused changing who is named | Passed (TC-19) |

## 4. Non-functional measurements

| Target | Committed | Measured | Result |
|---|---|---|---|
| N-07 Records kept | Every append-only table refuses update and delete from the application's identity | 5 of 5 append-only tables refused UPDATE and DELETE. 6 of 6 updatable ledger tables refused DELETE (TC-45). SQLite triggers only. Azure SQL ledger was not tested | Met (Stage 1) |
| N-09 Role removal takes effect | The next store or discount action after removal is refused | Refused on the very next call, same session, for both roles (TC-46, TC-16, TC-18) | Met |
| N-01 Product search response | 95 % ≤ 1.0 s at 250,000 products and 50 concurrent searches, on the production database tier | 2,000 products: p95 34.7 ms. 250,000 products (local SQLite, loopback, busy host): p95 256 ms, 1,892 ms and 2,288 ms in three runs. One search at a time: 0–37 ms (TC-49, TC-49B/runs.md) | **Not determined.** The committed environment does not exist, and the local runs disagree by 9× with host load. Needs a clean retest; the committed test is Stage 2's k6 run |
| T-23 start-up guard (architecture §8.2, not an N-target) | Refuses stand-ins off localhost or in production mode | 7 bad configurations refused (TC-47) | Met |
| (informative) ERP load time | none committed | 2,008 rows: under 1 s. 250,000 rows: 14.1 s to 48.9 s (busy host) | No target |

## 5. Re-test history

No defect was raised, so nothing was re-tested. The final run (21:29–21:31 UTC) repeated every case from TC-01 to TC-55 except TC-47, TC-48 and TC-49B at the same build after the harness corrections below, and gave the same outcomes as the first run.

**Harness corrections made during execution, and recorded here so the first run's figures are not misread**:
- TC-28 first compared the database with what the script asked exceljs to write. exceljs itself writes a typed CRLF as LF, so the CRLF "failure" was the harness. The case now compares with the workbook as read back. The whitespace trimming remained.
- TC-55's first two runs sent adds from 5 ms and then from 110 ms. Both times the adds landed before the load's empty-store check. Recorded as observed.

## 6. Environment and limitations

- **Host**: the FDE's Mac (10 cores, macOS, Node.js 24.21.0), local stand-ins only, SQLite. Other processes outside this run kept the load average at 20–25 during the 250,000-product runs. That affects the timing figures and nothing else.
- **No browser.** The Playwright browser the loadout pins was not connected to this QA session. Screens were not clicked, and screenshots and console logs were not captured. Each case's evidence is its HTTP exchanges (`http-log.json`, cookies redacted) and its checks (`checks.md`). Pages were requested as a browser requests them, and the status each returns is recorded, but the rendered words ("Closed", "Load not complete", the history table) were not seen.
- **Data**: the synthetic `seed/sample-erp.xlsx` (2,008 rows, 8 deliberately bad) and hand-built workbooks. No real ERP file exists yet. The column mapping is provisional.
- **The production web build** replaced `apps/web/dist` during TC-48. `scripts/dev.sh` rebuilds the local bundle on every start, so the demo is unaffected.
