# Test Cases — epic-01: The catalog and pricing store replaces the Excel ERP

**Designed by**: independent QA agents · **Overseen by**: Yash Dixit

Written on 2026-09-26, before any case was executed. The cases are designed from the approved backlog's criteria (rendered by `raise epic criteria epic-01` into `test-design.md`), the architecture's non-functional targets (§7.2) and threat model (§8.2), and the Epic Review's demo record. The build's reasoning about why the code is correct was not read.

## 1. Scope of this test design

**In scope**: story-01-01 to story-01-05, all 19 acceptance criteria, exercised against the running portal (the real server process, the real SQLite file, the real ERP load) through the same HTTP interface the browser application uses. The threats in architecture §8.2 that touch this Epic: T-05, T-06, T-07, T-08, T-13, T-14, T-15, T-21, T-23. The non-functional targets that touch this Epic: N-07 (records kept), N-09 (role removal takes effect), and N-01 (product search response) as far as it can be measured locally.

**Starting states used by the cases** (each case says which):

- **Fresh** — a new database seeded by the project's own seed command (`apps/server/src/cli/seed.ts`): the fictional staff and resellers, signed discounts for Resellers C–E, an empty store. A new portal process is started on it.
- **Loaded** — Fresh, then `seed/sample-erp.xlsx` loaded through `POST /api/sales/store/load` as Pat (rep, price maintainer).

**Deliberately excluded**: epic-02 to epic-06 behaviour (reseller search, quotes, discounts beyond the set action story-01-05 needs); the Stage 2 adapters (Entra ID, External ID, Azure SQL, Communication Services), which are not built. See §5.

## 2. Coverage of acceptance criteria

| Story | Criterion | Covered by |
|---|---|---|
| story-01-01 | #1 loaded + not loaded = N | TC-01, TC-20, TC-22, TC-23, TC-25, TC-27 |
| story-01-01 | #2 fields match the ERP row | TC-02, TC-20, TC-21, TC-28 |
| story-01-01 | #3 no part number / no price listed with reason | TC-03, TC-22 |
| story-01-01 | #4 duplicate part numbers both listed | TC-04, TC-23 |
| story-01-01 | #5 not reported complete when any row not loaded | TC-05, TC-22, TC-25 |
| story-01-02 | #1 added product found by part number | TC-06, TC-29, TC-30, TC-34, TC-54, TC-55 |
| story-01-02 | #2 10.00 → 12.00 adds one history line (old, new, who, when) | TC-07, TC-31, TC-32 |
| story-01-02 | #3 three changes, three lines, oldest first | TC-08, TC-32 |
| story-01-03 | #1 closed product shows Closed | TC-09, TC-33, TC-34 |
| story-01-04 | #1 rep not named refused a price change, price unchanged | TC-10, TC-38 |
| story-01-04 | #2 rep not named refused add / close, store unchanged | TC-11, TC-38 |
| story-01-04 | #3 reseller refused every store page | TC-12, TC-39, TC-44 |
| story-01-04 | #4 refused attempt record holds user, page or action, date and time | TC-13, TC-39, TC-41 |
| story-01-04 | #5 direct price change by a rep not named refused | TC-14, TC-42 |
| story-01-05 | #1 named user can change a price | TC-15, TC-35 |
| story-01-05 | #2 no longer named, refused, price unchanged | TC-16, TC-35, TC-46 |
| story-01-05 | #3 named discount setter can set a standard discount | TC-17, TC-51 |
| story-01-05 | #4 no longer named, refused, discount unchanged | TC-18, TC-46 |
| story-01-05 | #5 rep named for neither refused changing who is named | TC-19, TC-36, TC-37 |

## 3. Test cases

