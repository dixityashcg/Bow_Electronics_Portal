# Defect Log — epic-01: The catalog and pricing store replaces the Excel ERP

**Raised by**: independent QA agents · **Overseen by**: Yash Dixit

**Build under test**: commit `762f093` (review round 3 fixes). The repository was at `c7e3524`, and no file under `apps/`, `packages/`, `scripts/` or `seed/` has changed since `762f093`. **Tested**: 2026-09-26.

## Open defects

**None.** 55 designed cases were executed against the running portal, and no case failed because the code behaved wrongly against an approved criterion, a committed non-functional target, or a stated security expectation.

One case, TC-28, did not pass. Its outcome depends on what story-01-01 #2's "match" means, so it is recorded as blocked by a criterion question (CQ-01), not as a defect. Filing it here would send the build team to change code that was never specified.

A clean log is a result about the cases that were run. It is not a claim about what was not run. See the QA report, "Not tested, and why": no browser was available, the real ERP file has not been supplied, and the Stage 2 adapters are not built.

---

## Criterion questions

Where the criterion, not the code, looks wrong or silent, the question is not a defect and does not go to the build team. Three such questions came out of this run (CQ-01 to CQ-03). Each is in its own artifact with the answer QA recommends, for the operator to answer.

See `criterion-questions.md`.

## Closed defects

| # | Severity | Summary | Fixed in build | Re-tested |
|---|---|---|---|---|
| — | — | No defect was raised in this run | — | — |
