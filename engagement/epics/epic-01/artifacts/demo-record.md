# Demo record — epic-01: The catalog and pricing store replaces the Excel ERP

**Demonstrated by**: Yash Dixit · **To**: Jensen Huang (Product Owner), Elon Musk (Enterprise Architect), at the Epic Review, after QA

This is the script for the Epic Review. The demonstration happens then, against software QA has passed. Every step is an action someone performs on the running portal, not a walk through code.

## What will be shown

**Before the review.** On the FDE's Mac, with Node.js 24: run `./scripts/reset.sh`, which gives an empty store with the fictional staff and resellers. Then run `./scripts/dev.sh` and open `http://localhost:3000/dev/sign-in`. The spreadsheet is `seed/sample-erp.xlsx`: 2,008 fictional product rows, of which 8 are deliberately bad (architecture §4.8). No real Bow data is used.

The steps follow the backlog's demo-notes (1)–(6). Steps 7–9 are extra failure paths.

1. **Load the ERP and open the load summary.** Sign in as **Pat (rep)**, a price maintainer. Open *Catalog and pricing store → ERP load summary*, choose `seed/sample-erp.xlsx` and press **Load the ERP**. You see: *Product rows in the ERP 2008*, *Products loaded into the store 2000*, *Rows not loaded 8*, a warning reading "Load not complete: 8 of 2008 product rows in the ERP were not loaded", and the eight rows, each with its ERP row number and reason:
   - no part number;
   - no price;
   - `$12` and `1,234.50`, each "not a plain number";
   - `#REF!`, "an error value";
   - a formula;
   - two rows of `BWE-C0402X7R104K` at 0.0045 and 0.005, both "duplicate part number".
2. **Pick a part at random and compare it with the ERP.** Open the spreadsheet in Excel, pick any row, and type its part number into the store search. The product's description and price are the ERP row's, and its status is *Open for quoting*.
3. **Change its price and open the history.** On the product page, enter a new price and press **Change price**. The price history shows one line: old price, new price, "Pat (rep)", and the date and time.
4. **Add a product.** *Add a product*: part number, description, price. Save. The product page opens, and a search for the part number finds it.
5. **Close a product for quoting.** On any product page press **Close for quoting**. The status badge reads *Closed*.
6. **Take Pat off the price maintainers and watch Pat be refused.** In a second browser window (private, so the sessions stay separate) sign in as **Morgan (role manager)**, who stands in for Jensen Huang. Open *Named users* and press **Remove** next to Pat under *Price maintainers*. Back in Pat's window, on the product page that is still open, enter a new price and press **Change price**. The page shows "Only a price maintainer can change a price." Reload: the price is unchanged, and the history has not grown.
7. **A reseller opens the store (failure path, story-01-04 c3–c4).** Sign in as **Casey (Reseller A, buyer)** and type `http://localhost:3000/sales/store` into the address bar. The page is "Access refused". Sign in as **Jo (internal admin)** and open *Refused attempts*. It lists Casey, "open page /sales/store" and the time, and Pat's refused price change from step 6.
8. **Name a discount setter (story-01-05 c3–c4).** As Morgan, name **Alex (rep)** under *Discount setters*. As Alex, open *Resellers and standard discounts* and set Demo Reseller A to 12. It shows 12 %. As Morgan, remove **Lee (rep)** from *Discount setters*. As Lee, try to change Demo Reseller C from 10 %. The change is refused and C stays at 10 %.
9. **A rep named for nothing tries to name someone (story-01-05 c5).** As **Sam (rep)**, open *Named users* and try to name themself a price maintainer. Refused. Then load the ERP spreadsheet a second time as a price maintainer. That is refused too, because the store already holds products, and nothing changes (T-15).

The same path was run end to end against the running portal (`dev.sh`) during the build, over HTTP. It covered the load (2008 / 2000 / 8), a random part compared with its ERP row, a price change and its history, add, close, Pat removed and then refused with the price unchanged, Casey refused `/sales/store`, and both refusals listed for Jo. It was not run through a browser; see *Known gaps*.

## Against which acceptance criteria