| ID | Technique | Traces to | Preconditions | Steps | Expected result |
|---|---|---|---|---|---|
| TC-01 | acceptance criterion | story-01-01 #1 | Fresh | Count the product rows of `seed/sample-erp.xlsx` independently (every non-empty row below the heading row of the first worksheet) = N. As Pat, load the file. Read the summary and count the `product` table | Loaded + not loaded = N; the store holds exactly the number the summary says was loaded |
| TC-02 | acceptance criterion | story-01-01 #2 | Loaded | For **every** ERP row the summary does not list as not loaded, look the full part number up with `GET /api/sales/store/part-numbers/:pn` | Part number, description and price equal the ERP row as the ERP shows it; status Open for quoting — for every row, not a sample |
| TC-03 | acceptance criterion | story-01-01 #3 | Loaded | Find the sample's row with no part number and its row with no price. Read the summary | Each is listed as not loaded with a reason; neither is in the store |
| TC-04 | acceptance criterion | story-01-01 #4 | Loaded | Find the two ERP rows sharing a part number at different prices | Both listed as not loaded with the reason "duplicate part number"; the part number is not in the store |
| TC-05 | acceptance criterion | story-01-01 #5 | Loaded | `GET /api/sales/store/load-summary` (the summary as viewed later, not only the load's answer) | The summary does not report the load as complete |
| TC-06 | acceptance criterion | story-01-02 #1 | Fresh | As Pat, add a product (part number, description, price). Look it up by part number | Found, with the fields entered |
| TC-07 | acceptance criterion | story-01-02 #2 | Fresh | As Pat, add a product at 10.00; change the price to 12.00; open the price history | Exactly one new line: old 10.00, new 12.00, who = Pat, date and time within the call's window |
| TC-08 | acceptance criterion | story-01-02 #3 | Fresh | As Pat, add a product; change its price three times in quick succession; open the history | Three lines, oldest first (by time and by sequence), chaining old → new |
| TC-09 | acceptance criterion | story-01-03 #1 | Loaded | As Pat, close an open product; re-read the product | Status Closed |
| TC-10 | acceptance criterion | story-01-04 #1 | Loaded | As Sam (rep, named for nothing), change a product's price | Refused; price and price history unchanged |
| TC-11 | acceptance criterion | story-01-04 #2 | Loaded | As Sam, add a product; close an open product | Both refused; product count, the new part number's absence and the product's status all unchanged |
| TC-12 | acceptance criterion | story-01-04 #3 | Loaded | As Casey (Reseller A, buyer), open each store page: `/sales`, `/sales/store`, `/sales/store/load-summary`, a product page, the add-product page, `/sales/named-users`. Pat opens the same pages in the same run | Casey refused on each; Pat gets 200 on each (the refusal is proven against a route that answers) |
| TC-13 | acceptance criterion | story-01-04 #4 | After TC-12 | As Jo (internal admin), read the refused attempts list | A record per Casey refusal holding the user, the page or action, and the date and time |
| TC-14 | acceptance criterion | story-01-04 #5 | Loaded | As Sam, send the price change straight to `POST /api/sales/store/products/:id/price` with a valid session and anti-forgery token | Refused; price unchanged |
| TC-15 | acceptance criterion | story-01-05 #1 | Fresh + one product | Sam signs in; Morgan (role manager, stands in for Jensen Huang) names Sam price maintainer; Sam changes a price from the session opened before the naming | Refused before the naming; succeeds after it |
| TC-16 | acceptance criterion | story-01-05 #2 | Fresh + one product | Pat signs in and changes a price; Morgan removes Pat; Pat changes the price again from the same session | Second change refused; price unchanged; history unchanged |
| TC-17 | acceptance criterion | story-01-05 #3 | Fresh | Morgan names Alex discount setter; Alex sets Demo Reseller A's standard discount to 12 | Accepted; the resellers list shows 12 % for Reseller A |
| TC-18 | acceptance criterion | story-01-05 #4 | Fresh | Morgan removes Lee from discount setters; Lee changes Demo Reseller C's discount | Refused; C's discount unchanged |
| TC-19 | acceptance criterion | story-01-05 #5 | Fresh | As Sam, name Sam price maintainer; remove Pat | Both refused; both lists unchanged |
| TC-20 | boundary | story-01-01 #1, #2; T-14 | Fresh | Load a hand-built workbook with prices 0 (below), 0.0001 (smallest on), 0.00015 (5 places, above precision), 900719925474.0991 (largest exact, on), 900719925474.0992 (above), each once as a number cell and once as a text cell | 0, 5-place and above-max listed with a reason; 0.0001 and the max loaded exactly (checked on the stored integer); count identity holds |
| TC-21 | boundary | story-01-01 #2; FDE decision (64 characters) | Fresh | Load part numbers of 63, 64 and 65 characters; separately add products with 63, 64 and 65 | 63 and 64 loaded/added and found; 65 listed with a reason / refused |
| TC-22 | failure mode | story-01-01 #1, #3, #5; T-14 | Fresh | Load a workbook with price `1,234.50`, `$12`, `#REF!` (an error cell), a formula, blank, `-5`, and a blank part number, beside good rows | Each bad row listed with its reason; none in the store; identity holds; not complete |
| TC-23 | failure mode | story-01-01 #4 | Fresh | Load duplicates: same part number same price; differing only in case; differing by surrounding spaces; three rows of one part number | Every row of every duplicate group listed "duplicate part number"; none in the store; identity holds |
| TC-24 | state transition (repeat) | T-15 | Loaded, one price changed after the load | As Pat, load the sample again | Refused; product count and the maintained price unchanged |
| TC-25 | boundary (zero, one) | story-01-01 #1, #5 | Fresh ×2 | Load a heading-only workbook; on another fresh store load a one-row workbook | Identity holds at N = 0 and N = 1; completeness reported as observed (a question if the criterion is silent) |
| TC-26 | failure mode | story-01-01; input handling | Fresh | Post the load with no file; with a text file named `.xlsx`; with a workbook missing the Price column | Each refused with a message (4xx, never 5xx); store still empty; a proper load still possible afterwards |
| TC-27 | failure mode (concurrency) | T-15; practice lesson "a rate limiter is the same check-then-act shape as an idempotency token" (voltway-returns-portal) | Fresh | Fire 5 loads of the sample at once as Pat | Exactly one accepted; the store holds exactly one load's products |
| TC-28 | failure mode (raw bytes) | story-01-01 #2; practice lesson "assert on the record as the system holds it" (voltway-returns-portal) | Fresh | Load descriptions with a line break, leading/trailing spaces, `µF`, `Ω`, `±`, and a part number with a trailing space; compare the database bytes with the cell | Stored text equals the ERP cell as the ERP shows it, or the row is listed with a reason — never altered silently |
| TC-29 | boundary | story-01-02 #1 | Fresh | Add products with price `0`, `0.0001`, `0.00001`, `-1`, `12,50`, empty, `1e3`, `900719925474.0991`, `900719925474.0992` | Only the plain positive values with ≤ 4 places (and within the exact range) accepted; each refusal 4xx, never 5xx |
| TC-30 | failure mode | story-01-02 #1 | Fresh + one product | Add the same part number again; in other case; with surrounding spaces; blank description; description of 500 and 501 characters | Duplicates refused whatever the case or spacing; blank refused; 500 accepted, 501 refused |
| TC-31 | state transition | story-01-02 #2 | Fresh + one product at 10.00 | Change to 10.00 (same); to `abc`; on product id 999999; on id `x` | No history line for the same or invalid price; unknown id 404; malformed id 4xx; none 5xx |
| TC-32 | failure mode (concurrency) | story-01-02 #2, #3 | Fresh + one product | Fire 10 price changes on one product at once as Pat | One history line per accepted change; each line's old price equals the previous line's new price; final price equals the last line's new price |
| TC-33 | state transition | story-01-03 #1 | Fresh + one product | Close it; close it again; close id 999999 | Second close refused (still Closed); unknown id 404 |
| TC-34 | cross-story sequence | story-01-02, story-01-03, story-01-01 | Loaded | Add a product → change its price → close it → try to change its price again → look it up | Status Closed throughout the rest; history and price agree with whatever the closed-product price change did; lookup still finds it |
| TC-35 | cross-story sequence (grant → revoke → grant) | story-01-05 #1, #2; story-01-04 | Fresh + one product | Morgan removes Pat; Pat is refused add, close and price change; Morgan names Pat again; Pat's price change succeeds | Refusals leave the store unchanged; the re-grant works; role history keeps both earlier states |
| TC-36 | state transition (repeat) | story-01-05 #5 | Fresh | Morgan names Sam price maintainer twice; removes Sam twice; removes a user who was never named | No 5xx; one live assignment after naming twice; second removal and never-named removal refused or no-op, and the list is right |
| TC-37 | authorization | story-01-05 #5; T-08 | Fresh | Jo (internal admin) names self price maintainer; Morgan names self discount setter; Morgan names someone `internal admin` / `role manager`; Morgan names id 999999; Morgan names Chris (not on the internal users list) | Every one refused; lists unchanged |
| TC-38 | authorization | story-01-04 #1, #2; story-01-05 DoD (lists separate) | Loaded | Pat (price maintainer only) sets a discount; Lee (discount setter only) changes a price, adds, closes | All refused; nothing changed |
| TC-39 | authorization | story-01-04 #3, #4; T-06 | Loaded | As Casey, call every `/api/sales` route directly (every read and every change); an internal caller entitled to each calls the same route in the same run | Casey refused on every route and every refusal recorded; the entitled caller gets 2xx on every route |
| TC-40 | authorization | T-06; story-01-04 | Loaded | With no session, call every `/api/sales` route and open `/sales/store` | Every API call 401; nothing returned from the store |
| TC-41 | authorization | T-05; story-01-04 #4 | Fresh | Sign in as Chris (a Bow account not on the internal users list) | Refused, and recorded |
| TC-42 | authorization | T-21 | Fresh + one product | As Pat, change a price with no anti-forgery token; with a wrong one; with Sam's token. Inspect the session cookie | All refused, price unchanged; the cookie is `HttpOnly` and `SameSite=Strict` |
| TC-43 | authorization | story-01-04 #4; architecture §5.4 (refused attempts readable by internal admins) | After TC-39 | Sam, Pat, Morgan and Casey read the refused attempts list; Jo reads it | Only Jo is answered |
| TC-44 | failure mode (input handling) | story-01-04 #3 | Loaded | As Casey, open `/SALES/Store`, `//sales/store`, `/sales/%2e%2e/sales/store`, `/sales%2Fstore`, `/sales/store?x=1`, `/%73ales/store` | Refused, redirected to a refused page, or not found — never the application page and never 5xx |
| TC-45 | non-functional | N-07 | Loaded, after changes and refusals | With the application's own database file and driver, attempt UPDATE and DELETE on every append-only table (price_change, refused_attempt, erp_load_run, erp_load_rejected_row, product_history, role_assignment_history, discount_change, standard_discount_history), and DELETE on product and role_assignment | Every attempt refused by the database |
| TC-46 | non-functional | N-09 | Fresh + one product | Lee and Pat each hold a session; Morgan removes both roles; each makes the next action without signing in again | The very next action is refused, with no grace period |
| TC-47 | non-functional (start-up guard) | T-23 | none | Start the portal with local stand-ins on `PORTAL_PUBLIC_URL=https://portal.bow.example`; with `PORTAL_MODE=production`; with a mixed adapter set. Inspect the production bundle for the `/dev` routes | Each start refused with a message; the production bundle carries no `/dev` routes |
| TC-48 | regression | whole Epic | Build commit | Run the project's own suite (`npm test`) and the type check | All pass at the build under test |
| TC-49 | non-functional | N-01 (partly) | Loaded (2,000 products) and a 250,000-product store if the load completes | 50 concurrent searches, 200 in all, timing each server answer | p95 reported against 1.0 s; the committed scale noted where not reached |
| TC-50 | failure mode (input handling) | T-13 | Loaded | Search `" OR 1=1 --`, `NEAR((a,b),5)`, `*`, `"`, and a 2,000-character string | Each answers with results or none, never 5xx |
| TC-51 | boundary | story-01-05 #3 (the set action) | Fresh | As Lee, set Reseller A's discount to `-1`, `0`, `100`, `100.01`, `12.5`, `12.555`, `12 %`, empty | 0 and 100 accepted; below 0, above 100, and three places refused; history gains one line per accepted change only |
| TC-52 | exploratory | story-01-01 | Fresh | Read the load summary before any load has run | A clear "nothing loaded" answer, not an error and not "complete" |
| TC-53 | exploratory | story-01-01 #2 | After TC-20 | Read back the smallest price loaded (0.0001) and a four-place price (0.0040) through the lookup | Shown without losing places (0.0001, 0.0040) |
| TC-54 | cross-story sequence | story-01-02 #1 then story-01-01; T-15 | Fresh | *Added during execution, prompted by TC-24's refusal message.* As Pat, add one product to the empty store, then run the go-live load of the sample. Try to remove the added product | The ERP is loaded, or the load is refused with a reason a maintainer can act on. Whether the store can recover is recorded |
| TC-55 | failure mode (concurrency) | story-01-01, story-01-02 #1; T-15 | Fresh | *Added during execution, beside TC-54.* Start the load of the sample. While it is in flight, send eight adds: five use part numbers the ERP holds, three are new | No server error. Store count = products loaded + adds accepted. No ERP part number holds a racing add's price while the summary counts it as loaded |

