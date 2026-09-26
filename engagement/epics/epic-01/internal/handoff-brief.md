# Hand-off brief — epic-01, Build → QA

**From**: the build context · **To**: the QA context (separate) · **Date**: 2026-09-26 · **At**: 762f093

This says what was decided, what remains open, and the rounds that got here. It does not argue that the code is right: that is QA's to test.

## Decided during the build (Yash Dixit, FDE, 2026-09-26)

- story-01-05 c3/c4 are proved with a minimal set-standard-discount action and its history. The full resellers page is epic-04 (story-04-01).
- Two ERP rows with the same part number are both refused, whatever the prices, and whatever the case or spacing.
- A price held as text is loaded when it is a plain decimal (`12.50`).
- SQL Server contract tests and the CI pipeline are deferred to Stage 2.
- The ERP load refuses what *Add a product* refuses: a blank description, or a part number over 64 characters (provisional limit). This was critique Q2.
- epic-01 goes to the Epic Review with story-01-01 recorded as not done. Elon Musk names the ERP owner before epic-02's build starts. This was critique Q3.

## Open

- **Change requests cr-01, cr-02 and cr-03** (check-only load, reconciliation report, who and when for add, close and reopen). Raised, not accepted, not built.
- **The run against the real ERP** (story-01-01 DoD), and the column mapping agreed with an ERP owner, who is not yet named.
- **Bow's business time zone** (architecture Q-03). Times show in UTC.
- **A browser.** No build or review context clicked through the screens.
- **N-3's fix at 762f093** was verified only by the build's own probe.

## Rounds

| Round | Outcome | What moved |
|---|---|---|
| 1 | continue | Senior review: R-1 required (the other worksheets were ignored), R-2 to R-12 non-blocking. Adversarial: one disagree-with-evidence (page spellings, story-01-04 c3), two disagree-with-concern (story-01-01 c1, c2). Fixed at 2ce51fe |
| 2 | continue | N-1, N-2 and the residuals of R-8 and R-12; the adversarial reviewer's A-1 and A-2. Fixed at 95974a6 |
| 3 | resolved | N-3, a regression from N-2's fix, fixed at 762f093; the FDE's Q2 ruling built. No required change open. Adversarial: 19 agree |

The machine-run checks: 19 of 19 passed at 762f093. `raise dod verify` found 2 of 19 checks noticing three random mutations; with eight mutations, story-01-04#1 noticed one. The build's plausible-wrong probes (duplicates refused only when prices differ; roles cached at first read; blank part-number rows skipped) were each caught by exactly the tests owning that criterion.
