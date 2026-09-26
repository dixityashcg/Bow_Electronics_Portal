# Review Record — epic-01: The catalog and pricing store replaces the Excel ERP

**Reviewed by**: senior reviewer agents · **Overseen by**: Yash Dixit

<!--
  INTERNAL. This does not go to the client.

  It is evidence about how the work was done, not a deliverable. It exists so
  that "was this reviewed?" has an answer other than someone's recollection,
  and so the next Epic can see what the reviewer kept having to ask for.
-->

## 1. What was reviewed

Two readings by contexts that did not write the code, both after the build and before completion:
- **Senior review.** A separate senior-reviewer context composed from six senior-reviewer personas: security, TypeScript, SQL, testing strategy, data modelling and React. It followed the `code-review` playbook: criteria, then correctness, contract, security, scope.
- **Adversarial per-criterion reading.** Its 19 verdicts are in `assessments/adversarial-review.md`.

Both reviewers ran the suite and probed the running code in-process, with throwaway scripts outside the repository. Round 1 was at c71983d–3f57cf1. Round 2 re-checked the fixes at 2ce51fe, and round 3 at 95974a6. The build's own fix for round 3's one finding (762f093) was not re-read by a reviewer; see §3a.

| Story | Area | Reviewed |
|---|---|---|
| all | Criteria and design | backlog epic-01; architecture §4.2, §4.7, §4.8, §5.1–§5.6, §8.2 (T-05, T-06, T-07, T-08, T-13, T-14, T-15, T-21, T-23); `artifacts/dod.md` |
| story-01-01 | ERP reader (`catalog/erp-reader.ts`, `erp-mapping.ts`) | Heading detection, blank-row rule, formula, error, rich-text and numeric cells, the duplicate rule, the count identity. Probed: several worksheets, a blank description, long part numbers, very large prices, `+5`, full-width digits, NBSP-padded text, numeric part numbers, date cells, a title row |
| story-01-01 | Load and summary (`catalog.service.ts` `load` / `loadSummary`, upload route) | T-15 check inside the transaction, the `complete` flag and status text, a non-multipart body (406), a 26 MB file (413) |
| story-01-02, 01-03 | Products, prices, close; `packages/shared/src/money.ts` | History order, same-price refusal, search index written in the same transaction, parse and format bounds |
| story-01-04 | Authorisation (`access.guard.ts`, `rules.ts`, `access.service.ts`, `web/pages.ts`) | Default deny, anti-forgery before role, refusal recording, roles and active flag read on every call, session limits. Page-path variants probed as a reseller |
| story-01-05 | Named users and the discount set action (`named-users.service.ts`, `access.controller.ts`, `discount.service.ts`) | Self-naming refused, re-grant, the two lists kept separate, a role outside the two lists refused, 0 % and 100 % bounds |
| all | Data model (`db/migrations.ts`, `database.ts`) | Append-only and history triggers, case-insensitive unique part number, `price > 0`, foreign keys, types against the migrations |
| all | Configuration and T-23 (`config.ts`, `main.ts`, `dev/dev.module.ts`, `build.mjs`, `vite.config.ts`) | The guard's refusals, the production refusal, the loopback bind, the cookie flags, stand-ins left out of the build |
| all | Browser application (`apps/web/src`) | Store pages, named users, resellers, refused attempts, the sign-in pages, the API client |
| all | Tests and scripts | All epic-01 test files and the harness against the DoD's "what each check must show"; `scripts/test.mjs` tag counting; `dev.sh`, `reset.sh`, `cli/seed.ts --after-epic 01` |

## 2. What was not reviewed, and why

- **The real ERP spreadsheet.** None exists yet (C-10, Q-11). The reader was judged only against synthetic and hand-built workbooks. The column mapping is provisional.
- **SQL Server / Azure SQL.** Deferred to Stage 2 (FDE decision). Not examined: ledger immunity, column grants, `CONTAINS` search, and true concurrency for T-15 and the load. SQLite serialises writers, so every race considered here is untested by construction.
- **`seed/sample-erp.ts`, `cli/sample-erp.ts`, the reseller part of `seed/people.ts`, and `test/config.test.ts`.** Not read line by line; relied on only through the tests that consume them.
- **The browser application in a real browser.** No reviewer and no build agent had a browser. React behaviour was judged from source. Two things are unverified: whether React Router renders the store page for an odd spelling (now moot on the server, since the page is never served), and how `location.assign` handles hostile `next` values.
- **The production bundles, beyond a text search.** The "dev module absent" claim rests on the build defines, a search of the built server bundle for the dev controller (0 matches), and `dev-pages.test.ts`, which runs without the module rather than against the built bundle.
- **`SalesHome.tsx`, `ResellerHome.tsx`, `NotFound.tsx`, `store/types.ts`.** Glanced at only; they carry no criterion.
- **Performance (N-01 at 250,000 products), accessibility (N-13), cross-browser (N-14).** Out of this Epic's criteria. No tooling was run.
- **Dependency audit.** Run by the build, not the reviewer. After upgrades, 2 moderate findings remain in `uuid` inside ExcelJS (v3/v5/v6 with a caller-supplied buffer, which the portal never uses). One fix was an override: every Fastify copy is now 5.12.5, which the audit shows past the ≤5.12.0 advisories. That override moves Nest's pinned 5.11.3 up one minor version and has not been reviewed.

