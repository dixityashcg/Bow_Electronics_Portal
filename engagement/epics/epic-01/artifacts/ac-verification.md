# Acceptance-criteria verification — epic-01: The catalog and pricing store replaces the Excel ERP

<!--
  The build's own claim, per acceptance criterion, and the thing QA exists to
  disprove. One row per criterion of every story in this Epic.

  `Status` is one of:

    pass         — verified, and the Evidence cell names how
    fail         — not met; name what fails
    not-checked  — not verified, with the reason. This is an honest answer and
                   a common one; a criterion nobody could check is not a pass.

  Evidence names a test, a check, or an observation someone could repeat — not
  "tested manually". A `pass` whose declared check in `dod.md` did not pass is
  named at completion and shown at the Epic Review, so the two are read
  together.

  The id form is `<story-id>#<n>`, matching the numbered criteria in the
  approved backlog: `story-01-01#1`.
-->

| AC | Status | Evidence |
|---|---|---|
| story-01-01#1 | pass | dod check `npm test -- --ac story-01-01#1` passed at c71983d; store-load.test.ts "[story-01-01#1] the number loaded plus the number not loaded equals the product rows in the ERP" (sample: 2000 + 8 = 2008, store holds 2000); hand-built files keep the identity with an empty row present. Run on the synthetic sample only: the real-ERP run the story's definition of done requires has not happened (no ERP owner, C-10) |
| story-01-01#2 | pass | dod check passed at c71983d; 22 sample rows (fixed-seed random, first and last) and a hand-built file with 0.0040, text "12.50", 180 and 0.4567, each looked up by full part number: part number, description, price and Open match the ERP row. Mapping is provisional until the ERP owner confirms it |
| story-01-01#3 | pass | dod check passed at c71983d; rows with no part number, no price, blank or spaces-only part number, `$12`, `1,234.50`, `#REF!`, a formula, zero, negative and five decimals are each listed with row number and reason, and none is in the store |
| story-01-01#4 | pass | dod check passed at c71983d; both sample rows of BWE-C0402X7R104K (0.0045, 0.005) listed "duplicate part number"; hand-built: same price, differing case and spacing, and a triple are all refused (FDE decision 2026-09-26 for identical prices) |
| story-01-01#5 | pass | dod check passed at c71983d; a load with any row not loaded returns complete false and statusText "Load not complete: …", on the load and when reopened; a clean load reads "Load complete" |
| story-01-02#1 | pass | dod check passed at c71983d; store-products.test.ts: added product found by exact part number (any case) and by store search on part number and description word; duplicate part number (any case) and invalid prices refused |
| story-01-02#2 | pass | dod check passed at c71983d; 10.00 → 12.00 adds exactly one line {oldPrice 10.00, newPrice 12.00, changedBy Pat (rep), changedAt within the call}; a same-price or invalid change adds none |
| story-01-02#3 | pass | dod check passed at c71983d; three changes 10 minutes apart on the local clock give three lines, oldest first; UPDATE and DELETE on price_change are refused by the database trigger |
| story-01-03#1 | pass | dod check passed at c71983d; closing returns and re-reads Closed; the search index row is closed in the same transaction; the earlier open state is kept in product_history; closing twice refused |
| story-01-04#1 | pass | dod check passed at c71983d; store-refusals.test.ts: Sam (rep) → POST price 403, price and history unchanged |
| story-01-04#2 | pass | dod check passed at c71983d; Sam refused add (403, product count unchanged, part number absent) and close (403, still Open); Sam also refused the ERP load (store-load.test.ts) |
| story-01-04#3 | pass | dod check passed at c71983d; Casey (reseller) gets 403 "Access refused" and no application page for /sales, /sales/store, the load summary, a product page and add product; every store interface route, reads included, is 403 |
| story-01-04#4 | pass | dod check passed at c71983d; after Casey is refused /sales/store/load-summary, Jo's refused attempts list holds {userKind reseller, user Casey (Reseller A, buyer), action "open page /sales/store/load-summary", at within the call}; the record refuses UPDATE and DELETE; reps and resellers are refused the list |
| story-01-04#5 | pass | dod check passed at c71983d; Sam's direct POST with a valid session and anti-forgery token → 403; without the token → 403 (Pat too); with no session → 401; price unchanged; the refusal is recorded with the action and route |
| story-01-05#1 | pass | dod check passed at c71983d; named-users.test.ts: Sam, signed in before being named, is refused, then Morgan names Sam price maintainer and Sam's next price change succeeds (role read on every call) |
| story-01-05#2 | pass | dod check passed at c71983d; Pat changes a price, Morgan removes Pat, Pat's next change from the same session → 403, price unchanged; the earlier grant is kept in role_assignment_history |
| story-01-05#3 | pass | dod check passed at c71983d; Alex refused, then named discount setter by Morgan, then sets Demo Reseller A to 12 %: listed as 12 %, one discount-change line None → 12 % by Alex. Built on the minimal set action (FDE decision 2026-09-26); the full resellers page is epic-04 |
| story-01-05#4 | pass | dod check passed at c71983d; Lee sets C to 11 %, is removed, then is refused 15 % and C stays 11 %; a price maintainer is refused a discount and a discount setter is refused a price change |
| story-01-05#5 | pass | dod check passed at c71983d; Sam (neither) and Pat (price maintainer) refused naming and removing; Jo (internal admin) and Morgan (role manager) each refused naming themself (T-08); lists unchanged |

<!--
  Add one row per criterion beneath the header above. A row is:

    the criterion id, as `<story-id>#<n>` — story-01-01#1
    its status      — the word pass, fail, or not-checked
    the evidence    — the test, check or observation someone could repeat,
                      or, for not-checked, the reason nobody could

  No sample row is written out here, in this comment or above it: every
  surface that asks "has this matrix been filled" looks for a status word
  between pipes, and finds one wherever it is written. A scaffold carrying a
  sample row reports itself as completed work.
-->
