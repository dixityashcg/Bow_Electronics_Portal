# Critique — Bow Electronics Reseller Portal

**Status**: Final for the gate, revision 2 · **Prepared by**: Yash Dixit (reviewing persona) · **For**: the g3-architecture decision

## 1. What was challenged

**Under critique:** revision 2 of `artifacts/architecture.md`, `artifacts/decisions.md` (ADR-01 to ADR-13) and `artifacts/demo-topology.md`, reworked after Yash Dixit (FDE) rejected revision 1 at g3 on 2026-09-26. The rework was checked against:
- the rejection comments;
- the EA's local-first direction relayed the same day;
- the approved BRD and backlog.

**Reviewer.** A differently composed persona: a sceptical delivery lead and security tester who also knows Business Central and Azure. It ran on a **second model** (Claude Sonnet; the author was Claude Opus). The model and the persona were diversified. It had read-only access.

**Lenses:** pre-mortem, red-team and a Socratic consistency check, as in revision 1. All four reconciliation checks were then run over the **whole** artifact set.

**The author's own check.** The author then checked the critique's factual claims against Microsoft's ledger documentation, which found a defect the reviewer had not (§2, finding 0).

Revision 1's critique and its eight decided questions are superseded by this record. Their decisions stand, and are carried in architecture §11 (Q-01 to Q-08).

## 2. Where it is weakest

Ranked. Each finding shows what was done about it.

0. **A full-text index on a ledger table cannot be built** (found by the author while verifying finding 1). Microsoft's *Ledger considerations and limitations* page states: "Ledger tables can't have full-text indexes." Revision 2 made `product` an updatable ledger table **and** gave its description a full-text index, which would have failed at the first Stage 2 migration. The SQLite stand-in would never have shown it. *Fixed:* search reads a separate ordinary `product_search` table, written in the same transaction as `product` and checked against it by a contract test (architecture §5.1, §5.6; ADR-09 revised). **Lesson:** the dual-engine design needs its SQL Server contract tests from the first story, not from Stage 2, and ADR-12 already runs them in CI on every pull request.
1. **The database tier was stated two ways, and the stated one might not carry ledger** (consistency; severe). ADR-02 said General Purpose, left over from revision 1. §4.3, §4.4 and §10.3 said DTU Standard S2. Microsoft documents ledger with vCore tiers, and support on S2 could not be confirmed. *Decided by the FDE:* **General Purpose serverless**, which is documented. ADR-02, §4.3, §4.4, §10.2 and §10.3 were made consistent. The cost rises accordingly.
2. **Two database engines will drift** (pre-mortem). An administrator fix, a restore or a concurrency race could behave differently in production from how every Epic Review showed it. *Carried with a mitigation:* the SQL Server contract tests in CI on every pull request (ADR-12), and §5.6 states which guarantees only Azure proves. **Residual:** CI's SQL Server 2022 container is not Azure SQL itself. Tier-specific behaviour is proved only in Stage 2, which has no date (self-assessment, weakest point 2).
3. **Node 24 replaced the EA's Node 20 before the gate** (red-team). This is defensible, since Node 20 is end-of-life, but it is built into the design ahead of Elon Musk's confirmation. *Carried:* architecture Q-10 and the deliberation record's open questions put it to Elon Musk. If he refuses it, the change is confined to the runtime row in §4.3, the CI matrix and `dev.sh`'s version check.
4. **The cost arithmetic did not add up, and one unit price was low** (consistency). The rows summed to US$254–331 against a stated total of 290–340, and P0v3 was about half its likely price. *Fixed:* the rows were re-priced (P0v3 ≈ US$140 per instance; General Purpose serverless ≈ US$200–330), and the total now equals the sum of its rows (≈ US$540–710). The two unit prices from secondary sources are marked unverified.
5. **Cost was committed against an uncommitted target** (red-team). The second instance and the availability tests exist for N-05, which Jensen Huang has not committed to. *Decided by the FDE:* keep them in the total. They are now marked as N-05 lines, so dropping N-05 visibly saves about US$150.
6. **The Stage 2 table named Elon Musk as the owner of steps the Microsoft 365 administrator performs** (referent consistency). *Fixed:* `demo-topology.md` now states who owns each step and who performs it.