## 4. Boundaries identified

| Threshold | Below | On | Above |
|---|---|---|---|
| Price must be positive (story-01-01 #3 via T-14; store rule) | 0 (TC-20, TC-29) | 0.0001 (TC-20, TC-29) | 0.0002 implied by any normal price |
| Price precision: four decimal places (architecture §5.2) | 0.0040 (TC-53) | 0.0001 (TC-20) | 0.00015 / 0.00001 (TC-20, TC-29) |
| Largest price held exactly (2^53 − 1 ten-thousandths; practice lesson "validate against Number.MAX_SAFE_INTEGER", voltway-returns-portal) | — | 900719925474.0991 (TC-20, TC-29) | 900719925474.0992 (TC-20, TC-29) |
| Part number length, 64 characters (FDE decision, provisional) | 63 (TC-21) | 64 (TC-21) | 65 (TC-21) |
| Description length, 500 characters | — | 500 (TC-30) | 501 (TC-30) |
| Standard discount range 0–100 % | −1 (TC-51) | 0 and 100 (TC-51) | 100.01 (TC-51) |
| Discount precision, two places | 12.5 (TC-51) | — | 12.555 (TC-51) |
| ERP size N | — | 0 and 1 (TC-25) | 2,008 (TC-01), 250,000 (TC-49) |
| Duplicate group size | 1 (every loaded row) | 2 (TC-04) | 3 (TC-23) |
| Concurrent writers | 1 | — | 5 loads (TC-27), 10 price changes (TC-32) |

## 5. Not covered, and why

- **Clicking through the screens in a browser.** The loadout pins a Playwright browser, and it is not connected in this QA session. Every case is driven over HTTP against the running portal — the same routes the screens call — and the page routes are requested as a browser would. What this cannot see: the screens' own rendering (the words "Closed", "Load not complete", the price history table), client-side validation, and browser-held state. Screenshots are therefore not part of the evidence.
- **Cross-browser runs (N-14).** No browser available; not set up by the build either.
- **N-01 at 250,000 products against the production database tier** — SQLite on one Mac is not the committed test environment; TC-49 measures what can be measured locally and says so.
- **Stage 2 behaviour**: Entra ID / External ID sign-in and lockout (T-20), Azure SQL ledger immunity against administrators (T-16), true simultaneous writers on SQL Server, the CI route-rule check in a pipeline and branch protection (T-22). None is built.
- **The real ERP spreadsheet.** story-01-01's definition of done requires it; no ERP owner is named. Every load case uses the synthetic sample or hand-built workbooks.
- **Session expiry (N-11)** — needs 61 minutes idle or a clock adapter move; not part of this Epic's criteria.
- **Cross-origin form submission from a real second origin (T-21)** — tested as the server's refusal of a missing or wrong anti-forgery token and as the cookie's `SameSite=Strict` attribute, not from a page on another origin in a browser.
