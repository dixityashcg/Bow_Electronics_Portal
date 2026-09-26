# Adversarial review — epic-01

A second reading of the build, by a context that did not write it, on the
strongest model this host offers. One verdict per acceptance criterion, and
only these three:

- `agree` — the criterion is met and you would defend that at the review.
- `disagree-with-evidence` — it is not met, and here is what shows it.
- `disagree-with-concern` — something is wrong and you cannot yet prove it.

The third is not a softer first. Unease that gets rounded up to agreement is
the failure this form exists to prevent; say it, and the humans decide.

After the build fixes something you disagreed with, re-probe it and add a
line under the block, keeping your first verdict as it stands:
`- **Re-verdict**: agree — <what you re-checked, and at which commit>`.
The Epic Review shows both readings; a disagreement nobody re-read stays one.

### story-01-01#1-01db1a3d — Given the ERP holds N product rows, when the load completes, then the number loaded plu...

- **Verdict**: disagree-with-concern
- **Evidence** (or **Concern**): **Concern**: The identity holds by construction for the N the reader counts: rowsRead = candidates.length and every candidate goes to loadable or rejected (apps/server/src/catalog/erp-reader.ts:132-178). `cd apps/server && ../../node_modules/.bin/tsx --tsconfig tsconfig.json /private/tmp/claude-501/-Users-yashdixit-Bow-Electronics-Portal/feb9f7e3-b430-4b85-98ff-c4bb5f20178a/scratchpad/probe1.mts` gave rowsInErp 26 = 13 loaded + 13 not loaded, with formulas, error values, dates, booleans, rich text and hyperlinks in the cells. But the reader decides what N is, and it reads only the first worksheet (erp-reader.ts:105). `cd apps/server && ../../node_modules/.bin/tsx --tsconfig tsconfig.json /private/tmp/claude-501/-Users-yashdixit-Bow-Electronics-Portal/feb9f7e3-b430-4b85-98ff-c4bb5f20178a/scratchpad/probe3.mts` built a workbook with 3 products on two sheets and got rowsRead 2, rejected [], so the summary would say "Load complete: all 2 product rows in the ERP were loaded" while a product is missing and appears nowhere. A row holding only a note in an unmapped column also counts as a product row (probe1 row 21). Whether this matters depends on the real ERP's layout, which nobody has seen: no ERP owner is named, the column mapping is provisional (erp-mapping.ts:4-10), and the definition-of-done run against the real file has not happened. Until that run, "equals N" is proven only for a single-sheet file shaped like the synthetic sample.

### story-01-01#2-cdbbb004 — Given a product in the ERP, when its full part number is looked up in the store after t...

- **Verdict**: disagree-with-concern
- **Evidence** (or **Concern**): **Concern**: For text part numbers the lookup matches: `cd apps/server && ../../node_modules/.bin/tsx --tsconfig tsconfig.json /private/tmp/claude-501/-Users-yashdixit-Bow-Electronics-Portal/feb9f7e3-b430-4b85-98ff-c4bb5f20178a/scratchpad/probe1.mts` looked up AB-1, ab-1 and " AB-1 " and got part number, description, price 10.00 and "Open for quoting" (catalog.service.ts:71-78, part_number COLLATE NOCASE at db/migrations.ts:148), and AB/3 and AB?5 work when URL-encoded. A part number held in a numeric cell is stored as JavaScript's String(value) (erp-reader.ts:49), not as the ERP shows it. The ERP cell 1.10 was stored as "1.1", and looking up "1.10" returned 404 (probe1). The number 123 formatted "00000", which the ERP shows as 00123, loaded as "123" (probe3). A date in the description column loads as an ISO string ("2024-01-02T00:00:00.000Z", probe1 GH-3). The case-insensitive match covers ASCII only, so ÄB-1 and äb-1 differ in the store but are treated as duplicates by the reader. The tests (store-load.test.ts:52, :142) use only text part numbers. Whether the real ERP holds numeric or formatted part numbers is unknown until the definition-of-done run against the real file, which has not happened (no ERP owner).

### story-01-01#3-ca706188 — Given an ERP row that has no part number or no price, when the load completes, then the...