## 3. Changes required

| # | Story | What was required | Why | Status |
|---|---|---|---|---|
| R-1 | story-01-01 c1, c5 (T-14) | Refuse a workbook with data on more than one worksheet, or list those rows | Verified: a product on a second sheet was loaded nowhere, and the summary said "Load complete". The price maintainer would sign off a store with products missing | done, 2ce51fe; test `[story-01-01#1] a workbook with products on more than one worksheet is refused whole…` |
| R-2 | story-01-04 c3, c4 | A store page opened under another spelling (`/SALES/store`, `//sales/store`, `/sales%2Fstore`) must be refused and recorded, not served | Verified by both reviewers: 200 with the application for a reseller, and no refusal recorded. No price leaked, since the data calls were refused. Raised as non-blocking by the senior reviewer and as disagree-with-evidence by the adversarial reviewer; treated as required, because criterion c3 reads "any page" | done, 2ce51fe; 308 to the canonical path, then refused and recorded; the browser's `InternalOnly` requires an internal user; tests `[story-01-04#3] another spelling…`, `[story-01-04#4] a store page opened under another spelling…` |
| R-A2 | story-01-01 c2 | A part number held as a number must be stored as the ERP shows it | Adversarial review: an ERP cell showing `1.10` was stored as `1.1`, so a lookup by the part number as shown returned 404 | done for the plain formats `0.00` and `00000`, 2ce51fe; other formats fall back to the number as written (§5) |
| R-3 | story-01-04 c4 (BR-03) | Record refusals made for a missing anti-forgery token | Verified: a reseller's POST without the token was refused and left no record. Raised as non-blocking; made, because BR-03 says every refusal | done, 2ce51fe; test `[story-01-04#4] a store change sent without the anti-forgery token is refused and recorded too` |
| R-5 | story-01-01 | Safe-integer bound on numeric price cells | Parity with the text path; above about 9 × 10¹¹ a price would be stored imprecisely | done, 2ce51fe |
| R-8 | T-23 hygiene | Dev sign-in accepts only a same-site `next` | Open redirect or `javascript:` address on the dev page; the Stage 2 sign-in must not copy the pattern | done, 2ce51fe |
| R-9 | hardening | Escape the text on the error page | No user input reaches it today | done, 2ce51fe |
| R-12 | React | Clear stale errors after a later success; keep the chosen user when naming fails | Wrong messages on screen | done, 2ce51fe |

### 3a. Rounds 2 and 3

| # | Round | Story | What was required or found | Status |
|---|---|---|---|---|
| R-1 … R-12 | 2 | — | Re-checked at 2ce51fe: R-1, R-3, R-5, R-9 done; R-2, R-8 and R-12 done with gaps, which became the items below | closed |
| N-1 | 2 | story-01-04 | The R-2 redirect put a decoded path into the `Location` header; control characters gave a 500 that anyone could trigger. Non-blocking, fixed | done, 95974a6 (404 for control characters; target encoded) |
| N-2 | 2 | story-01-04 | Dot segments survived canonicalisation (odd same-site redirects). Non-blocking | done at 95974a6; superseded by N-3's fix |
| R-8′ | 2 | T-23 hygiene | A tab or newline in `next` still left the site | done, 95974a6 (`new URL` with a same-origin check) |
| R-12′ | 2 | React | A second failure kept showing the first error | done, 95974a6 |
| A-1 | 2 (adversarial) | story-01-01 c1 | A second table beside the first, under a repeated heading, was read as one row, with the load reported complete | done, 95974a6: a repeated mapped heading refuses the file |
| A-2 | 2 (adversarial) | story-01-01 c2 | Number formats other than `0.00` and `00000` loaded in a form other than the one shown; date descriptions became local-time text | done, 95974a6: only General, zero padding and fixed decimals are rendered (rounded as Excel shows); anything else, and dates, is listed as not loaded |
| N-3 | 3 | story-01-04 c3, c4 | N-2's fix resolved dot segments hidden behind `%2F`. The server and the browser then disagreed about the page, and `/SALES/store/products/1%2f..%2f…` served the page shell with no refusal recorded. The third fix attempt on this family | done, 762f093: addresses are fully decoded before the `/sales` check, and hidden dot segments are never resolved or served (404). **Verified only by the build**: a fuzz of 1,505 spellings, as a reseller, in-process, found none served and no 500. No reviewer has re-read this fix. Carried to QA (§5) |
| R-4 | FDE ruling | story-01-01 | Blank description and over-long part number from the ERP | done, 762f093, per the FDE's decision (critique Q2) |
| R-6, R-10 | FDE ruling | story-01-01, 01-03 | No route to a complete summary; no who or when for add and close | decided by the FDE: change requests cr-01, cr-02 and cr-03 raised; not built in this Epic |