| Story | Criterion | Shown by |
|---|---|---|
| story-01-01 | c1 loaded + not loaded = rows in the ERP | Step 1: 2000 + 8 = 2008 on the summary |
| story-01-01 | c2 fields match the ERP row | Step 2: a random ERP row, looked up by its full part number |
| story-01-01 | c3 no part number / no price listed with reason | Step 1: rows 37 and 211 of the sample, with reasons |
| story-01-01 | c4 duplicate part numbers both listed | Step 1: both `BWE-C0402X7R104K` rows, "duplicate part number" |
| story-01-01 | c5 not reported complete when rows are not loaded | Step 1: the warning "Load not complete…" |
| story-01-02 | c1 added product found by part number | Step 4 |
| story-01-02 | c2 price change adds a history line (old, new, who, when) | Step 3 |
| story-01-02 | c3 three changes, three lines, oldest first | Step 3 repeated twice more on the same product |
| story-01-03 | c1 closed product shows Closed | Step 5 |
| story-01-04 | c1 rep not named refused a price change, price unchanged | Step 6 (Pat, after removal) and step 9 (Sam) |
| story-01-04 | c2 rep not named refused add / close, store unchanged | Step 9: as Sam, *Add a product* and **Close for quoting**, both refused |
| story-01-04 | c3 reseller refused store pages | Step 7 |
| story-01-04 | c4 refused attempt recorded: user, page or action, time | Step 7, the *Refused attempts* list |
| story-01-04 | c5 direct price change refused | Not shown in the room: it needs a hand-made request. Shown by the tagged tests, which send the request directly with a valid session and anti-forgery token |
| story-01-05 | c1 named user can change a price | Step 1 onwards (Pat named at the start), and Sam once Morgan names them |
| story-01-05 | c2 no longer named, refused, price unchanged | Step 6 |
| story-01-05 | c3 named discount setter can set a standard discount | Step 8 (Alex) |
| story-01-05 | c4 no longer named, refused, discount unchanged | Step 8 (Lee) |
| story-01-05 | c5 rep named for neither refused changing who is named | Step 9 |

## Artifacts

- **Server** (`apps/server`): NestJS 11 on Fastify 5, Kysely over SQLite (Stage 1).
  - The access module: sessions, the default-deny route guard, the refused attempts record, and named users.
  - The catalog and pricing module: products, prices, price history, close for quoting, the one-off ERP load, and the standard-discount set action.
  - Migrations with append-only and history triggers.
  - The start-up guard (T-23), the local sign-in stand-in, and the seed.
- **Browser application** (`apps/web`): React 19 and Fluent UI v9.
  - Store screens: search, load summary, product page with price history, and add product.
  - Named users; resellers and standard discounts; refused attempts.
  - The development sign-in page (Stage 1 only; absent from the production bundle).
- **Shared** (`packages/shared`): money and percentage handling in whole numbers, and the validation schemas both sides use.
- **Scripts**: `scripts/dev.sh`, `scripts/reset.sh` (with `--after-epic 01`), and `scripts/test.mjs` (the per-criterion check runner).
- **Seed**: `seed/sample-erp.xlsx`, generated by `npm run seed:sample-erp`.
- **Tests**: 100 Vitest tests. The criteria's checks are declared in `artifacts/dod.md`, and all 19 passed as machine-run checks at c71983d.

## Senior review

Reviewed after the build, before completion, by a separate senior-reviewer context. What it examined, what it did not, what it required and what was done are in the internal review record. The required changes it raised are listed there with their status.

## Captured evidence

Not captured. No screenshots or recording of the demo run exist yet. The build ran the demo path over HTTP against the running portal (the transcript is summarised under *What will be shown*), which is not a capture of the screens. The operator captures the Epic Review run into this folder.

## Known gaps

- **story-01-01 is not done until it has run against the real ERP spreadsheet.** Its definition of done requires a run against a copy of the real ERP from the ERP owner, with the columns mapped with that owner. No ERP owner is named (architecture C-10, Q-11). The column mapping in `apps/server/src/catalog/erp-mapping.ts` is therefore **provisional**: it is the sample file's headings "Part number", "Description" and "Price" on the first worksheet. The Epic Review runs on the synthetic sample, as the architecture directs.
- **Standard discounts are built only as far as story-01-05 needs.** The FDE decided on 2026-09-26 that epic-01 builds the set action and its history for story-01-05 c3–c4. The full resellers page and story-04-01's other criteria (refusal records for discounts, a reseller never seeing its discount, the history screen) arrive with epic-04.
- **SQL Server and the pipeline are deferred to Stage 2** (FDE decision, 2026-09-26). The database rules are proved on SQLite only. Nothing here proves them on Azure SQL: ledger immunity against administrators, true simultaneous writers, full-text ranking. There is no GitHub Actions pipeline yet.
- **Not exercised in a browser by the build.** The build agent had no browser. The screens were typechecked and built, and every behaviour behind them was driven over HTTP, but nobody has yet clicked through them. Cross-browser runs (Playwright, N-14) are not set up.
- **Maintaining the internal users list has no screen.** Who is admitted to the internal side is seeded. A Bow account not on the list (Chris) is refused and recorded (T-05), but adding or removing internal users, internal admins and role managers is not on any screen in this Epic. No epic-01 story asks for it.
- **Times show in UTC.** Bow's business time zone is still open (architecture Q-03). Times are held in UTC and shown in the zone set by `BUSINESS_TIME_ZONE`, which defaults to UTC with the zone named on screen.
- **Who added a product is not recorded.** The data model (architecture §5.1) holds no "added by" for a product, and story-01-02 does not ask for one. Price changes do record who made them.

## Feedback from the demo

<!-- Filled in during or after the demo. Feedback here returns the Epic to
     Build; the gate stays unapproved until it is re-demonstrated. -->
