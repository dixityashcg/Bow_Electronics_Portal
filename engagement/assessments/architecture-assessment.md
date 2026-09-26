# Self-assessment — Solution Architecture

<!--
  Internal working evidence. This does NOT go to the client, and its content
  must not appear in the deliverable.

  The criteria below are generated from the phase's rubric — the same rubric
  the operator reviews at the gate. Do not add, remove, or reword them here.
  An assessment that could restate its own criteria would be a second copy of
  them, and the two would drift within a release.

  Every criterion needs a verdict. Write one of:

    Pass    — the deliverable meets it, and you can say where
    Fail    — it does not; name the exact section, row, or id that fails
    N/A     — it does not apply, with the reason

  A blank cell, or one reading "partially" or "see below", is not a verdict.
  `raise phase complete` refuses the phase until every criterion carries one,
  because an unreadable verdict read as a pass is the failure this file exists
  to prevent.
-->

**Rubric**: `architecture` · **Deliverable**: architecture

| Criterion | Verdict | Where it fails, or why not applicable |
|---|---|---|
| `requirements-traced` (**blocking**) | Pass | architecture §9.1 maps BR-01–BR-20 and NF-01–NF-10 to components or a stated deferral. §9.2 maps every component back, including those new in revision 2: the adapters, start-up guard and `/dev` pages (C-13), `dev.sh`/`reset.sh` and the seed (C-13, demo-notes), SQLite migrations and triggers (§5.6), Key Vault, the digest storage, the pipeline (T-22) and the Stage 2 test environment. |
| `decisions-carry-alternatives` (**blocking**) | Pass | ADR-01 to ADR-13 each list rejected alternatives with the eliminating constraint. ADR-01 and ADR-11 reject Business Central on C-12 with the story criteria it cannot meet. ADR-13 rejects SQL Server in a container (no Docker) and PGlite. Weakest: ADR-10's C# alternative, eliminated by the FDE's decision with the reason still to be stated at the gate. |
| `decisions-carry-consequences` (**blocking**) | Pass | Each ADR states costs. ADR-13: Epic Reviews prove the portal's behaviour, not Microsoft's; two migration sets to keep in step. ADR-11: Bow gets a store, not an ERP. ADR-12: a GitHub organisation to own, slower CI. |
| `decisions-have-revisit-conditions` (**blocking**) | Pass | Every ADR, including ADR-11 to ADR-13, has a Revisit when. |
| `trust-boundaries-drawn` (**blocking**) | Pass | §8.1 B1–B9 (B9 widened to pipeline rights); three boundaries inside the system; §5.4 data classes. |
| `threats-name-consequences` (**blocking**) | Pass | §8.2 T-01–T-23 name data and party. New: T-22 (a merged change leaks prices), T-23 (the pick-a-user sign-in reaching production lets anyone act as any rep). |
| `accepted-risks-owned` (**blocking**) | Pass | §8.3 R-01–R-06: provisionally accepted by Yash Dixit (FDE) 2026-09-26, confirmed in session; Elon Musk to ratify. |
| `mitigations-are-testable` (**blocking**) | Pass | Every §8.2 row has a QA attempt. The start-up guard is tested by starting with each bad configuration (§4.7). The §5.6 rules state which are tested locally, which in CI on SQL Server, and which in Stage 2. |
| `nonfunctional-targets-are-numbers` (**blocking**) | Pass | §7.2 N-01–N-15 with numbers and methods (N-13 recorded as not committed). §7.3 gives RTO and RPO per scenario, each with a verification. N-01 speed is proved only in Stage 2, and §5.6 says so. |
| `existing-system-constraints-carried` (**blocking**) | N/A | Greenfield. The baseline's constraints are carried as C-01, C-02, C-05 and C-10, plus the EA's local-first direction as C-13. |
| `summary-readable-cold` (advisory) | Pass | §1 names the approach, the candidates compared, two delivery stages, the five key decisions, running cost (≈US$290–340 a month plus partner), recovery, and what it does not attempt. Weakness: the document is now long (C4 views, tech stack), which is what the EA asked for but is heavier for the business sponsor. |
| `buildable-in-slices` (advisory) | Pass | §9.3: epic-01 carries the local walking skeleton alone; no Epic needs Azure; epic-02 adds two stand-ins; later Epics add screens and module code. For the FDE to judge. |
| `operable-by-this-client` (advisory) | Fail | Unchanged in substance. Production still rests on a support partner not yet contracted, who now needs Azure and TypeScript skills, and the partner is a precondition, not a blocker. Revision 2 adds that Stage 2 (Azure, the real adapters and the checks only it can prove) must still happen before go-live, and nobody has put a date on it. Two database engines also mean two migration sets for the partner to understand. The EA judges. |
| `decisions-worth-recording` (advisory) | Pass | ADR-11 (store versus Business Central), ADR-12 (pipeline) and ADR-13 (adapters and stages) are each expensive to reverse. Money held as whole numbers (§5.2) is recorded in §5.2 and ADR-13 rather than as its own record. For the FDE to judge whether that deserves an ADR. |