- **Verdict**: agree
- **Evidence** (or **Concern**): **Evidence**: The tests [story-01-01#3] at store-load.test.ts:75 and :161 pass (`npm test`: 100/100). In `cd apps/server && ../../node_modules/.bin/tsx --tsconfig tsconfig.json /private/tmp/claude-501/-Users-yashdixit-Bow-Electronics-Portal/feb9f7e3-b430-4b85-98ff-c4bb5f20178a/scratchpad/probe1.mts`, row 11 (no part number) was listed "no part number", row 12 (no price) "no price", row 27 (part number "  ") "no part number", and row 21 "no part number; no price", each with its row number (erp-reader.ts:141-152; catalog.service.ts:224-235). Error values, formulas, "$1,234.50", booleans and dates as prices were each listed with a reason, never loaded. The missing real-ERP run does not change this verdict: the rule depends only on the cell, not on the file's shape.

### story-01-01#4-5093fdb4 — Given two ERP rows with the same part number and different prices, when the load comple...

- **Verdict**: agree
- **Evidence** (or **Concern**): **Evidence**: In `cd apps/server && ../../node_modules/.bin/tsx --tsconfig tsconfig.json /private/tmp/claude-501/-Users-yashdixit-Bow-Electronics-Portal/feb9f7e3-b430-4b85-98ff-c4bb5f20178a/scratchpad/probe1.mts`, "CD-1" (price 1) and "cd-1 " (price 2) were both listed with the reason "duplicate part number", and neither loaded. Part numbers are compared with trim().toLowerCase() (erp-reader.ts:94-96, 166-170), and the reason is put first even when a row has other faults. The tests [story-01-01#4] at store-load.test.ts:92 and :188 pass. Not affected by the missing real-ERP run.

### story-01-01#5-a93537da — Given the load summary lists any row not loaded, when the summary is viewed, then it do...

- **Verdict**: agree
- **Evidence** (or **Concern**): **Evidence**: complete = run.complete===1 && rejected.length===0, and the status then reads "Load not complete: …" (catalog.service.ts:264-268). The page title comes from s.complete ("Not complete", LoadSummaryPage.tsx:66-69). `cd apps/server && ../../node_modules/.bin/tsx --tsconfig tsconfig.json /private/tmp/claude-501/-Users-yashdixit-Bow-Electronics-Portal/feb9f7e3-b430-4b85-98ff-c4bb5f20178a/scratchpad/probe1.mts` returned complete:false with the "Load not complete: 13 of 26 …" text. The tests [story-01-01#5] at store-load.test.ts:104 and :206 pass. The false "complete" in the multi-sheet case is recorded under criterion 1: there the summary lists no row as not loaded, so this criterion's condition is never met.

### story-01-02#1-939f4e12 — Given a named user adds a product with a part number, description and price, when they ...

- **Verdict**: agree
- **Evidence** (or **Concern**): **Evidence**: The route is POST /api/sales/store/products, which requires a price maintainer (catalog.controller.ts:56-60). The part number is trimmed by the schema (packages/shared/src/schemas.ts:6-10), a duplicate is refused case-insensitively (catalog.service.ts:104-109), and the product is found through findByPartNumber (catalog.service.ts:71-78). The tests [story-01-02#1] at store-products.test.ts:27 and :40 pass.

### story-01-02#2-5439c08c — Given a product priced at 10.00, when a named user changes the price to 12.00, then the...

- **Verdict**: agree
- **Evidence** (or **Concern**): **Evidence**: changePrice updates the price and inserts one price_change row in the same transaction: old_price, new_price, changed_by, changed_at (catalog.service.ts:121-147). priceHistory joins the user's name (catalog.service.ts:168-189). The product page shows Old price, New price, Who made the change, and Date and time in the business time zone (ProductPage.tsx:109-127, api.ts:62-69). A change to the same price is refused and adds no line. price_change is append-only by trigger (migrations.ts:183). The tests [story-01-02#2] at store-products.test.ts:53 and :68 pass.

### story-01-02#3-8d00a13c — Given a product whose price has been changed three times, when its price history is ope...

- **Verdict**: agree
- **Evidence** (or **Concern**): **Evidence**: The history is ordered by changed_at, then price_change_id (catalog.service.ts:180-181). The timestamps are ISO UTC from a single clock (adapters/clock.ts), so they sort as text. The test [story-01-02#3] at store-products.test.ts:76 passes. One small note: if the LocalClock offset were moved backwards, the order would follow the time stored, not the order the changes were made in. No epic-01 route moves the offset.

### story-01-03#1-43197407 — Given a product that is open for quoting, when a named user closes it for quoting, then...

- **Verdict**: agree
- **Evidence** (or **Concern**): **Evidence**: close sets open_for_quoting=0 and updates the search index in the same transaction (catalog.service.ts:151-165). view() maps the flag to "Closed" (catalog.service.ts:27), and the product page shows p.status in a badge (ProductPage.tsx:82-84). The route requires a price maintainer (catalog.controller.ts:68-72). The tests [story-01-03#1] at store-products.test.ts:116 and :130 pass.

### story-01-04#1-d242d801 — Given a rep who is not named to maintain prices, when they try to change a product's pr...

- **Verdict**: agree
- **Evidence** (or **Concern**): **Evidence**: The global guard checks rule.roles against roles read fresh from role_assignment on every request (access.guard.ts:86-89; access.service.ts:120-147). The change-price route declares 'price maintainer' (catalog.controller.ts:62-66). A refusal happens before the service runs, so the price cannot move. The test [story-01-04#1] at store-refusals.test.ts:30 passes. route-rules.test.ts:42 checks that every store-changing route requires a role.

### story-01-04#2-be030b5c — Given a rep who is not named to maintain prices, when they try to add a product or clos...

- **Verdict**: agree
- **Evidence** (or **Concern**): **Evidence**: Adding a product, closing one and running the ERP load all declare 'price maintainer' (catalog.controller.ts:56, 68, 80). The same guard refuses them (access.guard.ts:86-89). The test [story-01-04#2] at store-refusals.test.ts:37 passes, and store-load.test.ts:227 covers the load.

### story-01-04#3-4acf0d15 — Given a reseller user, when they try to open any page of the catalog and pricing store,...

- **Verdict**: disagree-with-evidence
- **Evidence** (or **Concern**): **Evidence**: The server refuses a reseller on /sales and /sales/* only when the path is exactly lower case: @Get(['sales','sales/*']) with the internal rule, and a public @Get('*') catch-all that serves index.html (apps/server/src/web/pages.ts:43-56). Fastify routes are case-sensitive. `cd apps/server && ../../node_modules/.bin/tsx --tsconfig tsconfig.json /private/tmp/claude-501/-Users-yashdixit-Bow-Electronics-Portal/feb9f7e3-b430-4b85-98ff-c4bb5f20178a/scratchpad/probe2.mts`, signed in as reseller Casey, got 403 for /sales/store but HTTP 200 with the app's index.html for /SALES/store and /Sales/Store/products/1, and recorded no refusal for either. The browser router matches paths without regard to case: react-router 7.18.4 matchRoutes maps "/SALES/store" to "/sales/store" and "/Sales/Store/products/1" to "/sales/store/products/:id" (`node /private/tmp/claude-501/-Users-yashdixit-Bow-Electronics-Portal/feb9f7e3-b430-4b85-98ff-c4bb5f20178a/scratchpad/rr.mjs`). InternalOnly checks only that someone is signed in, not their kind (apps/web/src/components/Layout.tsx:60-72). So the reseller sees the store page itself: its title, the "Add a product" and load-summary links, and the search form. Only its data calls are refused (403 on /api/sales/store/*, which is recorded). No price data leaks, but a reseller opens a store page and the server-side page refusal this criterion relies on is bypassed. The test at store-refusals.test.ts:48 tries only lower-case paths. A fix would match the /sales routes case-insensitively (or refuse any path whose lower-case form starts with /sales) and make InternalOnly require kind === 'internal'.

### story-01-04#4-99a133ea — Given a reseller user was refused a store page, when the record of refused attempts is ...

- **Verdict**: agree
- **Evidence** (or **Concern**): **Evidence**: The refused_attempt table has user_kind, user_id, user_label, action and at (migrations.ts:123-131), and it is append-only. A refused page is recorded as "open page <path>" (access.guard.ts:78-84). `cd apps/server && ../../node_modules/.bin/tsx --tsconfig tsconfig.json /private/tmp/claude-501/-Users-yashdixit-Bow-Electronics-Portal/feb9f7e3-b430-4b85-98ff-c4bb5f20178a/scratchpad/probe2.mts` showed rows such as {user_label: "Casey (Reseller A, buyer)", action: "open page /sales/store", at: "2026-09-26T20:32:12.753Z"}. An internal admin reads it at GET /api/sales/refused-attempts (access.controller.ts:86-90). The tests [story-01-04#4] at store-refusals.test.ts:73 and :88 pass. In the case-bypass under criterion 3, the page opening itself is not recorded, but each of its refused data calls is, with the user, the action and the time.

### story-01-04#5-59d54900 — Given a rep who is not named, when they send a price change directly without using the ...

- **Verdict**: agree
- **Evidence** (or **Concern**): **Evidence**: Authorisation happens only in the server guard, on every call (access.guard.ts:52-91). A non-safe method also needs the session's anti-forgery token (access.guard.ts:68-73). No other route changes a price: the only controllers are access, catalog, pages and the dev sign-in (app.ts:58-59; dev/dev.module.ts). The test [story-01-04#5] at store-refusals.test.ts:94 passes. My probe paths /api/SALES/…, /API/… and //api/… return 404 or the app shell, never data or a change.

### story-01-05#1-98851829 — Given Jensen Huang names rep Pat to maintain prices, when Pat is recorded as named, the...

- **Verdict**: agree
- **Evidence** (or **Concern**): **Evidence**: Naming is POST /api/sales/named-users, which requires a role manager (access.controller.ts:67-73; named-users.service.ts:40-75). Roles are read fresh on the next request (access.service.ts:139-147). The test [story-01-05#1] at named-users.test.ts:35 passes, with Sam named, since Pat is seeded as a price maintainer. The seeded role manager is "Morgan", a stand-in for Jensen Huang (seed/people.ts:4-7, 44-49).

### story-01-05#2-e9ee8fdc — Given Pat is no longer named to maintain prices, when Pat tries to change a price, then...

- **Verdict**: agree
- **Evidence** (or **Concern**): **Evidence**: Removal sets revoked_at (named-users.service.ts:77-86). rolesOf keeps only rows where revoked_at is null (access.service.ts:139-147), and it runs on every request, so an open session loses the role on its next call. The test [story-01-05#2] at named-users.test.ts:46 passes, "even from a page already open".

### story-01-05#3-21e37313 — Given Jensen Huang names rep Lee to set discounts, when Lee is recorded as named, then ...

- **Verdict**: agree
- **Evidence** (or **Concern**): **Evidence**: POST /api/sales/resellers/:id/standard-discount requires a discount setter (catalog.controller.ts:107-111; discount.service.ts:35-65). This is the minimal set action, as the FDE decided. The test [story-01-05#3] at named-users.test.ts:59 passes.

### story-01-05#4-261e4cb3 — Given Lee is no longer named to set discounts, when Lee tries to change a standard disc...

- **Verdict**: agree
- **Evidence** (or **Concern**): **Evidence**: The same revocation path applies, and the guard refuses before DiscountService runs (access.guard.ts:86-89). The test [story-01-05#4] at named-users.test.ts:72 passes, and named-users.test.ts:82 shows the two lists are separate.

### story-01-05#5-e9b96b4f — Given a rep who is not named for either, when they try to change who is named, then it ...

- **Verdict**: agree
- **Evidence** (or **Concern**): **Evidence**: Both POST and DELETE on /api/sales/named-users require a role manager (access.controller.ts:67-84). "role manager" is not a role anyone can be named to, since NAMEABLE_ROLES is only price maintainer and discount setter (packages/shared/src/roles.ts:6), so nobody can escalate. The tests [story-01-05#5] at named-users.test.ts:92 and :105 pass.