The internal review loop ran three rounds: round 1 continue, round 2 continue, round 3 resolved. R-1 was the only required change across all three and closed in round 2. The adversarial reviewer's verdicts at 95974a6: 19 agree, after one disagree-with-evidence and two disagree-with-concern in round 1.

## 4. Accepted with reservations

- **R-4, story-01-01: the ERP path accepted what the screen refused.** Decided by the FDE (critique Q2) and built: see §3a.
- **R-6, story-01-01: an incomplete load can never become complete.** Decided by the FDE (critique Q1): a check-only run, raised as cr-01. Until it is accepted and built, the live load still has one attempt.
- **R-7, story-01-01 DoD.** The story is not done until the run against a real ERP copy with the mapping agreed with its owner. `ac-verification.md` carries the c1 and c2 passes on the synthetic sample only, and says so.
- **R-10, story-01-03.** Closing a product records no who or when. `product_history` keeps only the earlier row. `superseded_at` in every `*_history` table comes from the database clock, not the clock adapter. No criterion asks for more, but BR-17's accountability intent may. Left for the FDE.
- **R-11, story-01-05 c3/c4, scope.** The minimal set action also brought a reseller list, a discount-history read and a Resellers page. They are there so the result can be observed. The set action accepts 0 % and 100 %; epic-04 should confirm the bounds.
- **Build choices the reviewer accepted:**
  - `refused_attempt` gains a `user_label` column not in the §5.1 data model, because a refused sign-in (T-05) has no portal user id.
  - `role_assignment` is re-granted by updating its row, with the earlier grant kept by the history trigger. The key is the data model's.
  - Named-user and discount changes read the role fresh on every call. There is no cache.

## 5. Risks carried into QA

Where the reviewers are unsure. These sharpen a test; they do not explain why the code is right.

- **ERP reader against real-world workbook shapes (story-01-01 c1, c3).**
  - Load workbooks with hidden rows, merged part-number cells, a title row above the headings, a heading spelled "Part No.", a currency-formatted numeric price, a hyperlink cell, a trailing "Total" row, and a numeric part number in any format other than `0.00` or `00000`.
  - For each, compare loaded plus not loaded with the count you make by hand in Excel, not the count the loader reports.
  - A row holding only a note in an unused column is counted as a product row and listed "no part number; no price". Check that the Product Owner accepts that.
- **Encoded dot segments and other spellings (story-01-04 c3, c4; N-3, fixed and verified only by the build).** As a reseller, in a real browser, open `/SALES/store/products/1%2f..%2f..%2f..%2f..%2fhome`, `/SALES/named-users%2f..%2f..%2fx`, `/sales%252Fstore` and `/SALES/%0d%0a`. Expect 404 or "Access refused", never an internal screen and never a 500. Expect an "open page" line for each one that is refused.
- **Workbook refusals (story-01-01).** A second worksheet with data (hidden ones included) or a repeated heading refuses the whole file. Numeric part numbers in any format other than General, zero padding or fixed decimals are listed as not loaded, and so are dates. With a real ERP export, check how many rows that is, and that the operator can act on the messages. A General-format part number of 12 or more digits is stored in full, as the formula bar shows it, not as a narrow cell shows it.
- **Page guard, in a real browser (story-01-04 c3, c4).** As a reseller, open `/SALES/store`, `/Sales/store/products/1`, `//sales/store` and `/sales%2Fstore`. Record what renders, and whether *Refused attempts* shows an "open page" line for each.
- **Load summary on the demo path (story-01-01 c5).** The sample file always carries bad rows, so the demo summary always reads "Not complete". Add a rejected part by hand afterwards and see what the summary says (R-6).
- **T-15 under concurrency.** Two simultaneous loads into an empty store are serialised by SQLite here. Re-test on SQL Server in Stage 2: one load wins, one set of products.
- **Role removal while a page is open, in a browser (N-09).** Remove Pat while Pat's product page is open, then submit. Refused, price unchanged. The server test covers this; the browser path is not covered.
- **Reset while running.** Run `./scripts/reset.sh` while `dev.sh` is serving. The server keeps the deleted database file open, so check whether the demo sees stale data until a restart.
- **Search with hostile input (T-13).** `" OR 1=1 --`, `NEAR((a,b),5)`, `*`, a 2,000-character string, `^abc`, `col:"x"` and `'` all returned 200 on SQLite. Repeat through the screen, and on SQL Server in Stage 2.
- **Adding a product before the go-live load blocks the load permanently (T-15 as designed).** Check that the go-live runbook says the load comes first.