## What to check for each criterion

- `requirements-traced` — every approved requirement appears against a component or a stated deferral, and no component exists that traces to no requirement (§9 Traceability)
- `decisions-carry-alternatives` — every decision record names at least one rejected alternative with the constraint that eliminated it, or states explicitly that none was considered and why (decisions.md, each ADR)
- `decisions-carry-consequences` — every decision record states at least one cost, limitation, or thing it forecloses — not only benefits (decisions.md, each ADR)
- `decisions-have-revisit-conditions` — every decision record names the condition under which it should be reopened — a volume, a date, or a change in a dependency (decisions.md, each ADR)
- `trust-boundaries-drawn` — the threat model names each boundary where control changes hands, and each data class with who may read and change it (§8 Security)
- `threats-name-consequences` — every threat states what specifically happens if it fires, naming the data and the party, rather than a category such as breach or injection (§8 Security)
- `accepted-risks-owned` — every accepted risk names the person who accepted it and the date (§8 Security)
- `mitigations-are-testable` — every mitigation is phrased as something QA could attempt and observe, rather than as an instruction to implement (§8 Security)
- `nonfunctional-targets-are-numbers` — every non-functional target states a number and how it will be measured, or is recorded as not committed (§7 Non-functional targets)
- `existing-system-constraints-carried` — for a brownfield engagement, every constraint from the as-is assessment appears in the design or is explicitly addressed (§3 Constraints, as-is assessment §6)
- `summary-readable-cold` — the executive summary names the approach, the decisions that matter most, what it costs to run and what it does not attempt, and §1–§2 use the client's names for their systems with no unexplained acronym (§1 Executive summary, §2 Context)
- `buildable-in-slices` — whether the Epics in the approved backlog can each be built and demonstrated against this design, rather than requiring most of the architecture to exist first — judged by FDE
- `operable-by-this-client` — whether the client's own team could run, monitor, and recover this — as opposed to whether it is well designed in the abstract — judged by EA
- `decisions-worth-recording` — whether each decision recorded would genuinely be expensive to reverse, and whether any decision of that kind is missing — judged by FDE

## Weakest points

1. **Operability still rests on a support partner who does not exist yet**, and who now needs Azure and TypeScript/Node skills. The partner is a precondition, not a blocker (Q-07).
2. **Epic Reviews will pass things Stage 2 can still fail.** Lockout, real delivery, ledger immunity, true concurrency and search speed are proved only in CI on SQL Server or in Azure (§4.7, §5.6). Stage 2 has no date.
3. **Two database engines.** The SQLite and SQL Server migrations can drift apart. Contract tests on both catch drift in behaviour, not in performance.
4. **Business Central facts are from general knowledge and list prices**, marked "to confirm with a Business Central partner" where uncertain (for example the import behaviour behind story-01-01 c4). The recommendation does not rest on any single one of them: it rests on C-12.
5. **The two largest unit prices come from secondary sources:** P0v3 at about US$140 per instance, and General Purpose serverless at about US$0.522 per vCore-hour. Together they are more than two thirds of the ≈ US$540–710 total. The Power Pages comparison assumes all 3,000 reseller users are active every month.
9. **The dual-engine design already hid one defect**: a full-text index on a ledger table, which SQL Server forbids. The author found it by checking Microsoft's documentation, not by any test. It is fixed, but it shows that SQL Server contract tests must run from the first story (ADR-12).
6. **Sizing is still assumed** (NF-08). The region and the data protection law are still open (NF-07, R-04).
7. **ADR-10's rejected alternative has no stated reason yet.** The FDE gives it at the gate.
8. **The launchers named in the demo topology do not exist yet.** They are epic-01 build work, and `raise env check` reports them missing until then.