**Expected, and not a defect.** `raise env check` reports `scripts/dev.sh` and `scripts/reset.sh` missing. They are part of epic-01's walking skeleton, and this phase may not write code. They exist from the first build.

## 3. What survives the challenge

- **Every rejection item is delivered:**
  - capability-to-system-of-record map (§2.3);
  - build-versus-buy with Business Central, story by story (§2.4);
  - three candidates compared (§2.5);
  - C4 context, container and deployment views (§2.2, §4.1, §4.4);
  - data model (§5.1) and request-to-quote sequence (§5.5);
  - versioned stack (§4.3);
  - cost by service (§10.3);
  - RTO and RPO (§7.3);
  - CI/CD and environments (§4.5, §4.6).
- **Every EA direction item is delivered:**
  - one-command start and reset;
  - development sign-in behind the real interface;
  - an npm-only database, with its differences stated;
  - a local mailbox;
  - a fictional sample price list and seed;
  - adapters recorded as ADR-13;
  - an all-local demo topology.
- The start-up guard is treated as security code, with its own QA (T-23).
- The operator's limits hold. Stock stays out (C-04). No change request is raised. Business Central is recorded as considered (ADR-11), not adopted.
- The seed's roles match the backlog's demo-notes: Pat is the price maintainer and Lee the discount setter, consistently across the backlog, architecture §4.8 and `demo-topology.md`.

## 4. Open questions for the decider

Put to Yash Dixit (FDE) in this session on 2026-09-26, each with a recommended answer:

| # | Question | Recommended | Decided |
|---|---|---|---|
| 1 | Local runtime: the EA said Node 20, which reached end-of-life in April 2026 | Node 24 LTS | As recommended (Q-10); Elon Musk to confirm |
| 2 | Real-ERP definition-of-done runs (story-01-01, story-02-02) against a synthetic-only demo | Demo synthetic; real run locally when the file arrives | As recommended (Q-11) |
| 3 | Database tier for ledger | DTU S2, proved first in Stage 2 | **General Purpose now** (the FDE's own choice) |
| 4 | N-05-dependent cost lines | Mark as conditional | **Keep in the total** (the FDE's own choice); the lines are still labelled as N-05 lines |

**Still for the gate** (Elon Musk and Jensen Huang):
- confirm Node 24 against his wording;
- confirm the database tier and the re-priced total;
- confirm the region (NF-07), which is still open;
- ratify or refuse R-01 to R-06;
- hear the FDE's reason for TypeScript;
- confirm N-05;
- agree the rounding rule before story-04-02 is built, because a wrong rule is written permanently into append-only quote lines.

## 5. Reconciliation

Run on the whole artifact set after the rework.

| Check | Result | Where |
|---|---|---|
| Referent existence — every "defined in …" claim resolves to a definition | Every §, ADR, Q, T, R, N and C reference sampled resolves. One attribution mismatch: Stage 2 owners versus the performer named in Q-06. Fixed | demo-topology.md, Stage 2 table |
| Reverse traceability — no component, table or endpoint that no story demands | Clean. New components (adapters, `/dev` pages, scripts, seed, `product_search`, SQLite triggers, pipeline, Key Vault, digest storage) each trace in architecture §9.2 to a story, a constraint (C-13) or a threat. The N-05 cost lines trace to a target not yet client-committed, and are labelled so | architecture §9.2, §10.3 |
| Cross-artifact synthesis — assessment constraints re-joined to every new operational claim | C-13 is joined across §4.7, §4.8, §5.6, ADR-13 and the topology. C-05's performer now matches the topology. Microsoft's ledger limits were re-joined to the data model, which found finding 0 | architecture §5.1; ADR-09 |
| Internal consistency — decision prose against the data model and the component table | Failed on the database tier (finding 1) and on the cost total (finding 4). Both fixed. The price maintainer and discount setter identities are consistent | ADR-02; architecture §4.3, §4.4, §10.3 |
