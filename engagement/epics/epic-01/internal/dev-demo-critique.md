# Critique — Bow Electronics Reseller Portal

**Status**: Draft · **Prepared by**: Yash Dixit (reviewing persona) · **For**: the gate decision

<!--
  A systematic attack on the plan under decision, written by a differently
  composed persona than the one that produced it — before the gate, not after.
  The human still decides; they decide having seen the plan challenged. An
  empty critique is a result ("challenged on these axes, found nothing"), never
  a blank.
-->

## 1. What was challenged

**Subject.** epic-01, the catalog and pricing store, as the records present it for the Epic Review:
- `artifacts/demo-record.md`
- `internal/review-record.md`, rounds 1 and 2
- `artifacts/dod.md` and `artifacts/ac-verification.md`
- `assessments/adversarial-review.md`, including the three re-verdicts added at 2ce51fe

They were read against:
- backlog epic-01 (objective, demo-notes, story-01-01 to story-01-05)
- BRD BR-17, BR-18, BR-20, NF-01, NF-03 and NF-10
- architecture §2.3, §4.7–§4.8, T-14, T-15, §10.4 runbook 2 (the go-live load), Q-03 and Q-11
- the engagement briefing

Code was read only to test a claim: the catalog routes, the load in `catalog.service.ts`, `erp-reader.ts`, the shared schemas and the upload limit.

