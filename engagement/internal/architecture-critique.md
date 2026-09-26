# Critique — Bow Electronics Reseller Portal

**Status**: Final for the gate · **Prepared by**: Yash Dixit (reviewing persona) · **For**: the g3-architecture decision

## 1. What was challenged

**Under critique:** `artifacts/architecture.md`, `artifacts/decisions.md` (ADR-01 to ADR-10) and `artifacts/demo-topology.md`, read against the approved BRD and backlog, `inputs/brief.md` and the engagement's lessons.

**Reviewer.** A differently composed persona, a sceptical delivery lead and security tester who did not write the design. It ran on a **second model** (Claude Sonnet; the author was Claude Opus). What was diversified is the model and the persona. The inputs were the same. It had read-only access.

**Lenses:**
- **Pre-mortem:** the portal has failed a year after go-live; why?
- **Red-team:** attack every trust boundary, and look for requirements weakened in silence.
- **Socratic consistency check:** decision prose against the data model, the component table and traceability; every cross-reference resolved; the arithmetic checked.

## 2. Where it is weakest

Ranked. Each finding shows what was done about it.

1. **The received time for rep-entered requests corrupts go-live day** (pre-mortem). Requests re-entered from the Excel log on go-live day (NF-05) take the go-live timestamp. If portal requests arrive first, the re-entered requests queue behind them, on the day prioritisation matters most. This engagement's own backlog lesson named this failure, and the first draft had only deferred it (§11 said "See the critique"). *Resolved:* the FDE decided on re-entry in arrival order before resellers get access (architecture §5.2, §10 runbook 6). The remaining cost is that the Waiting column counts from go-live for those requests, and Jensen Huang confirms at the gate that this is acceptable.
2. **No threat covered guessing passwords or one-time codes at sign-in** (red-team). T-11 covered only forwarded invitations. *Fixed:* T-20 added, relying on External ID's lockout, with a QA attempt.
3. **"No web application firewall" was prose, not an accepted risk** (consistency). *Fixed:* it is now R-06, provisionally accepted by the FDE with a revisit condition, and §8.4 points to it.
4. **The demo topology gave technical Azure and Entra setup to a stakeholder, at a client with no IT team** (consistency, C-05 against `demo-topology.md`). *Resolved by the FDE:* Bow's Microsoft 365 administrator performs these steps, following the FDE's written instructions. Elon Musk owns naming that person (Q-06). **Residual:** if Bow has no such administrator after all, epic-01's timeline does not hold, and that is the first thing to confirm with Elon Musk.
5. **A rep adding a caller to a reseller weakens the admin's gatekeeping in BR-02** (red-team). D2-C2 notifies the admin after the fact rather than asking first. This was already disclosed as R-03. The critique asks that it be ratified explicitly rather than read as a footnote. *Carried:* R-03 goes to Elon Musk and Jensen Huang by name at the gate.
6. **The support partner is the largest running cost and a go-live precondition, but has no figure, no procurement date and no fallback** (pre-mortem). *Resolved by the FDE:* it is a precondition, not a blocker, with interim support from the delivery team for a period agreed in writing before go-live (architecture §10, Q-07). **Residual:** until the partner exists, Bow's ability to recover the system rests on the delivery team. The self-assessment keeps `operable-by-this-client` as a Fail for exactly this reason.

**Raised after the critique by a later decision.** The FDE chose TypeScript on Node.js over the recommended C# (ADR-10). This brings cross-site request forgery into play (T-21 added, with a QA attempt). The support partner now also needs Node skills, which narrows the field among Microsoft-ecosystem partners. ADR-10 records C# as the rejected alternative, and the FDE's reason is to be stated at the gate.

## 3. What survives the challenge

- ADR-04 (append-only ledger), ADR-05 (copy on start), ADR-06 (random IDs) and ADR-08 (one status, Expired worked out when read) were checked line by line against §5 and stories 03-01, 05-04 c5, 05-05 and 05-06. No contradiction was found. "Still listed with status Expired in its received-time position" fits the read-time design.
- The ID arithmetic in ADR-06 checks out. 31⁸ is about 853 billion; 1.8 million draws give about 1.95 expected repeats.
- T-01, T-02 and T-06 (isolation between resellers) are well formed and can genuinely be executed by QA.
- Every sampled story and section reference resolves (16 stories checked). No component lacks a trace.
- The absence of a bulk loader is flagged honestly as a go-live risk (Q-05), not hidden.

## 4. Open questions for the decider

All were put to Yash Dixit (FDE) in this session on 2026-09-26, each with a recommended answer. The decisions are recorded in architecture §11.

| # | Question | Recommended | Decided |
|---|---|---|---|
| 1 | Received time for re-entered requests (Q-02) | Re-enter in arrival order before resellers get access | As recommended |
| 2 | Who performs Azure and Entra setup before a partner exists | The FDE's team under an interim statement of work | **Bow's Microsoft 365 administrator** (the FDE's own choice) |
| 3 | Record R-01 to R-06 as provisionally accepted by the FDE | Yes | As recommended |
| 4 | Language and framework (Q-01) | C# on ASP.NET Core | **TypeScript on Node.js** (the FDE's own choice); ADR-10 rewritten |
| 5 | Time zone for expiry (Q-03) | Bow's head-office zone | As recommended |
| 6 | Availability N-05 (Q-04) | 99.5 %, business hours | As recommended |
| 7 | Bulk loader (Q-05) | Count first, keep as approved | As recommended |
| 8 | Support partner as a go-live blocker | Keep as a blocker | **Precondition, not blocker** (the FDE's own choice) |

**Still for the gate** (Elon Musk and Jensen Huang):
- ratify or refuse R-01 to R-06;
- name Bow's Microsoft 365 administrator and the ERP owner;
- confirm the head-office time zone;
- hear the FDE's reason for TypeScript;
- confirm N-05 and the Waiting-column cost.

## 5. Reconciliation (revisions only)

This is not a revision. The four checks were run anyway on the whole artifact set, because the critique produced them.

| Check | Result | Where |
|---|---|---|
| Referent existence — every "defined in …" claim resolves to a definition | No dangling reference in 16 sampled stories and all § cross-references. The one deferral that pointed nowhere ("See the critique", §11 Q-02) was replaced by a decision | architecture §11 |
| Reverse traceability — no component, table or endpoint that no story demands | Every §4 component traces (§9.2). "No web application firewall" had no anchor and is now R-06. T-21's anti-forgery token traces to ADR-10 and the backlog's "sent directly" criteria | architecture §8.3, §9.2 |
| Cross-artifact synthesis — assessment constraints re-joined to every new operational claim | Found C-05 ("no IT team") contradicting the topology's setup owners. Resolved by naming Bow's Microsoft 365 administrator as the performer. The baseline in `assessment.md` now carries C-01, C-02, C-05 and C-10 | demo-topology.md; assessment.md |
| Internal consistency — decision prose against the data model and the component table | ADR-04, 05, 06 and 08 are consistent with §5. §8.3 and §8.4 were inconsistent in how rigorously accepted risks were recorded, now fixed. After the TypeScript decision, ADR-01, ADR-10, §4 and §6 were re-aligned; no remaining mention of the rejected stack outside ADR-10's alternatives and §11 | decisions.md; architecture §4, §6 |