**Lens.** This is a **pre-mortem**, written for Jensen Huang (Product Owner, accountable for Bow's prices) and for the people who will run the go-live load. The question it starts from: *it is three months after go-live and epic-01 is judged to have failed; what happened?* It is paired with a **Socratic** challenge of what the records claim. It is not a code review. The question is whether the plan and its evidence would carry a real ERP load and a real sign-off, not whether the code is well made.

## 2. Where it is weakest

Ranked by the cost if it happens.

**1. The go-live load gets one attempt, and nothing turns "Load not complete" into complete (R-6, T-15).**
- *What fails.* The load writes every good row. Once any product is in the store, T-15 refuses every later load. Any row the load did not take leaves the summary at "Load not complete" for good. The only way to get a missing row into the store is *Add a product* by hand, and that does not change the summary. Production has no equivalent of `reset.sh`, so emptying the store means database work. A product added before the live load, for example by someone trying the screen in production, blocks the load completely (review record §5, last risk). The runbook does not say the load must come first.
- *Under what conditions.* Any bad row in the real ERP, which T-14 itself rates "Likely". Or any product in the store before the load.
- *Cost.* The purpose in story-01-01's "so that" cannot be reached: *I can sign off that the store is complete before the ERP is frozen*. Jensen either signs a page that says "not complete", which makes the sign-off meaningless, or go-live slips. A mistake in the mapping found after sign-off is worse. Examples are a wrong column, or prices held per 100. There is no re-load and no bulk correction. Fixing it means one on-screen price change per product, and each one enters the price history as if a maintainer had chosen it. The demo hides this. The backlog narrative says "every product in the ERP spreadsheet arrived". The demo's step 1 ends on "Load not complete: 8 of 2008", and no step shows how that becomes complete.

**2. The load was built and passed against a file the team made, not against the ERP (story-01-01, Q-11, NF-03).**
- *What fails.* The column mapping is three headings taken from the synthetic sample.
- *The ERP owner has not been named.* NF-03 needed one "before architecture"; architecture has passed and there is still none.
- *Two adversarial concerns are still open after round 2, at 2ce51fe:*
  - A second table beside the first on the same sheet loads silently incomplete while the summary reports "complete".
  - Numeric part-number cells in any format other than `0.00` or `00000` load differently from what the ERP shows. The R-A2 fix made date cells worse: a date in the description column now loads as a server-local string showing the wrong day.
- *Columns nobody decided about.* The real ERP may hold columns that change what the price means: unit of measure (per unit, per 100, per reel), currency, price breaks, or an obsolete/discontinued flag. The load drops them, and no record shows that anyone decided to drop them.
- *Obsolete parts.* Every loaded product is set Open for quoting, as approved. If the ERP marks obsolete parts, they become quotable at go-live.
- *Under what conditions.* The real ERP differs from the sample in layout or in meaning.
- *Cost.* T-14 names it: "every quote from go-live carries a wrong price, and nobody knows which". Q-11 schedules the real-file run for "once the ERP owner supplies it", with no date. If that first run happens close to go-live, every problem above is found on the day, and objection 1 allows only one attempt.

**3. The sign-off check cannot catch the failures in objection 2 (runbook 2, T-14).**
- *What fails.* The only human check of the load's content is the ERP owner comparing 20 random products. At the architecture's sizing of 250,000 products (§7.1):
  - If 1 % of rows are wrong, 20 random picks find one about 18 % of the time.
  - If 0.5 % are wrong, about 10 % of the time.
- The defects that matter most hit one class of rows: numeric part numbers, one formatted column, a group priced per 100. A small random sample is least likely to catch exactly those. The count identity does not help either, because a misread row still counts as "loaded".
- *Cost.* Wrong prices go out on quotes without anyone noticing. Under NF-01 the ERP becomes read-only reference that nobody compares against.

**4. Accountability stops at price changes (BR-17, story-01-04's "so that", R-10).**
- *What is recorded.* A price change records who made it and when. Adding a product records neither, so every hand-added product's first price has no author (demo record, *Known gaps*). Closing a product records neither (R-10).
- *What cannot be undone.* There is no screen to reopen a closed product, so a mistaken close is permanent short of database work. There is also no screen to edit a description or a part number, so a blank or date-mangled description from the ERP stays for good.
- *Where it bites.* The products most likely to be added by hand are the disputed ones. story-01-01 c4 refuses both copies of a duplicate part number. So someone types in a price the ERP itself contradicted, and the store records nobody as having chosen it.
- *Cost.* Jensen's rule, "a price cannot move without someone accountable for it", holds for changes but not for the first price of any hand-added product. BR-17's "unmet if" is met only if "price change" is read narrowly.

**5. The ERP and the add-product screen apply different rules to the same catalog (R-4).**
- *What fails.* The ERP path loads a blank description and part numbers over 64 characters. The add-product screen refuses both.
- A loaded product with no description can never be found by description words (BR-04), and with no edit screen nobody can fix it.
- Whether later Epics validate quote lines with the same shared schema, and so refuse a product the store holds, is **unchecked**.
- *Cost.* Moderate on its own. But it cannot be decided separately from R-6. Tightening the ERP rule to match the screen turns these rows into "not loaded" rows, and objection 1 makes those permanent.

**6. The freeze window and the load on the day (runbook 2, NF-01).**
- *The freeze window.* Runbook 2 has the owner supply the frozen file, the load run, the sign-off, and only then the ERP set read-only. Between the copy and the read-only step, the ERP can still be edited, and reps may still price phone quotes from it. Any such edit is lost without anyone knowing.
- *Untested at full size.* A full-size load has never been run: 250,000 rows, one upload (capped at 25 MB) and one transaction on Azure SQL. T-15 under simultaneous loads is untested on SQL Server, because SQLite serialises writers (review record §2).
- *Cost.* A failure on go-live day, found by the person running the load, with objection 1's single attempt.

**7. The records disagree with each other (Socratic; these are for the build to fix, not questions).**
- *Stale commit.* `ac-verification.md` cites every pass "at c71983d". The demo record says "100 Vitest tests … all 19 passed at c71983d". But R-1, R-2, R-A2 and R-3 landed at 2ce51fe, with 106 tests, and the recorded DoD run is dc70c0e. The Review would read evidence from a commit before the fixes that evidence relies on.
- *The demo record's criteria table claims steps the script does not contain:*
  - step 3 "repeated twice more" (story-01-02 c3)
  - Sam named by Morgan (story-01-05 c1)
  - Sam refused add and close in step 9 (story-01-04 c2)
- *story-01-01 reads as done.* `ac-verification.md` marks story-01-01 #1 and #2 `pass`. Meanwhile the adversarial reviewer still holds disagree-with-concern on both after round 2, and the DoD says the story is not done. Someone skimming the matrix sees 19 of 19 green.
- *No browser run.* The demo has never been clicked through in a browser, and nothing has been captured.
- *Cost.* Low on its own. High if the gate reads "19/19 pass" as "the ERP load is ready".

## 3. What survives the challenge

- **Authorisation.**
  - Deny by default on the server.
  - Roles read fresh on every call, so removing Pat takes effect on a page Pat already has open (story-01-05 c2).
  - A direct call to the interface is refused (story-01-04 c5).
  - Refusals are recorded, including those for a missing anti-forgery token (R-3).
  - The page-path bypass by case and encoding was found, fixed and re-verified by the adversarial reviewer (re-verdict agree at 2ce51fe). Both readers agree.
- **Price history.**
  - Written in the same transaction as the price change.
  - Append-only, enforced by the database.
  - Shown oldest first.
  - This is what Jensen asked for, and it holds.
- **Refusing bad prices (T-14).** Every bad value in the threat list is refused with a reason:
  - `$12`, `1,234.50`, `#REF!`, a formula, a blank, zero, a negative.
  - The duplicate rule is strict: both rows are refused, including variants that differ only in case or spacing.
  - The adversarial reviewer agrees with c3 and c4 whatever the file's shape.
- **The count identity, with more than one worksheet refused.** Round 1 found the obvious silent-loss route: products on a second sheet. It is closed, and the fix refuses the whole workbook rather than guessing.
- **T-15 in principle.** Protecting prices maintained after go-live from a stale ERP overwrite is right. Objection 1 is that T-15 is the only way through the load, not that it exists.
- **The records are candid about the gaps.** The demo record's *Known gaps*, the DoD's "not machine-checked" section and the review record's §2 plainly name the missing real-ERP run, the SQL Server gap and the browser gap. The build does not claim story-01-01 is done.
- **The check harness.** Tests are counted by tag, so a misspelled tag or a deleted test fails a check instead of passing it silently.

## 4. Open questions for the decider

**Q1. How does the go-live load reach a state Jensen can sign as complete?** *(the review's R-6, taken as proposed)*
- **(a) The question.** T-15 allows one load, and any row not loaded leaves the summary at "Load not complete" for good. What does Jensen sign, and how is it reached?
- **(b) Recommended.** Keep T-15 for the live store. Add a **check-only run** of the load: it reads the file and produces the same summary, but writes nothing. The ERP owner corrects the ERP, not the store, and repeats the check until it reads complete, or until Jensen has accepted in writing each remaining row as "not carried into the store". Only then is the real load run, once. Jensen signs that summary together with the written exceptions. Three alternatives are rejected:
  - Signing an incomplete summary: the sign-off stops meaning anything.
  - "Top-up" loads of missing part numbers: they reopen T-15's overwrite risk through a side door.
  - Relaxing T-15: the threat it answers is real.
- **(c) Change it implies.**
  - A change request adding a criterion to story-01-01: a check-only run writes nothing and shows the same summary.
  - Runbook 2 rewritten:
    - check-only rehearsals against the real copy, well before go-live;
    - no product added before the live load;
    - the ERP set read-only when the frozen copy is taken, not after the sign-off.
  - The demo's step 1 becomes a check-only run of the sample (8 not loaded) followed by a live load of a corrected file that reads complete.
  - R-6 moves from "accepted with reservations" to this decision in the review record.

**Q2. When the ERP holds a product the add-product screen would refuse, whose rule applies?** *(the review's R-4, kept, but decided together with Q1)*
- **(a) The question.** The ERP path loads a blank description and part numbers over 64 characters. The add-product screen refuses both. Which rule is Bow's?
- **(b) Recommended.**
  - One rule for both paths.
  - Description required, as the screen has it. A product nobody can find by words, with no screen to fix it, should not enter the store.
  - The part-number limit set from the longest part number in the real ERP, not left at 64.
  - ERP rows that break the rule are listed "not loaded" with the reason, and corrected in the ERP during Q1's check-only runs.
  - This is recommended **only together with Q1**. Without a check-only run, a stricter rule just produces more permanent "not loaded" rows. If Jensen accepts the ERP's looser data instead, the screen's rules loosen to match, and a story to edit a description is raised.
- **(c) Change it implies.**
  - The reader gains two reasons, "no description" and "part number too long", tested under story-01-01 c3.
  - The limit is recorded in the column mapping agreed with the ERP owner.
  - R-4 is closed in the review record.

**Q3. Is epic-01 accepted with story-01-01 still open, and by when does the real ERP arrive?**
- **(a) The question.** Every risk in the load rests on an ERP owner who has not been named and a real-file run that has no date. Will Jensen and Elon Musk accept epic-01 at the Epic Review on those terms? And by what date are the owner named and the first real-file run held?
- **(b) Recommended.**
  - Accept story-01-02 to story-01-05 at the Review, and record story-01-01 as not done.
  - Elon Musk names the ERP owner before epic-02's build starts. story-02-02 has the same dependency on real data.
  - The first check-only run against the real copy happens within two weeks of the naming.
  - The column mapping kept with the story lists **every** column in the real ERP and what happens to it, mapped or deliberately ignored, and the owner signs it. That covers any unit, currency, price-break or obsolete column, so nobody learns after go-live that prices were per 100 or that obsolete parts came back open for quoting.
- **(c) Change it implies.**
  - The gate decision records story-01-01 as open, with an owner and a date.
  - Rows #1 and #2 in `ac-verification.md` say they pass on the synthetic sample only and that the story is not done.
  - Architecture Q-11 gets a date.
  - A column-disposition table is added alongside `erp-mapping.ts`.

**Q4. Is a 20-product comparison enough for Jensen to sign that the store holds the ERP?**
- **(a) The question.** Runbook 2's only check of content is the owner comparing 20 random products. Is that the confidence Jensen accepts before the ERP is frozen?
- **(b) Recommended.** No. Jensen signs a **full reconciliation**: every ERP row matched by machine to the store on part number, description and price, with any difference listed. The owner's 20-product comparison stays as a human cross-check. Twenty random picks find a defect in 1 % of 250,000 rows about 18 % of the time, and they are weakest against exactly the defects that hit one class of rows.
- **(c) Change it implies.**
  - A change request for a reconciliation report: store against ERP file. The check-only run in Q1 can produce it.
  - The T-14 mitigation and runbook 2 name that report as the thing signed.
  - story-01-01's definition-of-done run uses it.

**Q5. Does "a price cannot move without someone accountable" cover a product's first price, and its closing?**
- **(a) The question.**
  - Adding a product records no who or when, so its first price has no author.
  - Closing records no who or when (R-10).
  - A mistaken close cannot be undone.
  - Does BR-17 and story-01-04's intent cover these?
- **(b) Recommended.**
  - Record who and when for adding a product, as a first price-history line from none to the price.
  - Record who and when for closing.
  - Show the load run's operator (already stored as `run_by`) against each loaded price.
  - Add a recorded reopen action for price maintainers.
  - This is cheap now and cannot be rebuilt after go-live. It matters most for the duplicates c4 refuses, which are exactly the contested prices someone will type in by hand.
- **(c) Change it implies.**
  - Architecture §5.1 gains who and when for adding a product, and a history of closing with who and when.
  - A change request adds these clauses to story-01-02 c1 and story-01-03 c1, plus a reopen criterion (in epic-01, or in epic-02 beside search).
  - R-10 is closed by the decision.

## 5. Reconciliation (revisions only)

This is a first pass, not a revision, so the reconciliation checks do not apply.

| Check | Result | Where |
|---|---|---|
| Referent existence — every "defined in …" claim resolves to a definition | not applicable — first pass | — |
| Reverse traceability — no component, table or endpoint that no story demands | not applicable — first pass | — |
| Cross-artifact synthesis — assessment constraints re-joined to every new operational claim | not applicable — first pass | — |
| Internal consistency — decision prose against the data model and the component table | not applicable — first pass | — |
